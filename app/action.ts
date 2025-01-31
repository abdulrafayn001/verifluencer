"use server";

import { ClaimProcessor } from "@/src/services/claimProcessingService";

export async function processHealthClaim(claimData: any) {
  try {
    const processor = new ClaimProcessor();
    const result = await processor.processClaim(claimData);
    return { success: true, result };
  } catch (error) {
    console.error("Processing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
