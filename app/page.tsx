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

    try {
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
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  function scoreColor(score: number) {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center p-6 sm:p-10">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            CV Matcher
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto">
            Paste a job description, upload your CV, and get an instant AI analysis of how well you match — plus exactly what to fix.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8 flex flex-col gap-6">

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Job Description
            </label>
            <textarea
              className="w-full h-44 border border-slate-300 rounded-xl p-4 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your CV
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                cvFile
                  ? "border-green-400 bg-green-50"
                  : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/50"
              }`}
              onClick={() => document.getElementById("cv-upload")?.click()}
            >
              {cvFile ? (
                <p className="text-green-700 text-sm font-medium">
                  ✓ {cvFile.name}
                </p>
              ) : (
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-1">
                    Click to upload your CV
                  </p>
                  <p className="text-slate-400 text-xs">PDF or TXT</p>
                </div>
              )}
              <input
                id="cv-upload"
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition-colors text-base shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Analyzing your CV... this takes about 15 seconds
              </span>
            ) : (
              "Analyze My CV"
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8 flex flex-col gap-8">

            {/* Score */}
            <div className="text-center pt-2">
              <div className={`text-7xl font-bold ${scoreColor(result.score)}`}>
                {result.score}%
              </div>
              <div className="text-slate-500 mt-2 font-medium">Match Score</div>
            </div>

            {/* Summary */}
            <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-xl p-4">
              {result.summary}
            </p>

            {/* Strengths */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-green-500">✓</span> Strengths
              </h3>
              <ul className="flex flex-col gap-2">
                {result.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-slate-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 leading-relaxed">
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-amber-500">⚠</span> Gaps
              </h3>
              <ul className="flex flex-col gap-2">
                {result.gaps?.map((g: string, i: number) => (
                  <li key={i} className="text-sm text-slate-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 leading-relaxed">
                    {g}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-blue-500">💡</span> How to Improve
              </h3>
              <ul className="flex flex-col gap-2">
                {result.suggestions?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-slate-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 leading-relaxed">
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Analyze another */}
            <button
              onClick={() => {
                setResult(null);
                setCvFile(null);
                setJobDescription("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Analyze Another CV
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-10 mb-4">
          Powered by AI · Your CV is analyzed securely and never stored
        </p>
      </div>
    </main>
  );
}