import { Hono } from "hono";
import auth from "./routes/auth";
import { cors } from "hono/cors";
import message from "./routes/message";

const app = new Hono();

// cors 配置
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// 认证相关路由
app.route("/api/auth", auth);
app.route("api/message", message);

export default app;
