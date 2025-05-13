import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function openDB() {
  return open({
    filename: path.join(process.cwd(), "db.sqlite"),
    driver: sqlite3.Database,
  });
}
