// src/pages/url/[path].js

import { openDB } from "../../lib/db";

export async function getServerSideProps({ params, req }) {
  const { path } = params;
  const host = req.headers.host;

  const db = await openDB();
  await db.run(`
    CREATE TABLE IF NOT EXISTS paths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT,
      domain TEXT,
      redirect_url TEXT
    )
  `);
  const row = await db.get(
    "SELECT redirect_url FROM paths WHERE path = ? AND domain = ?",
    path,
    host
  );

  if (!row) {
    return { notFound: true };
  }

  return {
    redirect: {
      destination: row.redirect_url,
      permanent: false,
    },
  };
}

export default function UrlRedirect() {
  return null;
}
