# Agentic JSO Assignment Draft

## Part A: Core Questions

### Section 1: Why Agentic JSO

1. Why does the JSO platform require AI Agents in Phase-2?
- Phase-1 is mostly workflow-driven; Phase-2 needs outcome-driven intelligence.
- Users, HR consultants, and admins need faster decision support, not only data display.
- AI agents can continuously optimize job search quality, candidate-job matching, and dashboard actions.

2. What inefficiencies exist in the current Phase-1 system? (Assumptions/examples)
- Users manually build Boolean/X-Ray queries and often use weak syntax.
- HR consultants repeat similar query-building and profile-screening tasks.
- Admin teams lack real-time anomaly or quality insights across dashboards.
- Licensing teams spend time validating usage manually instead of using policy automation.

3. How can AI agents improve user experience and platform efficiency?
- Auto-generate platform-specific queries from plain language.
- Recommend improvements in real time (skills synonyms, role variants, exclusion terms).
- Reduce trial-and-error cycles and increase relevant job discovery.
- Standardize search quality across users and consultants.

### Section 2: Agent Design

1. What type of AI agent should be built?
- Job Search Optimization Agent (goal-oriented, retrieval-assisted, policy-constrained generation agent).

2. What tasks will this agent automate?
- Generate optimized Boolean queries.
- Generate X-Ray Google queries for each target platform.
- Suggest query refinements based on geography, experience, and excluded terms.
- Provide explainable tips and confidence flags.

3. How will the agent interact with the existing dashboard?
- Embedded "Generate Queries" panel in User Dashboard.
- API call from Next.js frontend to Node/Edge API route.
- Results saved in Supabase for history, analytics, and audit.

### Section 3: Problem Solving

1. What specific problem does this agent solve?
- Users struggle with advanced search syntax, leading to low-quality job results and wasted time.

2. Real scenario
- A user wants "Data Analyst jobs in London with SQL + Power BI, excluding internships".
- Without agent: user writes incorrect query, gets irrelevant listings.
- With agent: receives six platform-optimized Boolean + X-Ray queries, copy-ready, with exclusion logic.
- Outcome: faster relevant job discovery, improved application quality, reduced frustration.

### Section 4: Dashboard Integration

A. User Dashboard example
- User submits role + skills + location.
- Agent returns six optimized queries and tips.
- User copies one-click and applies externally.

B. HR Consultant Dashboard example
- Consultant reviews user query history and sees AI suggestions to improve search strategy.
- Consultant can approve, edit, or annotate generated queries.

C. Super Admin Dashboard example
- Admin sees aggregate metrics: generation count, success rate, user adoption, flagged outputs.
- Admin can update policy prompts and monitor model drift/errors.

D. Licensing Dashboard example
- Tracks API usage by tenant/license tier.
- Enforces per-plan limits and records compliance logs for billing and governance.

### Section 5: Technical Architecture

Chosen provider: Google Cloud
- Vertex AI / Gemini API (model: `gemini-2.5-flash-lite-preview`)
- Cloud Functions (optional async workflows)
- Cloud Logging for observability

Core stack integration:
- Frontend: Next.js + React
- API Layer: Next.js Route Handler (Node runtime)
- AI Inference: Gemini API
- Data: Supabase (query history, telemetry, audit)
- Storage: AWS S3 (documents/assets if needed)
- Deployment: Vercel

High-level flow:
1. User submits profile input in dashboard.
2. Frontend calls `/api/generate-queries`.
3. API validates input and policy checks.
4. API sends structured prompt to Gemini.
5. Agent returns strict JSON with six platform outputs + tips.
6. API stores request/response metadata in Supabase.
7. UI renders cards and copy actions.

### Section 6: Integration with Phase-1 Stack

Current stack alignment:
- NextJS/React: New module inside existing dashboard UI.
- NodeJS: Route handler service for orchestration.
- Supabase: stores generated queries, feedback, audit trails.
- AWS S3: optional for export snapshots/reporting artifacts.
- Google Cloud: Gemini inference.
- Vercel: deployment + environment secret management.

Proposed APIs:
- `POST /api/generate-queries`
- `GET /api/query-history?userId=...`
- `POST /api/query-feedback`

Event triggers:
- On query generation success -> save analytics event.
- On user copy action -> track conversion signal.
- On error threshold breach -> alert admin.

Data flow:
- Input (role, skills, location, experience, exclusions) -> policy validation -> LLM generation -> JSON normalization -> persistence -> dashboard display.

MCP / APA security protocols:
- MCP (Model Context Protocol) boundaries: only minimal context passed to model (no unnecessary PII).
- APA (Agent Policy Adapter): enforce prompt safety, output schema validation, PII redaction, and role-based access checks before response release.
- Signed audit logs and request IDs for traceability.

### Section 7: Timeline

- Architecture design: 1 week
- Agent development (API + prompt + UI): 2 weeks
- Integration + telemetry + policy guardrails: 1 week
- Testing (functional, prompt robustness, security): 1 week
- Deployment + documentation + handover: 1 week

Total: 6 weeks

## Part B: Main Task Execution

### Job Search Optimization Agent (Dashboard Focus: User Dashboard)

Problem:
- Users cannot reliably create Boolean and X-Ray queries for multiple job portals.

Solution:
- AI agent dynamically generates optimized search queries for:
- LinkedIn
- Indeed
- Naukri
- Glassdoor
- Reed
- TotalJobs

Execution details:
- User enters role + skills + location + experience + exclusions.
- Agent outputs two query types per platform:
- Boolean query
- X-Ray query (`site:` based Google search)
- UI supports one-click copy and search tips.

Success KPIs:
- Reduced time-to-first-relevant-job-search.
- Higher query reuse and copy actions.
- Improved user-reported relevance score.

## Part C: Ethical and Governance Considerations

Governance:
- Log model input/output metadata with request IDs.
- Provide explainable tips and transparent generation rationale.
- Enable admin policy overrides and audit review.

Workers:
- Agent assists HR consultants, does not replace decision authority.
- Avoid pressure metrics that unfairly rank consultants.
- Provide training insights for better career advisory quality.

Community:
- Encourage inclusive query templates and skill synonyms.
- Avoid biased terms and support diverse job-seeker backgrounds.

Environment:
- Use efficient model tier (`gemini-2.5-flash-lite-preview`) for low-latency, lower compute.
- Cache repeated query patterns to reduce redundant calls.

Customers:
- Protect sensitive data with minimal-context prompting.
- Encrypt data in transit/at rest; enforce RBAC.
- Avoid storing raw CV/interview data unless required.

Sustainability:
- Build fair-hiring support features for underserved communities.
- Use transparent AI systems that can be monitored and improved responsibly.

## Optional Additional Ideas

1. Interview Readiness Agent
- Converts JD + CV into likely interview questions and preparation plan.

2. Skill Gap Agent
- Compares user profile against role targets and gives a 30-day upskilling path.

3. Application Quality Agent
- Scores resume-job alignment before submission and suggests improvements.
