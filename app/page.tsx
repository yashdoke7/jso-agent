"use client";

import { useState, useEffect, useCallback } from "react";

/* ── types ── */

interface Platform {
  name: string;
  boolean: string;
  xray: string;
  explanation?: string;
}

interface QueryResult {
  platforms: Platform[];
  tips: string[];
}

interface HistoryEntry {
  id: number;
  jobTitle: string;
  queryStrength: string;
  timestamp: string;
  result: QueryResult;
}

/* ── constants ── */

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "bg-blue-600",
  Indeed: "bg-indigo-600",
  Naukri: "bg-orange-500",
  Glassdoor: "bg-green-600",
  Reed: "bg-red-600",
  TotalJobs: "bg-purple-600",
};

const STRENGTH_OPTIONS = [
  { value: "strict", label: "🎯 Strict", desc: "Precise, narrow results" },
  { value: "balanced", label: "⚖️ Balanced", desc: "Best mix of precision & recall" },
  { value: "broad", label: "🌐 Broad", desc: "Wide discovery, more results" },
];

const HISTORY_KEY = "jso-agent-history";

/* ── helpers ── */

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 20)));
}

function googleSearchUrl(xray: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(xray)}`;
}

/* ── small components ── */

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

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 inline-block mr-2" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function QueryCard({ platform }: { platform: Platform }) {
  const color = PLATFORM_COLORS[platform.name] || "bg-gray-600";
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className={`${color} text-white px-4 py-2 font-semibold text-sm flex items-center justify-between`}>
        {platform.name}
        <a
          href={googleSearchUrl(platform.xray)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
        >
          Open X-Ray in Google ↗
        </a>
      </div>
      <div className="p-4 space-y-3 bg-white">
        {/* Boolean */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Boolean Query</span>
            <CopyButton text={platform.boolean} />
          </div>
          <code className="block bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-800 break-all">
            {platform.boolean}
          </code>
        </div>
        {/* X-Ray */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">X-Ray Search (Google)</span>
            <CopyButton text={platform.xray} />
          </div>
          <code className="block bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-800 break-all">
            {platform.xray}
          </code>
        </div>
        {/* Explanation */}
        {platform.explanation && (
          <div className="bg-blue-50 border border-blue-100 rounded p-2">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Why this query</span>
            <p className="text-xs text-blue-800 mt-0.5">{platform.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── main page ── */

export default function Home() {
  const [form, setForm] = useState({
    jobTitle: "",
    skills: "",
    location: "",
    experience: "",
    exclusions: "",
  });
  const [queryStrength, setQueryStrength] = useState("balanced");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeParsing, setResumeParsing] = useState(false);

  useEffect(() => setHistory(loadHistory()), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/generate-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, queryStrength }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);

      // persist to history
      const entry: HistoryEntry = {
        id: Date.now(),
        jobTitle: form.jobTitle,
        queryStrength,
        timestamp: new Date().toLocaleString(),
        result: data,
      };
      const updated = [entry, ...history].slice(0, 20);
      setHistory(updated);
      saveHistory(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const restoreFromHistory = useCallback((entry: HistoryEntry) => {
    setResult(entry.result);
    setShowHistory(false);
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const handleResumeParse = async () => {
    if (!resumeText.trim() && !resumeFile) return;
    setResumeParsing(true);
    setError("");
    try {
      let res: Response;
      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        res = await fetch("/api/parse-resume", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse");
      setForm((prev) => ({
        ...prev,
        jobTitle: data.jobTitle || prev.jobTitle,
        skills: data.skills || prev.skills,
        location: data.location || prev.location,
        experience: data.experience || prev.experience,
      }));
      setShowResume(false);
      setResumeText("");
      setResumeFile(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResumeParsing(false);
    }
  };

  const copyAll = () => {
    if (!result) return;
    const text = result.platforms
      .map(
        (p) =>
          `=== ${p.name} ===\nBoolean: ${p.boolean}\nX-Ray: ${p.xray}${p.explanation ? `\nWhy: ${p.explanation}` : ""}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* ── header ── */}
      <header className="border-b border-white/10 px-6 py-4 backdrop-blur-sm bg-white/[0.02]">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
            JSO
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none tracking-tight">JSO Agent</h1>
            <p className="text-blue-300/70 text-xs mt-0.5">AI-Powered Job Search Optimization</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowResume(!showResume)}
              className="text-xs bg-white/[0.06] hover:bg-white/[0.12] text-blue-200 px-3 py-1.5 rounded-lg transition-colors border border-white/[0.06]"
            >
              📄 Paste Resume
            </button>
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs bg-white/[0.06] hover:bg-white/[0.12] text-blue-200 px-3 py-1.5 rounded-lg transition-colors border border-white/[0.06]"
              >
                📋 History ({history.length})
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* ── history panel ── */}
        {showHistory && (
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Recent Searches</h3>
              <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300">
                Clear all
              </button>
            </div>
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => restoreFromHistory(h)}
                className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-white text-sm font-medium">{h.jobTitle}</span>
                <span className="text-blue-300 text-xs ml-2">({h.queryStrength})</span>
                <span className="text-white/40 text-xs ml-2">{h.timestamp}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── resume parser panel ── */}
        {showResume && (
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">📄 Import Your Resume</h3>
              <button onClick={() => setShowResume(false)} className="text-xs text-white/40 hover:text-white/60">
                ✕ Close
              </button>
            </div>
            <p className="text-blue-200/60 text-xs">
              Upload a file or paste text — AI will extract your job title, skills, location, and experience to auto-fill the form.
            </p>

            {/* file upload */}
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-white/15 hover:border-blue-400/40 rounded-lg px-4 py-3 text-center transition-colors">
                  <p className="text-blue-200 text-sm font-medium">
                    {resumeFile ? resumeFile.name : "Click to upload PDF, DOCX, or TXT"}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {resumeFile ? `${(resumeFile.size / 1024).toFixed(0)} KB` : "Max 5 MB"}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setResumeFile(f); setResumeText(""); }
                  }}
                />
              </label>
              {resumeFile && (
                <button
                  onClick={() => setResumeFile(null)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">or paste text</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* text paste */}
            <textarea
              value={resumeText}
              onChange={(e) => { setResumeText(e.target.value); setResumeFile(null); }}
              placeholder="Paste your resume content here..."
              rows={5}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
            <button
              onClick={handleResumeParse}
              disabled={resumeParsing || (!resumeText.trim() && !resumeFile)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-800 disabled:to-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all text-sm flex items-center"
            >
              {resumeParsing ? <><Spinner /> Extracting…</> : "Extract & Auto-Fill →"}
            </button>
          </div>
        )}

        {/* ── hero ── */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Generate Job Search Queries<br />
            <span className="text-blue-400">in Seconds</span>
          </h2>
          <p className="text-blue-200/70 text-base max-w-xl mx-auto leading-relaxed">
            Enter your preferences — get optimized Boolean &amp; X-Ray queries
            for LinkedIn, Indeed, Naukri, Glassdoor, Reed, and TotalJobs.
          </p>
        </div>

        {/* ── how it works ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Enter Preferences", desc: "Job title, skills, location, and experience level" },
            { step: "2", title: "Choose Strength", desc: "Strict for precision, Balanced for best mix, Broad for discovery" },
            { step: "3", title: "Get Queries", desc: "Copy-paste ready Boolean & X-Ray queries for 6 platforms" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
              <span className="text-blue-400 font-bold text-lg leading-none mt-0.5">{s.step}</span>
              <div>
                <p className="text-white text-sm font-semibold">{s.title}</p>
                <p className="text-blue-200/60 text-xs mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── form ── */}
        <form onSubmit={handleSubmit} className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">
                Job Title <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="e.g. Data Scientist"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">Skills</label>
              <input
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="e.g. Python, Machine Learning, SQL"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Mumbai, Remote, London"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">Experience Level</label>
              <select
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
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
              onChange={(e) => setForm({ ...form, exclusions: e.target.value })}
              placeholder="e.g. sales, unpaid, internship"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* ── query strength selector ── */}
          <div>
            <label className="block text-sm text-blue-200 mb-2 font-medium">Query Strength</label>
            <div className="grid grid-cols-3 gap-2">
              {STRENGTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setQueryStrength(opt.value)}
                  className={`rounded-lg px-3 py-2 text-sm text-center transition-all border ${
                    queryStrength === opt.value
                      ? "bg-blue-600 border-blue-400 text-white"
                      : "bg-white/5 border-white/10 text-blue-200 hover:bg-white/10"
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-xs opacity-70">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-800 disabled:to-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
          >
            {loading ? (
              <>
                <Spinner /> Generating queries…
              </>
            ) : (
              "Generate Queries →"
            )}
          </button>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </form>

        {/* ── results ── */}
        {result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-xl">
                🎯 Optimized Queries for <span className="text-blue-400">{form.jobTitle}</span>
              </h3>
              <button
                onClick={copyAll}
                className="text-xs bg-white/10 hover:bg-white/20 text-blue-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                📋 Copy All Queries
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.platforms.map((p) => (
                <QueryCard key={p.name} platform={p} />
              ))}
            </div>
            {result.tips && result.tips.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-blue-300 font-semibold mb-2 text-sm">💡 Pro Search Tips</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-blue-200 text-xs flex gap-2">
                      <span className="text-blue-400 shrink-0">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-white/15 text-xs border-t border-white/5 mt-10">
        JSO Agent · Built with Gemini AI
      </footer>
    </div>
  );
}
