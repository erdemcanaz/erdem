import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "erdem.db");

// Ensure data directory exists
import fs from "fs";
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });

// Initialize tables
export function initDB() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 0,
      cover_image_url TEXT,
      tags TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS post_versions (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      content_md TEXT NOT NULL,
      summary TEXT,
      change_note TEXT,
      "references" TEXT,
      published_at TEXT NOT NULL,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      UNIQUE(post_id, version_number)
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      post_version_id TEXT NOT NULL REFERENCES post_versions(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      label TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_agents (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      perspective TEXT NOT NULL,
      character_readme TEXT NOT NULL,
      icon TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      post_version_id TEXT NOT NULL REFERENCES post_versions(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
      model_provider TEXT NOT NULL,
      model_name TEXT NOT NULL,
      character_readme_snapshot TEXT NOT NULL,
      system_prompt TEXT NOT NULL,
      user_prompt TEXT NOT NULL,
      content_md TEXT NOT NULL,
      token_count_in INTEGER,
      token_count_out INTEGER,
      cost_usd TEXT,
      generated_at TEXT NOT NULL,
      is_visible INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      translation_en TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Migration: add references column to existing DBs
  try {
    sqlite.exec(`ALTER TABLE post_versions ADD COLUMN "references" TEXT;`);
  } catch {
    // Column already exists
  }
}
