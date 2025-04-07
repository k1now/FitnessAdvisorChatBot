import { openai } from './index.js';

export async function getAssistantResponse(threadId) {
    console.log('\n💬 Retrieving assistant response...');
    
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastAssistantMessage = messages.data.reverse().find(msg => msg.role === 'assistant');

    if (!lastAssistantMessage) {
        console.warn('[No assistant message found]');
        return '[No assistant message found]';
    }

    let responseText = '';

    lastAssistantMessage.content.forEach((part) => {
        if (part.type === 'text' && part.text?.value) {
            const text = part.text.value;

            // Split the text into sections
            const sections = text.split('\n\n');

            // Find the index of the "**FINAL ANSWER:**" section
            const headerIndex = sections.findIndex(section => 
                section.trim() === '**FINAL ANSWER:**'
            );

            if (headerIndex !== -1 && headerIndex < sections.length - 1) {
                // Join all sections after the header and clean up formatting
                responseText = sections
                    .slice(headerIndex + 1)
                    .join('\n\n')
                    .split('\n')
                    .map(line => line.replace(/\s+/g, ' ').trim())
                    .join('\n')
                    .trim();
            } else {
                // If no final answer section is found, use the entire response
                responseText = text
                    .split('\n')
                    .map(line => line.replace(/\s+/g, ' ').trim())
                    .join('\n')
                    .trim();
            }
        }
    });

    console.log(responseText || '[No valid text content]');
    return responseText || '[No valid text content]';
}
