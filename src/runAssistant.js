import { openai } from './index.js';

export async function runAssistant(threadId, assistantId, instructions) {
  console.log("🤖 Running assistant...");
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    tool_choice: "auto",
    instructions: instructions
  });
  console.log("✅ Run started:", run.id);
  return run;
}
