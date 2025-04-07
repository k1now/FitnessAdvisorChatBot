import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { openai } from './index.js';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Creates and configures an OpenAI assistant for health data analysis
 * @returns {Promise<Object>} The created and configured assistant
 * @throws {Error} If assistant creation fails
 */
export async function createAssistant() {
  try {
    // Read instructions from the text file
    const instructions = await fs.readFile(path.join(__dirname, 'assistantInstructions.txt'), 'utf-8');

    const assistant = await openai.beta.assistants.create({
      name: "Health Data Assistant",
      instructions: instructions,
      model: "gpt-4-turbo-preview",
      tools: [
        { type: "code_interpreter" }
      ],
    });
    
    console.log("✅ Assistant created successfully");
    return assistant;
  } catch (error) {
    console.error("❌ Error creating assistant:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
    throw error;
  }
} 