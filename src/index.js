import dotenv from "dotenv";
import { fetchFromS3 } from './fetchFromS3.js';
import { uploadFileToOpenAI } from './uploadFile.js';
import { createThread } from './createThread.js';
import { runAssistant } from './runAssistant.js';
import { checkRunStatus } from './checkRunStatus.js';
import { getAssistantResponse } from './getAssistantResponse.js';
import { logMemoryUsage } from './memoryReporting.js';
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});




const messageHistory = [];

function cleanResponse(text) {
  if (typeof text !== 'string') {
    console.warn('⚠️ cleanResponse received non-string input:', text);
    return '[No valid response text]';
  }
  return text.replace(/【[^】]*】|\[[^\]]*\]|†[^†]*†/g, '').trim();
}

function formatConversation(history) {
  return history.map(msg => `${msg.role.toUpperCase()}: ${msg.text}`).join('\n');
}

async function main(message) {
  try {
  
    const healthData = await fetchFromS3();
    console.log("✅ Fetched health data from S3");
    logMemoryUsage('fetching data');

    const file = await uploadFileToOpenAI(healthData);
    
    console.log(`✅ Uploaded file to OpenAI: ${file.id}`);
    logMemoryUsage('uploading file');

    const thread = await createThread(message, file.id);
 
    console.log(`🧵 Thread created: ${thread.id}`);
    logMemoryUsage('creating thread');

    messageHistory.push({ role: "user", text: message });

    // Format conversation for static instruction
    const conversation = formatConversation(messageHistory);
    const rawInstructions = await fs.readFile(path.join(__dirname, 'assistantInstructions.txt'), 'utf-8');
    const finalInstructions = rawInstructions.replace('{{conversation_history}}', conversation);

    const run = await runAssistant(thread.id, process.env.ASSISTANT_ID, finalInstructions);
    console.log(`🏃 Assistant run started: ${run.id}`);
    logMemoryUsage('running assistant');

    const runStatus = await checkRunStatus(thread.id, run.id);
    console.log("📊 Run status:", runStatus.status);
    logMemoryUsage('checking run status');

    if (runStatus.status === 'completed') {
      const response = await getAssistantResponse(thread.id);
      messageHistory.push({ role: "assistant", text: response });
      console.log("🗣️ Response received");
      logMemoryUsage('getting response');
      return cleanResponse(response);
    } else {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }
  } catch (error) {
    console.error("❌ Error processing request:", error);
    throw error;
  }
}

export { main };
