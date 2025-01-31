export interface Influencer {
  id: string;
  name: string;
  category: string;
  trustScore: number;
  followers: string;
  verifiedClaims: number;
  trend: "up" | "down";
  imageUrl: string;
}

export interface ResearchConfig {
  mode: "specific" | "discover";
  timeRange: "week" | "month" | "year" | "all";
  influencerName?: string;
  claimsPerInfluencer: number;
  productsPerInfluencer: number;
  verifyWithJournals: boolean;
  selectedJournals: string[];
  notes?: string;
  includeRevenueAnalysis: boolean;
}

export interface HealthClaim {
  id: string;
  influencerId: string;
  content: string;
  category: string;
  verificationStatus: "verified" | "questionable" | "debunked";
  confidenceScore: number;
  sourceUrl: string;
  journalReferences: string[];
}

export interface EnrichedHealthClaim extends HealthClaim {
  keywords: string[];
  semanticVector?: number[];
  impactScore: number;
  claimContext: {
    originalText: string;
    timestamp: string;
    engagement: number;
  };
}

export interface ClaimSimilarity {
  originalClaimId: string;
  duplicateClaimId: string;
  similarityScore: number;
  matchedKeywords: string[];
}

export interface InfluencerProfile {
  id: string;
  username: string;
  name: string;
  description: string;
  verified: boolean;
  profileImageUrl: string;
  followerCount: number;
  isHealthInfluencer: boolean;
  healthCategories: string[];
  healthScore: number;
  credentials: string[];
}

export interface AnalysisResults {
  profile: InfluencerProfile;
  claims: HealthClaim[];
  trustScore: number;
  totalClaimsFound: number;
  analyzedClaims: number;
}

export interface TwitterProfile {
  id: string
  description: string
  name: string
  username: string
  verified: boolean
  public_metrics: PublicMetrics
  profile_image_url: string
}

interface PublicMetrics {
  followers_count: number
  following_count: number
  tweet_count: number
  listed_count: number
  like_count: number
  media_count: number
}

