import { supabase } from "@/src/lib/supabaseClient";

interface InfluencerData {
  name: string;
  followers: number;
  verified_claims: number;
  trust_score: number;
  category: string;
  trend: "up" | "down" | "stable";
}

export async function insertInfluencerRecord(
  data: InfluencerData,
): Promise<void> {
  try {
    const { data: D, error } = await supabase
      .from("final_result")
      .insert({
        ...data,
      })
      .select();

    if (error) {
      console.log("error", error);

      throw error;
    }
  } catch (error) {
    console.error("Error inserting influencer record:", error);
    throw new Error("Failed to insert influencer record");
  }
}

export async function getAllInfluencerRecords(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("final_result")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching influencer records:", error);
    throw new Error("Failed to fetch influencer records");
  }
}
