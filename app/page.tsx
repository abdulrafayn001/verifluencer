"use client";

import React, { useState } from "react";

import { analyzeInfluencer } from "@/src/services/researchService";
import { HealthClaim, ResearchConfig } from "@/src/types";

interface AnalysisResults {
  claims: HealthClaim[];
  trustScore: number;
  totalClaimsFound: number;
  analyzedClaims: number;
}

const SCIENTIFIC_JOURNALS = [
  "PubMed Central",
  "Nature",
  "Science",
  "Cell",
  "The Lancet",
  "JAMA Network",
  "New England Journal of Medicine",
];

export default function Home() {
  const [config, setConfig] = useState<ResearchConfig>({
    mode: "specific",
    timeRange: "month",
    claimsPerInfluencer: 50,
    productsPerInfluencer: 10,
    includeRevenueAnalysis: false,
    verifyWithJournals: true,
    selectedJournals: SCIENTIFIC_JOURNALS,
    influencerName: "",
  });
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartResearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const analysisResults = await analyzeInfluencer(config);
      setResults(analysisResults as AnalysisResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="p-8 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-200 hover:text-red-100"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="mb-8 flex items-center space-x-3">
          <button className="flex items-center text-emerald-500 hover:text-emerald-400">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">Research Tasks</h1>
        </div>

        <div className="rounded-xl bg-[#131B2C] p-6">
          <h2 className="flex items-center text-xl font-semibold mb-6">
            <svg
              className="h-5 w-5 mr-2 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Research Configuration
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              className={`rounded-lg p-6 text-left transition-all ${
                config.mode === "specific"
                  ? "bg-[#1C2A3F] border-2 border-emerald-500"
                  : "bg-[#1A2234] border-2 border-transparent hover:border-emerald-500/50"
              }`}
              onClick={() => setConfig(prev => ({ ...prev, mode: "specific" }))}
            >
              <h3 className="font-semibold mb-2">Specific Influencer</h3>
              <p className="text-sm text-gray-400">
                Research a known health influencer by name
              </p>
            </button>

            <button
              className={`rounded-lg p-6 text-left transition-all ${
                config.mode === "discover"
                  ? "bg-[#1C2A3F] border-2 border-emerald-500"
                  : "bg-[#1A2234] border-2 border-transparent hover:border-emerald-500/50"
              }`}
              onClick={() => setConfig(prev => ({ ...prev, mode: "discover" }))}
            >
              <h3 className="font-semibold mb-2">Discover New</h3>
              <p className="text-sm text-gray-400">
                Find and analyze new health influencers
              </p>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Time Range
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Last Week", value: "week" },
                  { label: "Last Month", value: "month" },
                  { label: "Last Year", value: "year" },
                  { label: "All Time", value: "all" },
                ].map(range => (
                  <button
                    key={range.value}
                    className={`py-2.5 px-4 rounded-lg transition-colors ${
                      config.timeRange === range.value
                        ? "bg-emerald-600 text-white"
                        : "bg-[#1A2234] hover:bg-[#1C2A3F]"
                    }`}
                    onClick={() =>
                      setConfig(prev => ({
                        ...prev,
                        timeRange: range.value as
                          | "week"
                          | "month"
                          | "year"
                          | "all",
                      }))
                    }
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {config.mode === "specific" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Influencer Name
                </label>
                <input
                  type="text"
                  className="w-full bg-[#1A2234] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter influencer name"
                  value={config.influencerName}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      influencerName: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Claims to Analyze Per Influencer
              </label>
              <input
                type="number"
                className="w-full bg-[#1A2234] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
                value={config.claimsPerInfluencer}
                onChange={e =>
                  setConfig(prev => ({
                    ...prev,
                    claimsPerInfluencer: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <p className="mt-1 text-xs text-gray-400">
                Recommended: 50-100 claims for comprehensive analysis
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium">
                    Include Revenue Analysis
                  </label>
                  <p className="text-xs text-gray-400">
                    Analyze monetization methods and estimate earnings
                  </p>
                </div>
                <button
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.includeRevenueAnalysis
                      ? "bg-emerald-600"
                      : "bg-gray-600"
                  }`}
                  onClick={() =>
                    setConfig(prev => ({
                      ...prev,
                      includeRevenueAnalysis: !prev.includeRevenueAnalysis,
                    }))
                  }
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      config.includeRevenueAnalysis
                        ? "translate-x-6"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium">
                    Verify with Scientific Journals
                  </label>
                  <p className="text-xs text-gray-400">
                    Cross-reference claims with scientific literature
                  </p>
                </div>
                <button
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.verifyWithJournals ? "bg-emerald-600" : "bg-gray-600"
                  }`}
                  onClick={() =>
                    setConfig(prev => ({
                      ...prev,
                      verifyWithJournals: !prev.verifyWithJournals,
                    }))
                  }
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      config.verifyWithJournals
                        ? "translate-x-6"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {config.verifyWithJournals && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">
                    Scientific Journals
                  </label>
                  <div className="flex space-x-2">
                    <button className="text-xs text-emerald-500 hover:text-emerald-400">
                      Select All
                    </button>
                    <button className="text-xs text-emerald-500 hover:text-emerald-400">
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  {SCIENTIFIC_JOURNALS.map(journal => (
                    <div
                      key={journal}
                      className="flex items-center justify-between p-3 bg-[#1A2234] rounded-lg hover:bg-[#1C2A3F]"
                    >
                      <span>{journal}</span>
                      <button
                        className={`w-5 h-5 rounded flex items-center justify-center ${
                          config.selectedJournals.includes(journal)
                            ? "bg-emerald-500 text-white"
                            : "border border-gray-600"
                        }`}
                        onClick={() => {
                          setConfig(prev => ({
                            ...prev,
                            selectedJournals: prev.selectedJournals.includes(
                              journal,
                            )
                              ? prev.selectedJournals.filter(j => j !== journal)
                              : [...prev.selectedJournals, journal],
                          }));
                        }}
                      >
                        {config.selectedJournals.includes(journal) && (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <button className="w-full py-2 text-sm text-emerald-500 hover:text-emerald-400">
                  + Add New Journal
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Notes for Research Assistant
              </label>
              <textarea
                className="w-full h-32 bg-[#1A2234] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                placeholder="Add any specific instructions or focus areas..."
                value={config.notes}
                onChange={e =>
                  setConfig(prev => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>

            <button
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleStartResearch}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Start Research"
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        {results && (
          <section className="space-y-6 bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold">Analysis Results</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Trust Score</h3>
                <p className="text-3xl font-bold text-green-500">
                  {(results.trustScore * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Claims Analyzed</h3>
                <p className="text-3xl font-bold">
                  {results.analyzedClaims}/{results.totalClaimsFound}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Verified Claims</h3>
              {results.claims.map(claim => (
                <div
                  key={claim.id}
                  className="p-4 bg-gray-800 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        claim.verificationStatus === "verified"
                          ? "bg-green-900 text-green-200"
                          : claim.verificationStatus === "questionable"
                            ? "bg-yellow-900 text-yellow-200"
                            : "bg-red-900 text-red-200"
                      }`}
                    >
                      {claim.verificationStatus}
                    </span>
                    <span className="text-sm text-gray-400">
                      {claim.category}
                    </span>
                  </div>
                  <p>{claim.content}</p>
                  {claim.journalReferences.length > 0 && (
                    <div className="text-sm text-gray-400">
                      <p className="font-medium">References:</p>
                      <ul className="list-disc list-inside">
                        {claim.journalReferences.map((ref, index) => (
                          <li key={index}>{ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
