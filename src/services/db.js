import { neon } from '@neondatabase/serverless';

// Helper to hash password using Web Crypto API (SHA-256)
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get Database connection if URL exists
function getSql() {
  const dbUrl = import.meta.env.VITE_NEON_DATABASE_URL || localStorage.getItem('aura_neon_db_url');
  if (!dbUrl || dbUrl.includes('user:password')) return null;
  try {
    return neon(dbUrl);
  } catch (e) {
    console.error("Neon DB connection error:", e);
    return null;
  }
}

// Initialize tables in Neon PostgreSQL if connected
export async function initDb() {
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
    console.log("Neon DB schema initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Neon DB schema:", err);
  }
}

// REGISTER USER
export async function registerUser({ email, password, name, exam }) {
  const cleanEmail = email.toLowerCase().trim();
  const hashed = await hashPassword(password);
  const sql = getSql();

  if (sql) {
    try {
      await initDb();
      const existing = await sql`SELECT id FROM aura_users WHERE email = ${cleanEmail}`;
      if (existing && existing.length > 0) {
        throw new Error("An account with this email already exists.");
      }

      await sql`
        INSERT INTO aura_users (email, password_hash, name, exam)
        VALUES (${cleanEmail}, ${hashed}, ${name}, ${exam})
      `;

      return { email: cleanEmail, name, exam };
    } catch (err) {
      if (err.message.includes("already exists")) throw err;
      console.error("Neon DB register failed, falling back to local DB:", err);
    }
  }

  // Local Storage Fallback
  const localUsers = JSON.parse(localStorage.getItem('aura_users_db') || '[]');
  if (localUsers.some(u => u.email === cleanEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const newUser = { email: cleanEmail, passwordHash: hashed, name, exam };
  localUsers.push(newUser);
  localStorage.setItem('aura_users_db', JSON.stringify(localUsers));

  return { email: cleanEmail, name, exam };
}

// LOGIN USER
export async function loginUser({ email, password }) {
  const cleanEmail = email.toLowerCase().trim();
  const hashed = await hashPassword(password);
  const sql = getSql();

  if (sql) {
    try {
      await initDb();
      const result = await sql`SELECT email, password_hash, name, exam FROM aura_users WHERE email = ${cleanEmail}`;
      if (!result || result.length === 0) {
        throw new Error("Invalid email or password.");
      }

      const user = result[0];
      if (user.password_hash !== hashed) {
        throw new Error("Invalid email or password.");
      }

      return { email: user.email, name: user.name, exam: user.exam };
    } catch (err) {
      if (err.message.includes("Invalid email")) throw err;
      console.error("Neon DB login failed, checking local DB:", err);
    }
  }

  // Local Storage Fallback
  const localUsers = JSON.parse(localStorage.getItem('aura_users_db') || '[]');
  const user = localUsers.find(u => u.email === cleanEmail);
  if (!user || user.passwordHash !== hashed) {
    throw new Error("Invalid email or password.");
  }

  return { email: user.email, name: user.name, exam: user.exam };
}

// SYNC USER HISTORY (Mood logs and Journals) FROM NEON DB
export async function fetchUserData(userEmail) {
  const sql = getSql();
  if (!sql || !userEmail) return null;

  try {
    const moodRows = await sql`SELECT date, mood, energy, stressors FROM aura_mood_logs WHERE user_email = ${userEmail} ORDER BY id ASC`;
    const journalRows = await sql`SELECT date, entry_text as "entryText", analysis_json, is_crisis as "isCrisis" FROM aura_journal_entries WHERE user_email = ${userEmail} ORDER BY id DESC`;

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

    return { moodHistory, journalHistory };
  } catch (err) {
    console.error("Error fetching user data from Neon DB:", err);
    return null;
  }
}

// SAVE MOOD LOG TO NEON DB
export async function saveMoodLogToDb(userEmail, log) {
  const sql = getSql();
  if (!sql || !userEmail) return;

  try {
    await sql`
      INSERT INTO aura_mood_logs (user_email, date, mood, energy, stressors)
      VALUES (${userEmail}, ${log.date}, ${log.mood}, ${log.energy}, ${JSON.stringify(log.stressors || [])})
    `;
  } catch (err) {
    console.error("Error saving mood log to Neon DB:", err);
  }
}

// SAVE JOURNAL ENTRY TO NEON DB
export async function saveJournalEntryToDb(userEmail, entry) {
  const sql = getSql();
  if (!sql || !userEmail) return;

  try {
    await sql`
      INSERT INTO aura_journal_entries (user_email, date, entry_text, analysis_json, is_crisis)
      VALUES (${userEmail}, ${entry.date}, ${entry.entryText}, ${JSON.stringify(entry.analysis || {})}, ${entry.isCrisis || false})
    `;
  } catch (err) {
    console.error("Error saving journal to Neon DB:", err);
  }
}
