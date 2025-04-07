import { openai } from './index.js';

export async function checkRunStatus(threadId, runId) {
    console.log("🔄 Checking run status...");
    let runStatus;
    do {
        await new Promise((res) => setTimeout(res, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
        console.log(`⏳ Status: ${runStatus.status}`);
    } while (runStatus.status !== 'completed');
    
    console.log("✅ Run completed");
    return runStatus;
} 