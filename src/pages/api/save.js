import axios from "axios";
import { openDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { path, domain, redirectUrl, turnstileResponse } = req.body;

  if (!path || !domain || !redirectUrl) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  if (!turnstileResponse) {
    return res.status(400).json({ message: "Missing Turnstile token." });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("🚨 TURNSTILE_SECRET_KEY is not defined in environment");
    return res.status(500).json({ message: "Server configuration error." });
  }

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", turnstileResponse);

  let verifyRes;
  try {
    verifyRes = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  } catch (err) {
    console.error("Turnstile verification error:", err.response?.data || err);
    return res.status(500).json({ message: "Error verifying captcha." });
  }

  if (!verifyRes.data.success) {
    console.warn("Turnstile failed:", verifyRes.data["error-codes"]);
    return res.status(400).json({
      message: "Captcha verification failed.",
      errors: verifyRes.data["error-codes"],
    });
  }

  try {
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

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error saving URL:", err);
    return res.status(500).json({ message: "Error saving URL." });
  }
}
