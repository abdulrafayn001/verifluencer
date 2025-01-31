import { supabase } from "@/src/lib/supabaseClient";
import { HealthClaim } from "@/src/types";

// Function to fetch claims from the database
export async function fetchClaimsFromDatabase(): Promise<HealthClaim[]> {
  const { data, error } = await supabase.from("health_claims").select("*");

  if (error) {
    console.error("Error fetching claims:", error);
    throw new Error("Failed to fetch claims");
  }

  return data || [];
}

// Function to insert claims into the database
export async function insertClaimsIntoDatabase(
  claims: HealthClaim[],
): Promise<void> {
  const { error } = await supabase.from("health_claims").insert(claims);

  if (error) {
    console.error("Error inserting claims:", error);
    throw new Error("Failed to insert claims");
  }
}
