# CipherSQLStudio — LLM Hint System Architecture

> **Type:** Architectural Reference Only  
> **Goal:** Hints must educate, not solve. Every design decision below enforces that principle.

---

## SYSTEM DESIGN PHILOSOPHY

```
The hint system is a teaching assistant, NOT a solution generator.

It must:
  ✓ Identify what concept the student is likely missing
  ✓ Ask guiding questions that prompt independent thinking
  ✓ Reference the topic (JOIN, GROUP BY, etc.) without showing syntax
  ✓ Explain WHY their approach fails conceptually

It must NEVER:
  ✗ Show any SQL syntax
  ✗ Reference actual column or table names from the solution
  ✗ Complete or rephrase the student's query
  ✗ Give the answer when directly asked
```

---

## COMPONENT BREAKDOWN

```
Frontend                     Backend                      External
─────────────────────────────────────────────────────────────────────
HintPanel (React)
  │ User clicks "Get Hint"
  │ Sends: { assignmentId, userQuery, errorMessage }
  ▼
queryApi.js (Axios)
  │ POST /api/hints/request
  │ Bearer token in header
  ▼
                         hintRoutes.js
                           │
                         authMiddleware   ← verify JWT
                           │
                         hintController
                           │
                         ┌─ Rate limit check (MongoDB hintlogs)
                         │   max 5 hints / assignment / hour / user
                         │
                         ├─ Fetch assignment metadata from MongoDB
                         │   (title, description, schemaDescription)
                         │
                         ├─ llmHintService.buildPrompt(...)
                         │
                         └─ llmHintService.callLLM(prompt)
                               │
                               ▼
                                                        LLM API
                                                        (OpenAI/Gemini)
                         ◄─────────────────────────────
                         │
                         ├─ Strip code blocks from response
                         ├─ Log to hintlogs (MongoDB)
                         └─ Return { hint: "..." } to frontend
```

---

## PROMPT ENGINEERING — LAYER BY LAYER

### System Prompt (Static — set once per LLM call)

```
ROLE:
You are a SQL teaching assistant for a structured learning platform.
Your only job is to help students understand SQL concepts.
You are NOT a code generator. You are a Socratic tutor.

ABSOLUTE CONSTRAINTS — violating any of these is not permitted:
  1. NEVER include SQL syntax, keywords-in-context, or code in your response.
  2. NEVER reference the specific column names or table names that appear in the solution.
  3. NEVER complete, extend, or rephrase the student's query.
  4. NEVER provide a working or partial SQL statement.
  5. If the student directly asks "what is the answer?" or "just tell me the query" —
     respond politely that you can only provide conceptual guidance.
  6. One hint per response. Do not over-explain.
  7. Response must be 3–6 sentences maximum.
  8. Use plain English. No jargon without explanation.
  9. End your hint with one guiding question that prompts the student to think.
```

### User Prompt (Dynamic — built per request)

```
Populate these fields from your application data:

ASSIGNMENT CONTEXT:
  Title:       {assignment.title}
  Goal:        {assignment.description}
  Tables:      {assignment.schemaDescription}
               ← USE ONLY the schemaDescription field (human-readable summary)
               ← NEVER send actual DDL or the solution query to the LLM
  Difficulty:  {assignment.difficulty}

STUDENT STATE:
  Query Attempt:  {userQuery || "No query written yet"}
  Error Message:  {errorMessage || "Query ran but result appears incorrect"}
  Hint #:         {hintNumber}  ← 1st, 2nd, 3rd hint should differ in depth

TASK:
  Based on the student's query attempt and error (if any):
  1. Identify what SQL concept they are likely struggling with.
  2. Explain why their current approach might not work (conceptually).
  3. Guide them to think about the missing concept without revealing it.
  4. End with ONE guiding question.

  Earlier hints for this attempt (do not repeat these):
  {previousHintsSummary || "None"}
```

### Hint Depth Strategy

```
Hint 1 (first request):
  → Broad conceptual direction
  → "You might want to think about how multiple tables relate to each other..."

Hint 2 (second request, same assignment):
  → More specific to the error pattern
  → Reference the type of operation missing (aggregation, filtering, joining)
  → Still no syntax

Hint 3–5 (subsequent requests):
  → Ask Socratic questions
  → "What do you want each row in the result to represent?"
  → Challenge their mental model of the query
  → Hint 5 should be most direct without giving the answer
```

---

## LLM CALL CONFIGURATION

```
Model choice considerations:
  → GPT-4o-mini: cheap, fast, good instruction-following
  → Gemini Flash: alternative at lower cost
  → Claude Haiku: strong at following strict instructions

Recommended parameters:
  model:          "gpt-4o-mini"  (or equivalent)
  max_tokens:     250            ← hard ceiling — prevents long answers
  temperature:    0.3            ← low = focused, deterministic, less creative
  top_p:          0.9
  stream:         false          ← simpler to handle; add streaming later

Why low temperature:
  → Higher temperature generates more creative responses
  → Creative responses might accidentally include solution-like content
  → 0.3 keeps responses focused and constraint-adherent
```

---

## DEFENSIVE RESPONSE SANITIZATION

Even with strict prompts, LLMs occasionally break constraints. Sanitize on the backend:

````
sanitizeHintResponse(rawLLMText):

  1. Remove code blocks:
       Strip anything matching: ```...``` (any language)
       Strip anything matching: `...`  (inline code)

  2. Remove SQL keyword patterns (extra safety):
       Regex: /\bSELECT\b|\bFROM\b|\bJOIN\b|\bWHERE\b|\bGROUP BY\b/gi
       IF any found: log warning + return fallback message
       Fallback: "I'm sorry, I can only provide conceptual guidance.
                  Try thinking about what tables contain the data you need."

  3. Length check:
       IF response > 800 chars: truncate at last sentence boundary

  4. Return sanitized text
````

**Key principle:** If sanitization triggers, return the fallback — do not try to fix the LLM response.

---

## RATE LIMITING STRATEGY

### Backend Rate Limit (in hintController)

```
Per request, before calling LLM:

  1. Query MongoDB hintlogs:
       { userId, assignmentId, requestedAt: { $gte: Date.now() - 1hour } }

  2. IF count >= 5:
       Return 429 {
         error: "You've used 5 hints for this assignment in the last hour.",
         resetAt: (timestamp one hour from first hint in window)
       }

  3. IF count < 5:
       Proceed with LLM call
       Log the hint in hintlogs AFTER successful response
```

### Frontend Rate Limit UX

```
HintPanel component state to track:
  - hintsRemaining: number (5 - used count)
  - resetAt: timestamp (from 429 response)
  - isDisabled: boolean (when hintsRemaining === 0)

Display to student:
  "3 hints remaining for this assignment"
  "Hint limit reached. Resets in 43 minutes."

This prevents UI spam even before the API call.
```

---

## HINT PANEL — FRONTEND COMPONENT STRUCTURE

```
HintPanel
├── State:
│    ├── hintText: string | null
│    ├── isLoading: boolean
│    ├── hintsUsed: number
│    ├── error: string | null
│
├── Renders:
│    ├── HintPanel__trigger-btn   "Get Hint" button
│    │    └── Disabled + tooltip when hintsUsed >= 5
│    │
│    ├── HintPanel__counter       "3 of 5 hints used"
│    │
│    ├── HintPanel__content       Hint text area
│    │    └── Placeholder when no hint yet
│    │    └── Loading skeleton when isLoading
│    │    └── Hint text when received
│    │
│    └── HintPanel__disclaimer    "Hints guide thinking — not solutions"

SCSS classes (BEM):
  .hint-panel {}
  .hint-panel__trigger-btn {}
  .hint-panel__trigger-btn--disabled {}
  .hint-panel__counter {}
  .hint-panel__counter--warning {}    ← < 2 hints left
  .hint-panel__content {}
  .hint-panel__content--loading {}
  .hint-panel__disclaimer {}
```

---

## ACADEMIC INTEGRITY MONITORING

The `hintlogs` collection provides this audit capability:

```
Admin can query:
  - Which students requested hints for which assignments
  - How many hints before correct submission
  - Time between hint request and correct submission
    (very short time = possibly copied from hint)
  - Students who repeatedly hit the 5-hint limit daily
    (may indicate difficulty or cheating patterns)
  - Comparison: hint text vs next submitted query
    (manual review for academic dishonesty)

These patterns alone aren't proof of dishonesty —
they're signals for human review.
```

---

## MISTAKES TO AVOID IN HINT SYSTEM

```
✗  Sending the actual assignment SQL schema (DDL) to the LLM
✓  Send only the human-readable schemaDescription field

✗  High temperature (0.8+) — generates creative, possibly solution-like responses
✓  Temperature 0.3 — focused, follows constraints better

✗  No max_tokens limit — LLM can write paragraphs with full syntax
✓  max_tokens: 250 — hard ceiling prevents long answers

✗  Trusting LLM to never include SQL — no fallback
✓  Always sanitize response, check for SQL keywords, have fallback message

✗  Rate limiting only on frontend — easy to bypass with direct API calls
✓  Rate limit on backend (MongoDB count query) — always enforced

✗  Not logging hint requests
✓  Always log to hintlogs — enables academic integrity review

✗  Same generic hint every time student asks
✓  Track hint number per session, build progressively deeper prompts

✗  Streaming responses without sanitization
✓  Collect full response first, sanitize, then display
```
