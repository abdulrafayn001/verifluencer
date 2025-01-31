"use client";

import { useEffect, useState } from "react";

import { getAllInfluencerRecords } from "@/src/services/influencerRankingService";

interface InfluencerData {
  name: string;
  followers: number;
  verified_claims: number;
  trust_score: number;
  category: string;
  trend: "up" | "down" | "stable";
}

export default function Leaderboard() {
  const [influencers, setInfluencers] = useState<InfluencerData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllInfluencerRecords();
      setInfluencers(data);
    };
    fetchData();
  }, []);

  const categories = [
    "All",
    "Nutrition",
    "Fitness",
    "Medicine",
    "Mental Health",
  ];

  const stats = {
    activeInfluencers: influencers.length,
    claimsVerified: influencers.reduce(
      (acc, inf) => acc + inf.verified_claims,
      0,
    ),
    avgTrustScore:
      influencers.reduce((acc, inf) => acc + inf.trust_score, 0) /
      influencers.length,
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Influencer Trust Leaderboard
        </h1>
        <p className="text-gray-400 mb-8">
          Real-time rankings of health influencers based on scientific accuracy,
          credibility, and transparency. Updated daily using AI-powered
          analysis.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1E293B] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-2xl font-bold">
                {stats.activeInfluencers}
              </span>
            </div>
            <p className="text-gray-400">Active Influencers</p>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-2xl font-bold">{stats.claimsVerified}</span>
            </div>
            <p className="text-gray-400">Claims Verified</p>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-2xl font-bold">
                {stats.avgTrustScore.toFixed(1)}%
              </span>
            </div>
            <p className="text-gray-400">Average Trust Score</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2  mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2  rounded-full ${
                selectedCategory === category
                  ? "bg-emerald-600 text-white"
                  : "bg-[#1E293B] text-gray-400 hover:bg-[#2D3B4E]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#1E293B] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="p-4">RANK</th>
                <th className="p-4">INFLUENCER</th>
                <th className="p-4">CATEGORY</th>
                <th className="p-4">TRUST SCORE</th>
                <th className="p-4">TREND</th>
                <th className="p-4">FOLLOWERS</th>
                <th className="p-4">VERIFIED CLAIMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {influencers.map((influencer, index) => (
                <tr key={influencer.name} className="hover:bg-[#2D3B4E]">
                  <td className="p-4">#{index + 1}</td>
                  <td className="p-4 font-medium">{influencer.name}</td>
                  <td className="p-4">{influencer.category}</td>
                  <td className="p-4">
                    <span
                      className={`${
                        influencer.trust_score >= 90
                          ? "text-emerald-400"
                          : influencer.trust_score >= 80
                            ? "text-yellow-400"
                            : "text-gray-400"
                      }`}
                    >
                      {influencer.trust_score}%
                    </span>
                  </td>
                  <td className="p-4">
                    {influencer.trend === "up"
                      ? "↗"
                      : influencer.trend === "down"
                        ? "↘"
                        : "→"}
                  </td>
                  <td className="p-4">
                    {(influencer.followers / 1000).toFixed(1)}K
                  </td>
                  <td className="p-4">{influencer.verified_claims}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
