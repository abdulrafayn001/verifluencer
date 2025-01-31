/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchTwitterUser } from "@/src/actions/twitter";

import { initializePerplexityAPI } from "./perplexityService";

export interface InfluencerProfile {
  id: string;
  username: string;
  name: string;
  description: string;
  verified: boolean;
  profileImageUrl: string;
  followerCount: number;
  isHealthInfluencer: boolean;
  healthScore: number;
  confidenceScore: number;
}

const FOLLOWER_THRESHOLDS = {
  minimal: 1000,
  moderate: 10000,
  significant: 100000,
  large: 1000000,
};

function calculateInitialScore(userData: any): number {
  const followerCount = userData.public_metrics?.followers_count || 0;

  let score = 0;

  // Follower count scoring
  if (followerCount >= FOLLOWER_THRESHOLDS.large) score += 0.2;
  else if (followerCount >= FOLLOWER_THRESHOLDS.significant) score += 0.15;
  else if (followerCount >= FOLLOWER_THRESHOLDS.moderate) score += 0.1;
  else if (followerCount >= FOLLOWER_THRESHOLDS.minimal) score += 0.05;

  // Verification bonus
  if (userData.verified) {
    score += 0.2;
  }

  return Math.min(score, 1);
}

async function performLLMAnalysis(userData: any): Promise<{
  isHealthInfluencer: boolean;
  confidence: number;
  analysis: string;
}> {
  const perplexity = initializePerplexityAPI();

  const prompt = `
    Analyze this Twitter profile and determine if its a health influencer:
    Name: ${userData.name}
    Description: ${userData.description}
    Verified: ${userData.verified}
    Followers: ${userData.public_metrics?.followers_count}

    Respond with JSON:
    {
      "isHealthInfluencer": boolean,
      "confidence": number (0-100),
      "analysis": "brief explanation of the decision"
    }
  `;

  const response = await perplexity.analyze(prompt);

  return response as any;
}

export async function identifyHealthInfluencer(
  searchTerm: string,
): Promise<InfluencerProfile> {
  try {
    const cleanSearchTerm = searchTerm.startsWith("@")
      ? searchTerm.substring(1)
      : searchTerm;
    const userData = await fetchTwitterUser(cleanSearchTerm);

    if ("errors" in userData && userData.errors?.at(0)) {
      const error = userData.errors?.at(0);
      console.error(
        "Getting errors while searching user on Twitter: ",
        userData.errors,
      );
      throw new Error(error?.detail || "Unkown Error");
    }

    const score = calculateInitialScore(userData.data);

    // Only proceed with LLM analysis if initial score is promising
    let llmAnalysis = {
      isHealthInfluencer: false,
      confidence: 0,
      analysis: "",
    };

    llmAnalysis = await performLLMAnalysis(userData.data);

    // Combine both analyses
    const finalScore = (score + llmAnalysis.confidence / 100) / 2;

    return {
      id: userData.data.id,
      username: userData.data.username,
      name: userData.data.name,
      description: userData.data.description,
      verified: userData.data.verified,
      profileImageUrl: userData.data.profile_image_url,
      followerCount: userData.data.public_metrics?.followers_count || 0,
      isHealthInfluencer: finalScore > 0.5,
      healthScore: finalScore,
      confidenceScore: llmAnalysis.confidence,
    };
  } catch (error) {
    console.error("Error in identifyHealthInfluencer: ", error);
    throw new Error(
      `Failed to identify influencer: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
