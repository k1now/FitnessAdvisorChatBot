import  OpenAI  from "openai";
import fs from "fs";
import path from "path";
import os from "os";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function uploadFileToOpenAI(csvData) {
  try {
    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, 'health_data.csv');
    
    // Write the CSV data to the temporary file
    fs.writeFileSync(tempFilePath, csvData);
    console.log("📝 Created temporary file at:", tempFilePath);

    // Upload the file to OpenAI
    console.log("📤 Uploading file to OpenAI...");
    const file = await openai.files.create({
      file: fs.createReadStream(tempFilePath),
      purpose: 'assistants',
    });
    console.log("✅ File uploaded:", file.id);

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    console.log("🧹 Cleaned up temporary file");

    return file;
  } catch (error) {
    console.error("❌ Error uploading file to OpenAI:", error.message);
    throw error;
  }
}
