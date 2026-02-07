import {
  bigint,
  index,
  json,
  pgTable,
  smallint,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable(
  "user",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    username: varchar("username", { length: 50 }).notNull(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 100 }).notNull(),
    createTime: timestamp("create_time").defaultNow().notNull(),
    updateTime: timestamp("update_time")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_user_email").on(table.email)],
);

export const chatSession = pgTable(
  "chat_session",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    sessionName: varchar("session_name", { length: 100 }).default(""),
    status: smallint("status").default(1).notNull(),
    createTime: timestamp("create_time").defaultNow().notNull(),
    updateTime: timestamp("update_time")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_session_user_id").on(table.userId)],
);

export const chatMessage = pgTable(
  "chat_message",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    role: varchar("role", { length: 20 }).notNull(),
    content: text("content").notNull(),
    sessionId: bigint("session_id", { mode: "number" }).notNull(),
    createTime: timestamp("create_time").defaultNow().notNull(),
    updateTime: timestamp("update_time")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_message_session_id").on(table.sessionId),
    index("idx_message_create_time").on(table.createTime),
  ],
);
