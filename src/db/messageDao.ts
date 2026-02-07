import { asc, eq } from "drizzle-orm";
import db from "./db";
import { chatMessage } from "./schema";

export type Message = typeof chatMessage.$inferSelect;
export type NewMessage = typeof chatMessage.$inferInsert;

async function insert(messageData: NewMessage) {
  const [created] = await db
    .insert(chatMessage)
    .values(messageData)
    .returning();
  return created;
}

async function getById(id: number) {
  const [found] = await db
    .select()
    .from(chatMessage)
    .where(eq(chatMessage.id, id));
  return found;
}

async function list() {
  return db.select().from(chatMessage);
}

async function listBySessionId(sessionId: number) {
  return db
    .select()
    .from(chatMessage)
    .where(eq(chatMessage.sessionId, sessionId))
    .orderBy(asc(chatMessage.createTime));
}

async function update(id: number, data: Partial<NewMessage>) {
  const [updated] = await db
    .update(chatMessage)
    .set(data)
    .where(eq(chatMessage.id, id))
    .returning();
  return updated;
}

async function remove(id: number) {
  const [deleted] = await db
    .delete(chatMessage)
    .where(eq(chatMessage.id, id))
    .returning();
  return deleted;
}

const messageDao = {
  insert,
  getById,
  list,
  listBySessionId,
  update,
  remove,
};

export default messageDao;
