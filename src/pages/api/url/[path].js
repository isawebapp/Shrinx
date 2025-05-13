import { openDB } from "../../../lib/db";

export default async function handler(req, res) {
  const { path } = req.query;
  const host = req.headers.host.split(":")[0];

  if (!(process.env.DOMAINS || "").split(",").includes(host)) {
    return res.status(404).end();
  }

  const db = await openDB();
  const row = await db.get(
    "SELECT redirect_url FROM paths WHERE path = ? AND domain = ?",
    path.trim(),
    host
  );
  if (!row) {
    return res.redirect("/error");
  }

  res.redirect(row.redirect_url);
}
