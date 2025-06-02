import { withSessionRoute } from "../../../lib/session";
import { openDB } from "../../../lib/db";

export default withSessionRoute(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = req.session.get("user");
  if (!user?.isLoggedIn) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { path, domain, redirectUrl } = req.body;
  if (!path || !domain || !redirectUrl) {
    return res.status(400).json({ message: "Missing required fields." });
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

  await db.run(
    "INSERT INTO paths (path, domain, redirect_url) VALUES (?, ?, ?)",
    path.trim(),
    domain.trim(),
    redirectUrl.trim()
  );

  res.status(200).json({ ok: true });
});
