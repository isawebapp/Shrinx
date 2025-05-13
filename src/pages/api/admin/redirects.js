// src/pages/api/admin/redirects.js

import { withSessionRoute } from "../../../lib/session";
import { openDB } from "../../../lib/db";

export default withSessionRoute(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const user = req.session.get("user");
  if (!user?.isLoggedIn) {
    return res.status(401).json({ message: "Unauthorized" });
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
  const rows = await db.all("SELECT * FROM paths");

  res.status(200).json(rows);
});
