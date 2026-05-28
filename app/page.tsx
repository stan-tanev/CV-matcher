"use client";

import { useState } from "react";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!jobDescription || !cvFile) {
      setError("Please provide both a job description and your CV.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
formData.append("jobDescription", jobDescription);
formData.append("cvFile", cvFile);

const response = await fetch("/api/analyze", {
  method: "POST",
  body: formData,
});

    const data = await response.json();

    if (data.error) {
      setError(data.error);
    } else {
      setResult(data);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">CV Matcher</h1>
          <p className="text-gray-500 text-lg">
            Paste a job description and upload your CV to see how well you match — and exactly how to improve.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
            <textarea
              className="w-full h-48 border border-gray-300 rounded-xl p-4 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your CV</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => document.getElementById("cv-upload")?.click()}
            >
              <p className="text-gray-400 text-sm">
                {cvFile ? cvFile.name : "Click to upload your CV (PDF or TXT)"}
              </p>
              <input
                id="cv-upload"
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition-colors text-base"
          >
            {loading ? "Analyzing..." : "Analyze My CV"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">

            {/* Score */}
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600">{result.score}%</div>
              <div className="text-gray-500 mt-1">Match Score</div>
            </div>

            {/* Summary */}
            <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>

            {/* Strengths */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">✅ Strengths</h3>
              <ul className="flex flex-col gap-2">
                {result.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 bg-green-50 rounded-lg px-4 py-2">{s}</li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">⚠️ Gaps</h3>
              <ul className="flex flex-col gap-2">
                {result.gaps?.map((g: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 bg-red-50 rounded-lg px-4 py-2">{g}</li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">💡 How to Improve</h3>
              <ul className="flex flex-col gap-2">
                {result.suggestions?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 bg-blue-50 rounded-lg px-4 py-2">{s}</li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}