# JSO Agent — Job Search Optimization AI Agent
### AariyaTech Corp · Career Intelligence Platform · Phase 2

A live AI agent prototype built for the **Agentic JSO Phase-2 Assignment**.  
Takes a job seeker's preferences → generates optimized **Boolean** and **X-Ray** queries for **6 job platforms** using AI.

## 🎯 Platforms Supported

| Platform | Boolean Query | X-Ray (Google) |
|----------|:---:|:---:|
| LinkedIn | ✅ | ✅ |
| Indeed | ✅ | ✅ |
| Naukri | ✅ | ✅ |
| Glassdoor | ✅ | ✅ |
| Reed | ✅ | ✅ |
| TotalJobs | ✅ | ✅ |

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + React + Tailwind CSS |
| AI (active) | Google Gemini 2.5 Flash Lite Preview (free tier) |
| AI (architecture) | Anthropic Claude Opus 4.6 (as per JSO spec) |
| Deployment | Vercel |
| Language | TypeScript |

> The codebase supports **both** Gemini and Claude — switch via `.env` (see `.env.example`).  
> Production architecture recommendation: Claude Opus 4.6 as per JSO Phase-2 spec.

## 🚀 Run Locally

```bash
# 1. Clone
git clone <repo-url> && cd jso-agent

# 2. Install
npm install

# 3. Set up env (copy example and add your key)
cp .env.example .env.local
# Edit .env.local → add your GEMINI_API_KEY (free at aistudio.google.com)
# Optional: set GEMINI_MODEL (default: gemini-2.5-flash-lite-preview)

# 4. Run
npm run dev
```
Open http://localhost:3000

## 🌐 Deploy to Vercel

1. Push repo to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add `GEMINI_API_KEY` in **Environment Variables**
4. Deploy ✅

## 📋 Assignment Reference

- **Part B**: Job Search Optimization Agent
- **Dashboard**: User Dashboard
- **Problem**: Users struggle with Boolean/X-Ray search syntax
- **Solution**: AI agent auto-generates platform-specific queries from plain English input

## Why This Stands Out

- Focuses on a real, repeatable job-seeker pain point instead of a vague AI assistant use case
- Fits directly into the current JSO stack and dashboard model
- Supports platform efficiency, consultant assistance, auditability, and licensing visibility
- Can evolve from prototype to governed product with minimal architectural change

## Suggested Next Iteration

- Make each platform output more distinct and strategy-aware
- Add explanation fields for why each query was generated
- Add strict, balanced, and broad query variants
- Add lightweight feedback and analytics capture for dashboard insights

## Documentation Pack

- Architecture and data flow: [docs/ARCHITECTURE_AND_DATAFLOW.md](docs/ARCHITECTURE_AND_DATAFLOW.md)
- Evaluation metrics: [docs/EVALUATION_METRICS.md](docs/EVALUATION_METRICS.md)
- Submission package checklist and email template: [SUBMISSION_PACKAGE.md](SUBMISSION_PACKAGE.md)
- Full assignment answers are maintained in the submission Google Doc (kept private per assignment confidentiality terms)

---
Built by Yash Doke · AariyaTech Internship Assignment 2026
