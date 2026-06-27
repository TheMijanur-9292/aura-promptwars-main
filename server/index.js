const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { neon } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Password Hashing Helper
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Get Neon SQL connection
function getSql() {
  const dbUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;
  if (!dbUrl || dbUrl.includes('user:password')) return null;
  try {
    return neon(dbUrl);
  } catch (e) {
    console.error("Server Neon DB connection error:", e);
    return null;
  }
}

// Initialize tables if connected
async function initDb() {
  const sql = getSql();
  if (!sql) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS aura_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        exam VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS aura_mood_logs (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        mood INT NOT NULL,
        energy INT NOT NULL,
        stressors TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS aura_journal_entries (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        entry_text TEXT NOT NULL,
        analysis_json TEXT NOT NULL,
        is_crisis BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (err) {
    console.error("Server DB Init error:", err);
  }
}

initDb();

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "Aura Student Wellness Express Backend", timestamp: new Date().toISOString() });
});

// REGISTER USER
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, exam } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const hashed = hashPassword(password);
  const sql = getSql();

  if (!sql) {
    return res.status(503).json({ error: "Database not connected. Please configure DATABASE_URL on Render." });
  }

  try {
    await initDb();
    const existing = await sql`SELECT id FROM aura_users WHERE email = ${cleanEmail}`;
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    await sql`
      INSERT INTO aura_users (email, password_hash, name, exam)
      VALUES (${cleanEmail}, ${hashed}, ${name}, ${exam || 'JEE'})
    `;

    res.json({ email: cleanEmail, name, exam: exam || 'JEE' });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message || "Registration failed." });
  }
});

// LOGIN USER
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const hashed = hashPassword(password);
  const sql = getSql();

  if (!sql) {
    return res.status(503).json({ error: "Database not connected. Please configure DATABASE_URL on Render." });
  }

  try {
    await initDb();
    const result = await sql`SELECT email, password_hash, name, exam FROM aura_users WHERE email = ${cleanEmail}`;
    if (!result || result.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result[0];
    if (user.password_hash !== hashed) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json({ email: user.email, name: user.name, exam: user.exam });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: err.message || "Login failed." });
  }
});

// FETCH USER DATA
app.get('/api/user/data', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email parameter is required." });

  const sql = getSql();
  if (!sql) return res.json({ moodHistory: [], journalHistory: [] });

  try {
    const moodRows = await sql`SELECT date, mood, energy, stressors FROM aura_mood_logs WHERE user_email = ${email} ORDER BY id ASC`;
    const journalRows = await sql`SELECT date, entry_text as "entryText", analysis_json, is_crisis as "isCrisis" FROM aura_journal_entries WHERE user_email = ${email} ORDER BY id DESC`;

    const moodHistory = moodRows.map(r => ({
      date: r.date,
      mood: r.mood,
      energy: r.energy,
      stressors: JSON.parse(r.stressors || '[]')
    }));

    const journalHistory = journalRows.map(r => ({
      date: r.date,
      entryText: r.entryText,
      analysis: JSON.parse(r.analysis_json || '{}'),
      isCrisis: r.isCrisis
    }));

    res.json({ moodHistory, journalHistory });
  } catch (err) {
    console.error("Fetch Data Error:", err);
    res.status(500).json({ error: "Failed to fetch user data." });
  }
});

// SAVE MOOD LOG
app.post('/api/mood', async (req, res) => {
  const { email, log } = req.body;
  if (!email || !log) return res.status(400).json({ error: "Email and log data required." });

  const sql = getSql();
  if (!sql) return res.json({ success: false });

  try {
    await sql`
      INSERT INTO aura_mood_logs (user_email, date, mood, energy, stressors)
      VALUES (${email}, ${log.date}, ${log.mood}, ${log.energy}, ${JSON.stringify(log.stressors || [])})
    `;
    res.json({ success: true });
  } catch (err) {
    console.error("Save Mood Error:", err);
    res.status(500).json({ error: "Failed to save mood log." });
  }
});

// SAVE JOURNAL ENTRY
app.post('/api/journal', async (req, res) => {
  const { email, entry } = req.body;
  if (!email || !entry) return res.status(400).json({ error: "Email and entry data required." });

  const sql = getSql();
  if (!sql) return res.json({ success: false });

  try {
    await sql`
      INSERT INTO aura_journal_entries (user_email, date, entry_text, analysis_json, is_crisis)
      VALUES (${email}, ${entry.date}, ${entry.entryText}, ${JSON.stringify(entry.analysis || {})}, ${entry.isCrisis || false})
    `;
    res.json({ success: true });
  } catch (err) {
    console.error("Save Journal Error:", err);
    res.status(500).json({ error: "Failed to save journal entry." });
  }
});

// GROQ AI CHAT PROXY — routes browser chat requests through server to avoid CORS issues
app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
  const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192"];

  for (const model of MODELS) {
    try {
      const payload = {
        model,
        messages: systemPrompt
          ? [{ role: "system", content: systemPrompt }, ...messages.slice(-8)]
          : messages.slice(-8),
        temperature: 0.75,
        max_tokens: 700
      };

      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          console.log(`✅ [Chat Proxy] Got response from ${model}`);
          return res.json({ text, model });
        }
      } else {
        const errText = await response.text();
        console.error(`❌ [Chat Proxy] ${model} returned ${response.status}:`, errText);
      }
    } catch (err) {
      console.error(`❌ [Chat Proxy] fetch failed for ${model}:`, err.message);
    }
  }

  res.status(502).json({ error: "All Groq models failed" });
});

app.listen(PORT, () => {
  console.log(`🚀 Aura Express Backend running on port ${PORT}`);
});
