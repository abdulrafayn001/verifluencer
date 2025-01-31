import * as use from "@tensorflow-models/universal-sentence-encoder";
import * as tf from "@tensorflow/tfjs";

interface TweetClaim {
  id: string;
  text: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

interface ClaimGroup {
  representative: TweetClaim;
  similar: TweetClaim[];
}

interface uniqueClaimsProps {
  representative: TweetClaim;
}

export class ClaimsSimilarityChecker {
  private model: use.UniversalSentenceEncoder | null = null;
  private similarityThreshold: number;

  constructor(threshold: number = 0.85) {
    this.similarityThreshold = threshold;
  }

  async initialize() {
    if (!this.model) {
      this.model = await use.load();
    }
  }

  private async getEmbeddings(claims: TweetClaim[]): Promise<any> {
    if (!this.model) {
      throw new Error("Model not initialized");
    }

    const texts = claims
      .map(claim => {
        if (!claim.text) {
          console.warn("Tweet with missing text:", claim);
          return "";
        }
        return String(claim.text).trim();
      })
      .filter(text => text.length > 0);

    if (texts.length === 0) {
      throw new Error("No valid text content found in claims");
    }

    return await this.model.embed(texts);
  }

  private async calculateSimilarityMatrix(
    embeddings: tf.Tensor,
  ): Promise<number[][]> {
    const normalizedEmbeddings = tf.div(
      embeddings,
      tf.norm(embeddings, 2, 1, true),
    );

    const similarityMatrix = tf.matMul(
      normalizedEmbeddings,
      normalizedEmbeddings,
      false,
      true,
    );

    const matrix = (await similarityMatrix.array()) as number[][];

    normalizedEmbeddings.dispose();
    similarityMatrix.dispose();

    return matrix;
  }

  async findUniqueClaims(claims: TweetClaim[]): Promise<any> {
    try {
      await this.initialize();

      if (!Array.isArray(claims)) {
        console.error("Claims is not an array:", claims);
        throw new Error("Claims must be an array");
      }

      if (claims.length === 0) {
        console.error("Empty claims array provided");
        throw new Error("Claims array is empty");
      }

      // Validate claims array with detailed logging
      const validClaims = claims.filter((claim, index) => {
        if (!claim) {
          console.warn(`Claim at index ${index} is null or undefined`);
          return false;
        }

        if (typeof claim !== "object") {
          console.warn(`Claim at index ${index} is not an object:`, claim);
          return false;
        }

        if (!claim.text) {
          console.warn(`Claim at index ${index} has no text:`, claim);
          return false;
        }

        const text = String(claim.text).trim();
        if (text.length === 0) {
          console.warn(
            `Claim at index ${index} has empty text after trimming:`,
            claim,
          );
          return false;
        }

        return true;
      });

      if (validClaims.length === 0) {
        throw new Error(
          `No valid claims provided after validation. Original claims count: ${claims.length}`,
        );
      }

      const embeddings = await this.getEmbeddings(validClaims);
      const similarityMatrix = await this.calculateSimilarityMatrix(embeddings);

      embeddings.dispose();

      const uniqueGroups: ClaimGroup[] = [];
      const processedIndices = new Set<number>();

      for (let i = 0; i < validClaims.length; i++) {
        if (processedIndices.has(i)) continue;

        const similarIndices: number[] = [];
        for (let j = 0; j < validClaims.length; j++) {
          if (
            i !== j &&
            !processedIndices.has(j) &&
            similarityMatrix[i][j] >= this.similarityThreshold
          ) {
            similarIndices.push(j);
            processedIndices.add(j);
          }
        }

        uniqueGroups.push({
          representative: validClaims[i],
          similar: similarIndices.map(idx => validClaims[idx]),
        });
        processedIndices.add(i);
      }

      const uniqueClaims = uniqueGroups.map(group => group.representative);

      return uniqueClaims;
    } catch (error) {
      console.error("Error in findUniqueClaims:", error);
      throw error;
    }
  }
}
