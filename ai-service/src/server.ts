import dotenv from 'dotenv';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fileURLToPath } from 'url';
import { handleChatRequest } from '@/handlers/chat/route';
import { getConversation, getConversations } from './handlers/conversation';

const app = new Hono();

// Middleware
app.use('*', cors());

// Routes
app.post("/api/chat", handleChatRequest);
app.get("/api/conversations/:conversationId", getConversation);
app.get("/api/conversations", getConversations);
app.get('/api/health', c => c.json({ status: 'ok' }));

// Start server
serve({ fetch: app.fetch, port: process.env.PORT ? parseInt(process.env.PORT) : 8889 }, (info) => {
  console.log(`Server is running on port ${info.port}`);
});