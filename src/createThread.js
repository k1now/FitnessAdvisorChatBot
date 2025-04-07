import { openai } from './index.js';



/**
 * Creates a new thread for the conversation
 * @param {string} message - The initial message for the thread
 * @param {string} fileId - The ID of the uploaded file
 * @returns {Promise<Object>} The created thread
 * @throws {Error} If thread creation fails
 */
export async function createThread(message, fileId) {
  console.log("🧵 Creating thread...");
  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: message,
    attachments: [
      {
        file_id: fileId,
        tools: [{ type: "code_interpreter" }] // 👈 The correct tool for CSV analysis
      }
    ]
  });

  console.log("✅ Thread created:", thread.id);
  return thread;
}

export { openai };