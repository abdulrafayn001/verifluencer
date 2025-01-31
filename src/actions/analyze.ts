"use server";

interface AnalyzeRequest {
  prompt: string;
  options?: {
    temperature?: number;
    max_tokens?: number;
  };
}

export async function analyzeContent(request: AnalyzeRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-huge-128k-online",
        messages: [
          {
            role: "system",
            content:
              'You are a JSON-only response bot. You must respond with ONLY a valid JSON object and no other text. The JSON must follow this format: { "claims": [{ "statement": string, "category": string, "confidence": number, "references": string[], "status": "verified" | "questionable" | "debunked" }] }',
          },
          {
            role: "user",
            content: request.prompt,
          },
        ],
        max_tokens: request.options?.max_tokens || 1000,
        temperature: request.options?.temperature || 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    const content = data.choices[0].message.content;
    console.log("Message Content:", content);

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;

      const parsedContent = JSON.parse(jsonContent);
      return parsedContent;
    } catch (parseError) {
      console.error("Failed to parse content:", content);
      throw new Error("Invalid response format from AI");
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze content");
  }
}
