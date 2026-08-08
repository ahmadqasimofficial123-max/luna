import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  username: varchar("username", { length: 40 }).unique(),
  displayName: varchar("displayName", { length: 120 }),
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  avatarUrl: text("avatarUrl"),
  isPrivate: boolean("isPrivate").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const follows = mysqlTable("follows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull(),
  followingId: int("followingId").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "declined", "cancelled"]).default("accepted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ uniqueFollow: uniqueIndex("unique_follow").on(table.followerId, table.followingId), followerIdx: index("follower_idx").on(table.followerId), followingIdx: index("following_idx").on(table.followingId) }));

export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull(),
  caption: text("caption"),
  location: varchar("location", { length: 180 }),
  audience: mysqlEnum("audience", ["public", "followers", "private"]).default("public").notNull(),
  commentsEnabled: boolean("commentsEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ authorIdx: index("post_author_idx").on(table.authorId), createdIdx: index("post_created_idx").on(table.createdAt) }));

export const postMedia = mysqlTable("postMedia", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  url: text("url").notNull(),
  mediaType: mysqlEnum("mediaType", ["image", "video"]).notNull(),
  width: int("width"),
  height: int("height"),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const likes = mysqlTable("likes", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), postId: int("postId").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, (table) => ({ uniqueLike: uniqueIndex("unique_post_like").on(table.userId, table.postId) }));
export const saves = mysqlTable("saves", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), postId: int("postId").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, (table) => ({ uniqueSave: uniqueIndex("unique_post_save").on(table.userId, table.postId) }));
export const comments = mysqlTable("comments", { id: int("id").autoincrement().primaryKey(), postId: int("postId").notNull(), authorId: int("authorId").notNull(), parentId: int("parentId"), body: text("body").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });

export const stories = mysqlTable("stories", { id: int("id").autoincrement().primaryKey(), authorId: int("authorId").notNull(), mediaUrl: text("mediaUrl").notNull(), mediaType: mysqlEnum("mediaType", ["image", "video"]).notNull(), caption: text("caption"), expiresAt: timestamp("expiresAt").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const storyReactions = mysqlTable("storyReactions", { id: int("id").autoincrement().primaryKey(), storyId: int("storyId").notNull(), userId: int("userId").notNull(), reaction: varchar("reaction", { length: 16 }).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, (table) => ({ uniqueReaction: uniqueIndex("unique_story_reaction").on(table.storyId, table.userId) }));

export const conversations = mysqlTable("conversations", { id: int("id").autoincrement().primaryKey(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
export const conversationMembers = mysqlTable("conversationMembers", { id: int("id").autoincrement().primaryKey(), conversationId: int("conversationId").notNull(), userId: int("userId").notNull(), lastReadAt: timestamp("lastReadAt") }, (table) => ({ uniqueMember: uniqueIndex("unique_conversation_member").on(table.conversationId, table.userId) }));
export const messages = mysqlTable("messages", { id: int("id").autoincrement().primaryKey(), conversationId: int("conversationId").notNull(), senderId: int("senderId").notNull(), body: text("body"), attachmentUrl: text("attachmentUrl"), attachmentType: mysqlEnum("attachmentType", ["image", "video", "voice"]), createdAt: timestamp("createdAt").defaultNow().notNull() });

export const notifications = mysqlTable("notifications", { id: int("id").autoincrement().primaryKey(), recipientId: int("recipientId").notNull(), actorId: int("actorId"), type: mysqlEnum("type", ["like", "comment", "follow", "follow_request", "mention", "story_reaction", "message"]).notNull(), entityId: int("entityId"), readAt: timestamp("readAt"), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const blocks = mysqlTable("blocks", { id: int("id").autoincrement().primaryKey(), blockerId: int("blockerId").notNull(), blockedId: int("blockedId").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, (table) => ({ uniqueBlock: uniqueIndex("unique_block").on(table.blockerId, table.blockedId) }));
export const mutes = mysqlTable("mutes", { id: int("id").autoincrement().primaryKey(), muterId: int("muterId").notNull(), mutedId: int("mutedId").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, (table) => ({ uniqueMute: uniqueIndex("unique_mute").on(table.muterId, table.mutedId) }));
export const reports = mysqlTable("reports", { id: int("id").autoincrement().primaryKey(), reporterId: int("reporterId").notNull(), postId: int("postId"), commentId: int("commentId"), reportedUserId: int("reportedUserId"), reason: varchar("reason", { length: 120 }).notNull(), details: text("details"), status: mysqlEnum("status", ["open", "reviewing", "resolved", "dismissed"]).default("open").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const accountSettings = mysqlTable("accountSettings", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull().unique(), discoverable: boolean("discoverable").default(true).notNull(), allowMessages: mysqlEnum("allowMessages", ["everyone", "followers", "none"]).default("everyone").notNull(), emailNotifications: boolean("emailNotifications").default(true).notNull(), pushNotifications: boolean("pushNotifications").default(true).notNull(), theme: mysqlEnum("theme", ["dark", "light", "system"]).default("dark").notNull(), twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type Message = typeof messages.$inferSelect;
