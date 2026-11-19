import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'TELEGRAM_BOT_TOKEN']) {
  if (!process.env[k]) {
    console.error(`Missing ${k}`);
    process.exit(1);
  }
}

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const app = express();
app.set('trust proxy', 1);
app.use(helmet());

app.use(cors({
  origin: (process.env.ALLOWED_ORIGIN || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean)
}));

app.use(express.json({ limit: '32kb' }));
app.use('/api', rateLimit({ windowMs: 60000, limit: 90 }));

function verifyInitData(raw) {
  if (!raw || raw.length > 10000) {
    throw Error('اطلاعات ورود تلگرام نامعتبر است.');
  }

  const p = new URLSearchParams
