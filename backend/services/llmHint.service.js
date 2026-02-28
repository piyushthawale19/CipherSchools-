
// services/llmHint.service.js
// Generates conceptual SQL hints using the OpenAI API.
// The LLM is strictly prompted to NEVER provide solutions.

const OpenAI = require("openai");
const { OPENAI_API_KEY, OPENAI_MODEL } = require("../config/env");
const logger = require("../utils/logger");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

 
function stripCodeBlocks(text) {
  return text
    .replace(/```[\w\s]*\n?[\s\S]*?```/g, "[code removed]")
    .replace(/`[^`]+`/g, "[code removed]")
    .trim();
}


//   Builds the prompt for the LLM hint request.
 
function buildHintPrompt(assignment, userQuery, errorMessage) {
  const systemPrompt = `You are a SQL Teaching Assistant for an educational learning platform called CipherSQLStudio.

STRICT RULES — follow all of them without ANY exception:
1. NEVER provide a complete SQL query or any partial working SQL syntax.
2. NEVER show column names, table names, or exact SQL keywords from the solution.
3. NEVER rephrase or complete the student's query.
4. NEVER reveal what the correct output should look like.
5. If the student asks "just give me the answer" or any variation — refuse politely and redirect.
6. Provide ONLY ONE conceptual hint per response.
7. Your hint must guide the student to think, NOT give them what to write.
8. Use analogies, plain English explanations, or conceptual questions to prompt thinking.
9. Keep your response concise — 2 to 4 sentences maximum.
10. Your goal is student learning, not task completion.`;

  const userPrompt = `CONTEXT:
- Assignment Title: ${assignment.title}
- Assignment Goal: ${assignment.description}
- Tables Available (for reference only): ${assignment.schemaDescription}
- Student's Current SQL Query Attempt:
  ${userQuery || "(no query written yet)"}
- Error or Issue: ${errorMessage || "No error — but the result appears to be wrong or incomplete"}

TASK:
Give ONE conceptual hint that helps the student understand:
- What SQL concept they might be missing (e.g., JOIN, GROUP BY, filtering, subquery, aggregation)
- Why their current approach might produce the wrong result
- What to think about next — NOT what to type next

Remember: Do NOT write any SQL syntax. Do NOT complete their query. Guide their thinking only.`;

  return { systemPrompt, userPrompt };
}

/**
 * Requests a hint from the LLM.
 * @param {object} assignment - MongoDB assignment document
 * @param {string} userQuery - Student's current SQL query
 * @param {string} errorMessage - Error the student encountered (if any)
 * @returns {Promise<string>} - Hint text (sanitized)
 */
async function getHint(assignment, userQuery, errorMessage) {
  const { systemPrompt, userPrompt } = buildHintPrompt(
    assignment,
    userQuery,
    errorMessage,
  );

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 250,
      temperature: 0.4,  
    });

    const rawHint = completion.choices[0]?.message?.content || "";
    const hint = stripCodeBlocks(rawHint);

    if (!hint) {
      throw new Error("LLM returned an empty response.");
    }

    logger.debug(`[LLM] Hint generated for assignment: ${assignment._id}`);
    return hint;
  } catch (err) {
    logger.error(`[LLM] Hint generation failed: ${err.message}`);
    throw new Error(
      "Hint service is temporarily unavailable. Please try again.",
    );
  }
}

module.exports = { getHint };
