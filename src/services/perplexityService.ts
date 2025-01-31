import { analyzeContent } from "@/src/actions/analyze";

interface PerplexityConfig {
  apiKey: string;
  baseUrl: string;
}

interface PerplexityResponse {
  claims: Array<{
    statement: string;
    category: string;
    confidence: number;
    references: string[];
    status: "verified" | "questionable" | "debunked";
  }>;
  metadata: {
    sourceUrl?: string;
    analysisTimestamp: string;
  };
}

class PerplexityAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: PerplexityConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  async analyze(prompt: string): Promise<PerplexityResponse> {
    try {
      const result = await analyzeContent({
        prompt,
        options: {
          temperature: 0.1,
          max_tokens: 1000,
        },
      });

      return result;
    } catch (error) {
      console.error("Perplexity analysis failed:", error);
      throw error;
    }
  }
}

export const initializePerplexityAPI = () => {
  const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_PERPLEXITY_BASE_URL;

  if (!apiKey || !baseUrl) {
    throw new Error("Missing Perplexity API configuration");
  }

  return new PerplexityAPI({ apiKey, baseUrl });
};
