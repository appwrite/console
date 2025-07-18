import "dotenv/config";

import fs from 'fs';
import { convertToModelMessages, generateText, UIMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

async function main() {
  const loaded = fs.readFileSync('./tmp/messages-submitted-tool-result.json', 'utf-8');
  const messages: UIMessage[] = JSON.parse(loaded);

  messages.push({
    id: "123",
    role: "user",
    parts: [
      {
        type: "text",
        text: "What is the content of the src/App.tsx file?"
      }
    ]
  })

  const converted = convertToModelMessages(messages);

  // const loaded = fs.readFileSync('/Users/arielweinberger/Development/appwrite/appwrite-console/ai-service/tmp/messages-submitted-tool-result-converted.json', 'utf-8');
  // const converted = JSON.parse(loaded);

  const result = await generateText({
    model: anthropic("claude-3-7-sonnet-20250219"),
    messages: converted,
  });

  console.log(result.text);
}

main();