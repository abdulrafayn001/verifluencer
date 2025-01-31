"use server";

import { TweetV2 } from "twitter-api-v2";

import { TwitterProfile } from "../types";

export type TimeRange = "week" | "month" | "year" | "all";
export type HealthCategory = "Medicine" | "Nutrition" | "Mental_Health" | "Fitness";

export interface Tweet
  extends Required<Pick<TweetV2, "id" | "text" | "created_at">> {
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

export interface Influencer {
  username: string;
  followerCount: number;
  tweets: Tweet[];
}

interface UserData {
  id: string;
  username: string;
  public_metrics?: {
    followers_count: number;
  };
}

interface TwitterResponse<T> {
  data: T;
  includes?: {
    users?: UserData[];
  };
  errors?: Array<{ detail: string }>;
}
function getDateRange(timeRange: TimeRange) {
  const endDate = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case "week":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case "all":
      startDate.setFullYear(2010);
      break;
  }
  return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
}

export async function fetchTwitterUser(
  username: string,
): Promise<TwitterResponse<TwitterProfile>> {
  try {
    const response = await fetch(
      `https://api.x.com/2/users/by/username/${username}?user.fields=id,name,username,description,verified,profile_image_url,public_metrics`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
        next: { revalidate: 3600 },
      },
    );
    if (!response.ok) {
      throw new Error(`User ${username} not found`);
    }
    const userData = (await response.json()) as TwitterResponse<TwitterProfile>;

    return userData;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

// Update the fetchUserTweets function
export async function fetchUserTweets(
  userId: string,
  timeRange: TimeRange,
  maxTweets: number = 5,
): Promise<Tweet[]> {
  // debugger;

  try {
    const { startDate, endDate } = getDateRange(timeRange);

    const tweetsUrl = new URL(`https://api.x.com/2/users/${userId}/tweets`);
    tweetsUrl.searchParams.append("start_time", startDate);
    tweetsUrl.searchParams.append("end_time", endDate);
    tweetsUrl.searchParams.append(
      "max_results",
      String(Math.min(maxTweets, 100)),
    ); // Twitter API limit
    tweetsUrl.searchParams.append("exclude", "retweets,replies");
    tweetsUrl.searchParams.append(
      "tweet.fields",
      "created_at,public_metrics,context_annotations,entities",
    );

    const allTweets: Tweet[] = [];
    let paginationToken: string | undefined;

    // Fetch tweets with pagination until we reach maxTweets
    while (allTweets.length < maxTweets) {
      if (paginationToken) {
        tweetsUrl.searchParams.set("pagination_token", paginationToken);
      }

      const tweetsResponse = await fetch(tweetsUrl.toString(), {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
        next: { revalidate: 3600 },
      });

      if (!tweetsResponse.ok) {
        throw new Error("Failed to fetch tweets");
      }

      const tweetsData = await tweetsResponse.json();
      const tweets = tweetsData.data || [];

      allTweets.push(...tweets);

      // Check for next page
      paginationToken = tweetsData.meta?.next_token;
      if (!paginationToken || tweets.length === 0) break;
    }

    // Sort tweets by engagement and health relevance

    return allTweets.slice(0, maxTweets);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    throw error;
  }
}

export async function getFollowerCount(username: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.x.com/2/users/by/username/${username}?user.fields=public_metrics`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch follower count: ${response.statusText}`);
    }

    const userData = await response.json();
    return userData.data?.public_metrics?.followers_count || 0;
  } catch (error) {
    console.error("Error fetching follower count:", error);
    throw error;
  }
}
