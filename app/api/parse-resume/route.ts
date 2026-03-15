import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import * as mammoth from "mammoth";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite-preview";

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  return buffer.toString("utf-8");
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  let resumeText = "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      console.warn("[parse-resume] 400: No file in multipart form data");
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    console.log(`[parse-resume] File received: name="${file.name}", size=${file.size}, type="${file.type}"`);
    try {
      resumeText = await extractText(file);
      console.log(`[parse-resume] Extracted text length: ${resumeText.length} chars`);
    } catch (err) {
      console.error("[parse-resume] 400: File extraction failed:", err);
      return NextResponse.json(
        { error: "Could not read file. Supported formats: PDF, DOCX, TXT." },
        { status: 400 }
      );
    }
  } else {
    console.log(`[parse-resume] JSON body request, content-type: "${contentType}"`);
    const body = await req.json();
    resumeText = body.resumeText || "";
    console.log(`[parse-resume] resumeText length: ${resumeText.length} chars`);
  }

  if (!resumeText || resumeText.trim().length < 30) {
    console.warn(`[parse-resume] 400: Text too short (${resumeText.trim().length} chars). First 100: "${resumeText.trim().slice(0, 100)}"`);
    return NextResponse.json(
      { error: "Resume content is too short. Please upload a valid file or paste more text." },
      { status: 400 }
    );
  }

  if (!GEMINI_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const prompt = `You are a resume parser. Extract the following fields from this resume text. If a field is unclear, leave it as an empty string. Do NOT invent information.

Resume:
${resumeText.slice(0, 3000)}

Respond ONLY with valid JSON, no markdown:
{
  "jobTitle": "most recent or most relevant job title",
  "skills": "comma-separated key technical skills",
  "location": "city or region if mentioned",
  "experience": "one of: Entry level (0-2 years), Mid level (2-5 years), Senior level (5-10 years), Lead / Principal (10+ years), or empty string if unclear"
}`;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON found in response");
    }

    const data = JSON.parse(match[0]);
    return NextResponse.json({
      jobTitle: data.jobTitle || "",
      skills: data.skills || "",
      location: data.location || "",
      experience: data.experience || "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to parse resume. Please try again or fill in manually." },
      { status: 500 }
    );
  }
}
