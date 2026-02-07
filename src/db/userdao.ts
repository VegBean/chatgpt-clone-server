import { eq } from "drizzle-orm";
import db from "./db";
import { user } from "./schema";

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

async function insert(userData: NewUser) {
  const [created] = await db.insert(user).values(userData).returning();
  return created;
}

async function getById(id: number) {
  const [found] = await db.select().from(user).where(eq(user.id, id));
  return found;
}

async function getByUsername(username: string) {
  const [found] = await db
    .select()
    .from(user)
    .where(eq(user.username, username));
  return found;
}

async function getByEmail(email: string) {
  const [found] = await db.select().from(user).where(eq(user.email, email));
  return found;
}

async function list() {
  return db.select().from(user);
}

async function update(id: number, data: Partial<NewUser>) {
  const [updated] = await db
    .update(user)
    .set(data)
    .where(eq(user.id, id))
    .returning();
  return updated;
}

async function remove(id: number) {
  const [deleted] = await db.delete(user).where(eq(user.id, id)).returning();
  return deleted;
}

const userDao = {
  insert,
  getById,
  getByUsername,
  getByEmail,
  list,
  update,
  remove,
};

export default userDao;
