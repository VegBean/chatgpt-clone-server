import { Hono } from "hono";
import userDao from "../db/dao/userDao";
import { authMiddleware, generateJwtToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";

const auth = new Hono();

// 注册用户
auth.post("/register", async (c) => {
  const { username, email, password } = await c.req.json();

  if (!username || !email || !password) {
    return c.json({ message: "Missing required fields" }, 400);
  }

  const existingUser = await userDao.getByEmail(email);
  if (existingUser) {
    return c.json({ message: "User already exists" }, 409);
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await userDao.insert({
    username,
    email,
    password: hashedPassword,
  });

  const { password: _, ...userWithoutPassword } = newUser;
  return c.json(userWithoutPassword);
});

// 登录
auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ message: "Missing required fields" }, 400);
  }

  const user = await userDao.getByEmail(email);
  if (!user) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  const token = await generateJwtToken({ id: user.id, name: user.username });
  const { password: _, ...userWithoutPassword } = user;

  return c.json({ token, user: userWithoutPassword });
});

// 以下接口使用 JWT 中间件进行保护
auth.use("/*", authMiddleware);

// 根据 ID 获取用户
auth.get("/id/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const user = await userDao.getById(id);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return c.json(userWithoutPassword);
  } else {
    return c.json({ message: "User not found" }, 404);
  }
});

// 根据 Email 获取用户
auth.get("/email/:email", async (c) => {
  const email = c.req.param("email");
  const user = await userDao.getByEmail(email);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return c.json(userWithoutPassword);
  } else {
    return c.json({ message: "User not found" }, 404);
  }
});

// 根据 Username 获取用户
auth.get("/username/:username", async (c) => {
  const username = c.req.param("username");
  const user = await userDao.getByUsername(username);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return c.json(userWithoutPassword);
  } else {
    return c.json({ message: "User not found" }, 404);
  }
});

// 修改用户信息
auth.put("/id/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const data = await c.req.json();

  // 如果包含密码，需要加密
  if (data.password) {
    data.password = await hashPassword(data.password);
  }

  const updatedUser = await userDao.update(id, data);
  if (updatedUser) {
    const { password: _, ...userWithoutPassword } = updatedUser;
    return c.json(userWithoutPassword);
  } else {
    return c.json({ message: "User not found" }, 404);
  }
});

export default auth;
