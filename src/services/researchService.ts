import { processClaims } from "../actions/transfarmer";
import { Tweet, fetchUserTweets } from "../actions/twitter";
import { HealthClaim, ResearchConfig } from "../types";
import { identifyHealthInfluencer } from "./influencerIdentificationService";
import { insertInfluencerRecord } from "./influencerRankingService";
import { initializePerplexityAPI } from "./perplexityService";

async function fetchInfluencerContent(
  influencerName: string | undefined,
  timeRange: string,
): Promise<string> {
  const perplexity = initializePerplexityAPI();

  const searchPrompt = `
    Find the most significant health-related claim from ${influencerName} within the ${timeRange} timeframe.
    Focus on claims about:
    - Nutrition
    - Medicine
    - Mental Health
    - Fitness
    
    Return the claim in JSON format with no additional text.
  `;

  const response = await perplexity.analyze(searchPrompt);
  return response.claims.map(c => c.statement).join("\n\n");
}

async function verifyClaims(
  claims: HealthClaim[],
  journals: string[],
): Promise<HealthClaim[]> {
  const perplexity = initializePerplexityAPI();
  const verifiedClaims: HealthClaim[] = [];

  // Process all claims, not just the first one
  const verificationPromises = claims.map(async claim => {
    const prompt = `
      Verify this health claim against scientific literature:
      "${claim.content}"
      
      Journals to check: ${journals.join(", ")}
      
      Respond with a JSON object containing:
      {
        "claims": [{
          "statement": "${claim.content}",
          "category": "Nutrition" | "Medicine" | "Mental Health" | "Fitness",
          "confidence": number between 0-100,
          "references": array of journal citations,
          "status": "verified" | "questionable" | "debunked"
        }]
      }
    `;

    const response = await perplexity.analyze(prompt);
    const result = response.claims[0];

    return {
      ...claim,
      verificationStatus: result.status,
      confidenceScore: result.confidence,
      journalReferences: result.references,
    };
  });

  const results = await Promise.all(verificationPromises);
  verifiedClaims.push(...results);

  return verifiedClaims;
}

function calculateTrustScore(claims: HealthClaim[]): number {
  if (!claims.length) return 0;

  const weights = {
    verified: 1,
    questionable: 0.5,
    debunked: 0,
  };

  const totalScore = claims.reduce((sum, claim) => {
    return sum + weights[claim.verificationStatus] * claim.confidenceScore;
  }, 0);
  console.log("totalScore: ", totalScore);

  return totalScore / claims.length / 100;
}

interface EnrichedTweet {
  id: string;
  text: string;
  healthScore: number;
  category: string;
  keywords: string[];
  metrics: {
    engagement: number;
    credibility: number;
  };
}

type TweetResearchResult = {
  text: string;
  healthScore: number;
  category: string;
  keywords: string[];
  metrics: {
    engagement: number;
    credibility: number;
  };
};

async function processHealthTweets(tweets: Tweet[]): Promise<EnrichedTweet[]> {
  const perplexity = initializePerplexityAPI();
  const processedTweets: EnrichedTweet[] = [];

  const BATCH_SIZE = 5;
  for (let i = 0; i < tweets.length; i += BATCH_SIZE) {
    const batch = tweets.slice(i, i + BATCH_SIZE);
    const prompt = `
      Analyze these tweets for health-related claims using medical and scientific knowledge.
      For each tweet, provide detailed analysis:
      
      Tweets:
      ${batch.map(t => t.text).join("\n---\n")}
      
      Return JSON:
      {
        "analysis": [{
          "text": "original tweet",
          "healthScore": 0-100 (based on scientific validity),
          "category": "specific detailed health category",
          "keywords": ["medical", "scientific", "terms"],
          "metrics": {
            "engagement": 0-100,
            "credibility": 0-100
          }
        }]
      }
    `;

    try {
      const response = (await perplexity.analyze(prompt)) as unknown as {
        analysis: TweetResearchResult[];
      };

      const validTweets = response.analysis
        .filter((t: any) => t.healthScore > -1)
        .map((t: any) => ({
          id: crypto.randomUUID(),
          text: t.text,
          healthScore: t.healthScore,
          category: t.category,
          keywords: t.keywords,
          metrics: t.metrics,
        }));

      processedTweets.push(...validTweets);
    } catch (error) {
      console.error(`Batch ${i} analysis failed:`, error);
      continue;
    }
  }

  return processedTweets;
}

async function extractHealthClaims(
  tweets: EnrichedTweet[],
): Promise<HealthClaim[]> {
  const perplexity = await initializePerplexityAPI();
  const allClaims: HealthClaim[] = [];

  const BATCH_SIZE = 3;
  for (let i = 0; i < tweets.length; i += BATCH_SIZE) {
    const batch = tweets.slice(i, i + BATCH_SIZE);

    const prompt = `
      Extract specific health claims from these tweets.
      Consider medical accuracy, scientific basis, and potential impact.
      
      Tweets:
      ${batch.map(t => `Text: ${t.text}\nKeywords: ${t.keywords.join(", ")}`).join("\n---\n")}
      
      Return JSON:
      {
        "claims": [{
          "statement": "precise health claim",
          "category": "specific detailed category",
          "confidence": 0-100,
          "keywords": ["medical terms"],
          "sourceText": "original tweet",
          "impactScore": 0-100
        }]
      }
    `;

    try {
      const response = await perplexity.analyze(prompt);
      const claims = formatClaims(response, batch);
      allClaims.push(...claims);
    } catch (error) {
      console.error(`Batch ${i} claim extraction failed:`, error);
      continue;
    }
  }

  return allClaims;
}

function formatClaims(
  response: any,
  sourceTweets: EnrichedTweet[],
): HealthClaim[] {
  const uniqueClaims = new Map();

  response.claims.forEach((claim: any) => {
    const key = claim.statement.toLowerCase().trim();
    if (!uniqueClaims.has(key)) {
      uniqueClaims.set(key, {
        id: crypto.randomUUID(),
        influencerId: "",
        content: claim.statement,
        category: claim.category,
        verificationStatus: "questionable",
        confidenceScore: claim.confidence,
        sourceUrl:
          sourceTweets.find(t => t.text.includes(claim.sourceText))?.id || "",
        journalReferences: [],
        keywords: claim.keywords,
        impactScore: claim.impactScore,
      });
    }
  });

  return Array.from(uniqueClaims.values());
}

export async function analyzeInfluencer(config: ResearchConfig) {
  if (!config.influencerName) {
    return;
  }
  try {
    const profile = await identifyHealthInfluencer(config.influencerName);

    if (!profile.isHealthInfluencer) {
      throw new Error(
        `${profile.username} does not appear to be a health influencer (Score: ${profile.healthScore.toFixed(2)})`,
      );
    }

    const tweets = await fetchUserTweets(
      profile.id,
      config.timeRange,
      config.claimsPerInfluencer,
    );

    // Process and filter health-related tweets
    const processedTweets = await processHealthTweets(tweets);

    let data = await processClaims(processedTweets);
    let uniqueEmbeddingClaims = await data.data;

    // Extract specific health claims
    const claims = await extractHealthClaims(uniqueEmbeddingClaims);

    // Verify claims if enabled
    const verifiedClaims = config.verifyWithJournals
      ? await verifyClaims(claims, config.selectedJournals)
      : claims;

    // Calculate trust score
    const trustScore = calculateTrustScore(verifiedClaims);

    // Update analytics with verified claims and trust score
    await insertInfluencerRecord({
      name: profile.username,
      followers: profile.followerCount,
      verified_claims: verifiedClaims.length,
      trust_score: trustScore * 100,
      category: "Health",
      trend: "stable",
    });

    return {
      profile,
      claims: verifiedClaims,
      trustScore,
      totalClaimsFound: claims.length,
      analyzedClaims: verifiedClaims.length,
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to analyze influencer content",
    );
  }
}
