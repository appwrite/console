import dotenv from 'dotenv';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { fileURLToPath } from 'url';
import { handleChatRequest } from './handlers/chat/route';
import { getConversation, getConversations } from './handlers/conversation';
import { contextStorage } from "hono/context-storage";

const app = new Hono();

// Middleware
app.use('*', cors());
app.use(contextStorage());
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  return new Response('Something went wrong', { status: 500 });
});

// Routes
app.post("/api/chat", handleChatRequest);
app.get("/api/conversations/:conversationId", getConversation);
app.get("/api/conversations", getConversations);
app.get('/api/health', c => c.json({ status: 'ok' }));

// Start server
serve({ 
  fetch: app.fetch, 
  port: process.env.PORT ? parseInt(process.env.PORT) : 8889,
  hostname: '0.0.0.0'
}, (info) => {
  console.log(`Server is running on ${info.address}:${info.port}`);
});