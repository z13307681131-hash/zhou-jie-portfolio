import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  description: text("description").notNull().default(""),
  tags: text("tags").notNull().default("[]"),
  coverUrl: text("cover_url").notNull().default(""),
  coverKey: text("cover_key"),
  pdfKey: text("pdf_key"),
  gallery: text("gallery").notNull().default("[]"),
  sortOrder: integer("sort_order").notNull().default(0),
  layout: text("layout").notNull().default("standard"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const siteContent = sqliteTable("site_content", {
 key: text("key").primaryKey(),
 content: text("content").notNull(),
 revision: integer("revision").notNull().default(1),
 updatedAt: integer("updated_at").notNull(),
});

export const adminSessions=sqliteTable("admin_sessions",{tokenHash:text("token_hash").primaryKey(),expiresAt:integer("expires_at").notNull(),credentialVersion:text("credential_version").notNull()});
export const adminLoginAttempts=sqliteTable("admin_login_attempts",{key:text("key").primaryKey(),windowStart:integer("window_start").notNull(),attempts:integer("attempts").notNull()});
