"use server";

import { revalidatePath } from "next/cache";

import { ClaimsSimilarityChecker } from "../services/transfarmerService";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function processClaims(claims: any) {
  try {
    const checker = new ClaimsSimilarityChecker();
    const uniqueClaims = await checker.findUniqueClaims(claims);
    revalidatePath("/your-path"); // Replace with your actual path
    return { success: true, data: uniqueClaims };
  } catch (error) {
    console.error("Error processing claims:", error);
    return { success: false, error: "Failed to process claims" };
  }
}
