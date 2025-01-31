import { ClaimSimilarity, EnrichedHealthClaim } from "../types";
import { tensorflowService } from "./tensorflowService";

export class ClaimProcessor {
  private processedClaims: EnrichedHealthClaim[] = [];
  private readonly SIMILARITY_THRESHOLD = 0.85;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async processClaim(claim: EnrichedHealthClaim | any): Promise<{
    isUnique: boolean;
    similarity?: ClaimSimilarity;
  }> {
    // Generate semantic vector for the new claim
    const vector = await tensorflowService.generateEmbedding(claim.content);
    claim.semanticVector = vector;

    // Check for duplicates
    const duplicate = await this.findDuplicate(claim);
    if (duplicate) {
      return {
        isUnique: false,
        similarity: duplicate,
      };
    }

    this.processedClaims.push(claim);
    return { isUnique: true };
  }

  private async findDuplicate(
    newClaim: EnrichedHealthClaim,
  ): Promise<ClaimSimilarity | null> {
    for (const existingClaim of this.processedClaims) {
      const similarity = await this.calculateSimilarity(
        newClaim,
        existingClaim,
      );

      if (similarity.similarityScore > this.SIMILARITY_THRESHOLD) {
        return similarity;
      }
    }
    return null;
  }

  private async calculateSimilarity(
    claim1: EnrichedHealthClaim,
    claim2: EnrichedHealthClaim,
  ): Promise<ClaimSimilarity> {
    const similarityScore = await tensorflowService.calculateCosineSimilarity(
      claim1.semanticVector!,
      claim2.semanticVector!,
    );

    const matchedKeywords = claim1.keywords.filter(keyword =>
      claim2.keywords.includes(keyword),
    );

    return {
      originalClaimId: claim2.id,
      duplicateClaimId: claim1.id,
      similarityScore,
      matchedKeywords,
    };
  }
}
