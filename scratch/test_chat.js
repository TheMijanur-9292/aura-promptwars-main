/* eslint-env node */
import { getChatResponse } from '../src/services/groq.js';

async function test() {
  console.log("Testing getChatResponse for 'what is java'...");
  const res = await getChatResponse([
    { role: 'user', content: 'what is java' }
  ], { examType: 'JEE' }, process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY);
  console.log("RESULT:", JSON.stringify(res, null, 2));
}

test();
