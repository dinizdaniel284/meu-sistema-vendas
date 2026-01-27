import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

async function gerarComOpenAI(produto: string) {
  const prompt = `
Você é um copywriter de elite especialista em Vendas Online. Gere um JSON para o produto: "${produto}".

REGRAS:
- Linguagem brasileira
- Headline chamativa
- Subheadline curta
- Guia completo em parágrafos
- Benefícios em bullet points
- Sobre nós institucional
- Retorne APENAS o JSON no formato:

{
  "headline": "",
  "subheadline": "",
  "guia_completo": "",
  "beneficios": [],
  "sobre_nos": ""
}
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6
  })

  const responseText = completion.choices[0].message.content || ''
  const cleanJson = responseText.replace(/```json|```/g, '').trim()
  return JSON.parse(cleanJson)
}

// 🔥 MOCK DE EMERGÊNCIA
function gerarMock(produto: string) {
  return {
    headline: `Transforme sua vida com ${produto}`,
    subheadline: 'A solução que você estava esperando',
    guia_completo:
      `O ${produto} foi desenvolvido para entregar qualidade, confiança e resultados reais.\n\nNossa missão é simplificar sua vida e oferecer uma experiência premium do início ao fim.\n\nMilhares de clientes já confiam em nossa solução.`,
    beneficios: [
      'Alta qualidade garantida',
      'Entrega rápida e segura',
      'Suporte dedicado',
      'Excelente custo-benefício'
    ],
    sobre_nos:
      'Somos uma marca focada em inovação, transparência e excelência no atendimento ao cliente.'
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { produto, whatsapp, userId } = body

    if (!produto)
      return NextResponse.json({ error: 'Produto não informado' }, { status: 400 })

    let aiData: any = null
    let modelUsed = 'mock'

    // 1️⃣ TENTA OPENAI
    try {
      aiData = await gerarComOpenAI(produto)
      modelUsed = 'openai'
    } catch (err: any) {
      console.error('⚠️ OpenAI falhou, tentando fallback...', err?.message)

      // 2️⃣ FALLBACK: MOCK
      aiData = gerarMock(produto)
      modelUsed = 'mock'
    }

    const tagBusca = produto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const urlImagemIA = `https://image.pollinations.ai/prompt/professional_studio_photography_of_${encodeURIComponent(
      tagBusca
    )}_high_quality_4k_commercial?width=1080&height=720&nologo=true`

    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(2, 8)}`

    const conteudoFinal = {
      ...aiData,
      imagem: urlImagemIA,
      whatsapp: whatsapp || null
    }

    const { error: insertError } = await supabase.from('sites').insert([
      {
        slug: slugUnico,
        conteudo: conteudoFinal,
        user_id: userId || null,
        model_used: modelUsed
      }
    ])

    if (insertError) {
      console.error('❌ Erro Supabase:', insertError)
      return NextResponse.json({ error: 'Erro ao salvar no banco' }, { status: 500 })
    }

    return NextResponse.json({
      url: `/s/${slugUnico}`,
      slug: slugUnico,
      model_used: modelUsed,
      ...conteudoFinal
    })
  } catch (err) {
    console.error('❌ Erro geral API gerar-site:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
