import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(), // 'the-frontier' | 'the-quest' | 'the-synthesis'
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  coverImageUrl: text("cover_image_url"),
  tags: text("tags"), // JSON string array
  sortOrder: integer("sort_order").notNull().default(0),
});

export const postVersions = sqliteTable("post_versions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  title: text("title").notNull(),
  contentMd: text("content_md").notNull(),
  summary: text("summary"),
  changeNote: text("change_note"),
  publishedAt: text("published_at").notNull().$defaultFn(() => new Date().toISOString()),
  isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
});

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postVersionId: text("post_version_id").notNull().references(() => postVersions.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'pdf' | 'image' | 'video_link'
  url: text("url").notNull(),
  label: text("label"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const aiAgents = sqliteTable("ai_agents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  perspective: text("perspective").notNull(),
  characterReadme: text("character_readme").notNull(),
  icon: text("icon"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const agentRuns = sqliteTable("agent_runs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postVersionId: text("post_version_id").notNull().references(() => postVersions.id, { onDelete: "cascade" }),
  agentId: text("agent_id").notNull().references(() => aiAgents.id, { onDelete: "cascade" }),
  modelProvider: text("model_provider").notNull(),
  modelName: text("model_name").notNull(),
  characterReadmeSnapshot: text("character_readme_snapshot").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  userPrompt: text("user_prompt").notNull(),
  contentMd: text("content_md").notNull(),
  tokenCountIn: integer("token_count_in"),
  tokenCountOut: integer("token_count_out"),
  costUsd: text("cost_usd"), // stored as string for precision
  generatedAt: text("generated_at").notNull().$defaultFn(() => new Date().toISOString()),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
});
