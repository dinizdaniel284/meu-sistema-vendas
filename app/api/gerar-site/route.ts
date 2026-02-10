import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// ⚠️ Em produção, o ideal é usar a SERVICE_ROLE_KEY no backend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type GerarSiteBody = {
  produto: string;
  whatsapp?: string;
  userId: string;
};

export async function POST(req: Request) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const body = (await req.json()) as GerarSiteBody;
    const { produto, whatsapp, userId } = body;

    if (!produto || !userId) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // 🧠 PROMPT OTIMIZADO
    const prompt = `Você é um copywriter de elite especialista em VSL e Landing Pages de alta conversão.
Gere um material de vendas luxuoso para o produto: "${produto}".

Regras:
1. No campo "guia_completo", use pelo menos 3 parágrafos separados por \\n\\n.
2. Os "beneficios" devem ser curtos e agressivos (foco na dor/solução).
3. A "keyword_ingles" deve ser focada em fotografia comercial para busca de imagem.

Retorne APENAS o JSON:
{
  "headline": "Título que gera desejo imediato",
  "subheadline": "Frase que quebra objeções",
  "guia_completo": "Texto persuasivo longo...",
  "beneficios": ["Benefício 1", "Benefício 2", "Benefício 3"],
  "sobre_nos": "História de autoridade do especialista",
  "keyword_ingles": "ex: luxury skin care product"
}`;

    let chatCompletion: any = null;
    let retries = 2;

    while (retries >= 0) {
      try {
        chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          response_format: { type: "json_object" },
        });
        break;
      } catch (error) {
        if (retries === 0) {
          throw new Error("IA instável, tente novamente.");
        }
        retries--;
        await new Promise((res) => setTimeout(res, 1500));
      }
    }

    const responseText =
      chatCompletion?.choices[0]?.message?.content || "{}";

    // Limpa possíveis ```json ```
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(cleanJson);

    // 🖼️ Imagem padrão (URL REAL, não markdown)
    let urlFinal =
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop";

    // 🔍 Busca no Pexels (se tiver chave)
    if (process.env.PEXELS_API_KEY) {
      try {
        const termoBusca = aiData.keyword_ingles || produto;

        const pexelsRes = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(
            termoBusca
          )}&per_page=1&orientation=landscape`,
          {
            headers: {
              Authorization: process.env.PEXELS_API_KEY,
            },
          }
        );

        if (pexelsRes.ok) {
          const pexelsData = await pexelsRes.json();
          if (pexelsData.photos?.length > 0) {
            urlFinal = pexelsData.photos[0].src.large2x;
          }
        }
      } catch (e) {
        console.error("Erro ao buscar imagem no Pexels:", e);
      }
    }

    // 📦 Conteúdo final salvo no banco
    const conteudoFinal = {
      ...aiData,
      imagem: urlFinal,
      whatsapp: whatsapp ? whatsapp.replace(/\D/g, "") : null,
    };

    // 🏷️ Gera slug limpo e curto
    const tagBusca = produto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 30);

    const slugUnico = `${tagBusca}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    const { error: insertError } = await supabase.from("sites").insert([
      {
        slug: slugUnico,
        conteudo: conteudoFinal,
        user_id: userId,
      },
    ]);

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      url: `/s/${slugUnico}`,
      slug: slugUnico,
      conteudo: conteudoFinal,
    });
  } catch (err) {
    console.error("Erro Fatal API:", err);
    return NextResponse.json(
      { error: "Erro ao processar sua inteligência de vendas." },
      { status: 500 }
    );
  }
}