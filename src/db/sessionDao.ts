import { eq } from "drizzle-orm";
import db from "./db";
import { chatSession } from "./schema";

export type Session = typeof chatSession.$inferSelect;
export type NewSession = typeof chatSession.$inferInsert;

async function insert(sessionData: NewSession) {
  const [created] = await db
    .insert(chatSession)
    .values(sessionData)
    .returning();
  return created;
}

async function getById(id: number) {
  const [found] = await db
    .select()
    .from(chatSession)
    .where(eq(chatSession.id, id));
  return found;
}

async function list() {
  return db.select().from(chatSession);
}

async function update(id: number, data: Partial<NewSession>) {
  const [updated] = await db
    .update(chatSession)
    .set(data)
    .where(eq(chatSession.id, id))
    .returning();
  return updated;
}

async function remove(id: number) {
  const [deleted] = await db
    .delete(chatSession)
    .where(eq(chatSession.id, id))
    .returning();
  return deleted;
}

const sessionDao = {
  insert,
  getById,
  list,
  update,
  remove,
};

export default sessionDao;
