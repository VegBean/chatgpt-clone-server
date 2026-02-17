import { Hono } from "hono";
import { authMiddleware } from "../utils/jwt";
import sessionDao from "../db/dao/sessionDao";

const session = new Hono();

session.use("/*", authMiddleware);

session.get("/list", async (c) => {
  const payload = c.get("jwtPayload") as { id?: number };
  const authUserId = payload?.id;

  if (!authUserId) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const sessions = await sessionDao.listByUserId(authUserId);
  return c.json({ sessions });
});

export default session;
