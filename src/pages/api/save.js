import axios from "axios";
import { openDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { path, domain, redirectUrl, turnstileResponse } = req.body;
  if (!path || !domain || !redirectUrl || !turnstileResponse) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  const verify = await axios.post(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {},
    { params: { secret, response: turnstileResponse } }
  );
  if (!verify.data.success) {
    return res.status(400).json({ message: "Captcha verification failed." });
  }

  const db = await openDB();
  await db.run(`
    CREATE TABLE IF NOT EXISTS paths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT,
      domain TEXT,
      redirect_url TEXT
    )
  `);

  const existing = await db.get(
    "SELECT * FROM paths WHERE path = ? AND domain = ?",
    path.trim(),
    domain
  );
  if (existing) {
    return res
      .status(400)
      .json({ message: "That short URL is already taken." });
  }

  await db.run(
    "INSERT INTO paths (path, domain, redirect_url) VALUES (?, ?, ?)",
    path.trim(),
    domain,
    redirectUrl.trim()
  );

  res.status(200).json({ ok: true });
}
