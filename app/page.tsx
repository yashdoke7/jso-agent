"use client";

import { useState } from "react";

interface Platform {
  name: string;
  boolean: string;
  xray: string;
}

interface QueryResult {
  platforms: Platform[];
  tips: string[];
}

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "bg-blue-600",
  Indeed: "bg-indigo-600",
  Naukri: "bg-orange-500",
  Glassdoor: "bg-green-600",
  Reed: "bg-red-600",
  TotalJobs: "bg-purple-600",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors ml-2 shrink-0"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function QueryCard({ platform }: { platform: Platform }) {
  const color = PLATFORM_COLORS[platform.name] || "bg-gray-600";
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className={`${color} text-white px-4 py-2 font-semibold text-sm`}>
        {platform.name}
      </div>
      <div className="p-4 space-y-3 bg-white">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Boolean Query</span>
            <CopyButton text={platform.boolean} />
          </div>
          <code className="block bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-800 break-all">
            {platform.boolean}
          </code>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">X-Ray Search (Google)</span>
            <CopyButton text={platform.xray} />
          </div>
          <code className="block bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-800 break-all">
            {platform.xray}
          </code>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState({
    jobTitle: "",
    skills: "",
    location: "",
    experience: "",
    exclusions: "",
  });
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/generate-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">J</div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">JSO Agent</h1>
            <p className="text-blue-300 text-xs">Job Search Optimization · Powered by Gemini</p>
          </div>
          <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full">
            AariyaTech · Phase 2
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">AI-Powered Job Search Query Generator</h2>
          <p className="text-blue-200 text-base max-w-2xl mx-auto">
            Enter your job preferences and get optimized Boolean &amp; X-Ray search queries for
            LinkedIn, Indeed, Naukri, Glassdoor, Reed, and TotalJobs — instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">Job Title <span className="text-red-400">*</span></label>
              <input
                required
                value={form.jobTitle}
                onChange={e => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="e.g. Data Scientist"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">Skills</label>
              <input
                value={form.skills}
                onChange={e => setForm({ ...form, skills: e.target.value })}
                placeholder="e.g. Python, Machine Learning, SQL"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">Location</label>
              <input
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Mumbai, Remote, London"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">Experience Level</label>
              <select
                value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })}
                className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="">Any level</option>
                <option value="Entry level (0-2 years)">Entry level (0-2 years)</option>
                <option value="Mid level (2-5 years)">Mid level (2-5 years)</option>
                <option value="Senior level (5-10 years)">Senior level (5-10 years)</option>
                <option value="Lead / Principal (10+ years)">Lead / Principal (10+ years)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1 font-medium">Words to Exclude</label>
            <input
              value={form.exclusions}
              onChange={e => setForm({ ...form, exclusions: e.target.value })}
              placeholder="e.g. sales, unpaid, internship"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? "⏳ Generating queries with Gemini..." : "✨ Generate Job Search Queries"}
          </button>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </form>

        {result && (
          <div className="space-y-6">
            <h3 className="text-white font-bold text-xl">
              🎯 Optimized Queries for <span className="text-blue-400">{form.jobTitle}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.platforms.map(p => <QueryCard key={p.name} platform={p} />)}
            </div>
            {result.tips && result.tips.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-blue-300 font-semibold mb-2 text-sm">💡 Pro Search Tips</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-blue-200 text-xs flex gap-2">
                      <span className="text-blue-400 shrink-0">→</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-white/20 text-xs border-t border-white/5 mt-10">
        JSO Agent · AariyaTech Corp · Career Intelligence Platform Phase 2 · Built with Gemini AI
      </footer>
    </div>
  );
}
