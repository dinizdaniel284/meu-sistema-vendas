import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function mockSite(prompt: string) {
  return {
    html: `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Site Gerado</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; background: #f9fafb; }
    h1 { color: #111827; }
    p { color: #374151; }
    .card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,.05); max-width: 600px; }
    button { background: #2563eb; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Site gerado automaticamente</h1>
    <p><strong>Prompt:</strong> ${prompt}</p>
    <p>Este é um fallback porque a IA principal está indisponível no momento.</p>
    <button>Entrar em contato</button>
  </div>
</body>
</html>
    `,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt não informado" }, { status: 400 });
    }

    let aiResponseText: string | null = null;

    try {
      const completion = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: `Gere um site HTML simples com base neste pedido: ${prompt}`,
      });

      aiResponseText =
        completion.output_text ||
        completion.output?.[0]?.content?.[0]?.text ||
        null;
    } catch (openaiError: any) {
      console.error("⚠️ OpenAI indisponível. Usando fallback.");
      console.error(openaiError?.status, openaiError?.code);
    }

    if (!aiResponseText) {
      const fallback = mockSite(prompt);
      return NextResponse.json({ html: fallback.html, fallback: true });
    }

    return NextResponse.json({ html: aiResponseText, fallback: false });
  } catch (error) {
    console.error("❌ ERRO GERAL API gerar-site:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar site." },
      { status: 500 }
    );
  }
}
