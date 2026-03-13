import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Supports both Gemini (free) and Anthropic Claude (premium) — configure via env
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite-preview";

function extractJsonObject(text: string): string {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON object found in model response");
  }

  return match[0];
}

function validateResultShape(data: unknown) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid response format");
  }

  const maybeResult = data as { platforms?: unknown; tips?: unknown };
  if (!Array.isArray(maybeResult.platforms)) {
    throw new Error("Missing platforms array");
  }

  if (!Array.isArray(maybeResult.tips)) {
    maybeResult.tips = [];
  }

  return maybeResult;
}

export async function POST(req: NextRequest) {
  const { jobTitle, skills, location, experience, exclusions } = await req.json();

  if (!jobTitle) {
    return NextResponse.json({ error: "Job title is required" }, { status: 400 });
  }

  if (!GEMINI_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const prompt = `You are an expert job search strategist. Generate optimized Boolean and X-Ray search queries for the following job seeker profile.

Job Title: ${jobTitle}
Skills: ${skills || "Not specified"}
Location: ${location || "Remote/Any"}
Experience Level: ${experience || "Not specified"}
Exclusions (words to avoid): ${exclusions || "None"}

Generate search queries for ALL SIX platforms below. For each platform, provide:
1. A Boolean search query (using AND, OR, NOT, quotes, parentheses)
2. An X-Ray search query (using site: operator for Google search)

Platforms: LinkedIn, Indeed, Naukri, Glassdoor, Reed, TotalJobs

Rules:
- Use platform-specific syntax where applicable
- LinkedIn Boolean: use quotes for exact phrases, AND/OR/NOT operators
- X-Ray queries start with site:linkedin.com/jobs or site:indeed.com etc.
- Keep queries practical and copy-paste ready
- Include skill variations (e.g., "ML" OR "Machine Learning")
- Apply exclusions using NOT or minus (-)

Respond ONLY with valid JSON in this exact structure, no markdown:
{
  "platforms": [
    { "name": "LinkedIn", "boolean": "...", "xray": "site:linkedin.com/jobs ..." },
    { "name": "Indeed", "boolean": "...", "xray": "site:indeed.com ..." },
    { "name": "Naukri", "boolean": "...", "xray": "site:naukri.com ..." },
    { "name": "Glassdoor", "boolean": "...", "xray": "site:glassdoor.com ..." },
    { "name": "Reed", "boolean": "...", "xray": "site:reed.co.uk ..." },
    { "name": "TotalJobs", "boolean": "...", "xray": "site:totaljobs.com ..." }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}`;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonText = extractJsonObject(text);
    const data = validateResultShape(JSON.parse(jsonText));
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          "Failed to generate queries. Verify GEMINI_API_KEY and GEMINI_MODEL in .env.local.",
      },
      { status: 500 }
    );
  }
}
