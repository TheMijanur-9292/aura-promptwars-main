import { registerUser as registerLocal, loginUser as loginLocal, fetchUserData as fetchLocalData, saveMoodLogToDb, saveJournalEntryToDb } from './db';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export async function registerUser(userData) {
  if (BACKEND_URL) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      return data;
    } catch (err) {
      if (err.message.includes("already exists")) throw err;
      console.warn("Render Backend call failed, using direct cloud connection:", err);
    }
  }
  return registerLocal(userData);
}

export async function loginUser(credentials) {
  if (BACKEND_URL) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      return data;
    } catch (err) {
      if (err.message.includes("Invalid email")) throw err;
      console.warn("Render Backend call failed, using direct cloud connection:", err);
    }
  }
  return loginLocal(credentials);
}

export async function fetchUserData(email) {
  if (BACKEND_URL) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/data?email=${encodeURIComponent(email)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Render Backend fetch failed, using direct cloud connection:", err);
    }
  }
  return fetchLocalData(email);
}

export async function saveMoodLog(email, log) {
  if (BACKEND_URL) {
    try {
      await fetch(`${BACKEND_URL}/api/mood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, log })
      });
    } catch (err) {
      console.warn("Render Backend save mood failed:", err);
    }
  }
  return saveMoodLogToDb(email, log);
}

export async function saveJournalEntry(email, entry) {
  if (BACKEND_URL) {
    try {
      await fetch(`${BACKEND_URL}/api/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, entry })
      });
    } catch (err) {
      console.warn("Render Backend save journal failed:", err);
    }
  }
  return saveJournalEntryToDb(email, entry);
}
