import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { model } from "../utils/deepseek";
import { authMiddleware } from "../utils/jwt";
import sessionDao from "../db/dao/sessionDao";
import messageDao from "../db/dao/messageDao";
import {
  chunkToText,
  ensureSessionExists,
  getHistoryMessages,
  saveMessages,
} from "../utils/chat";

const message = new Hono();

message.use("/send/*", authMiddleware);
message.use("/history/*", authMiddleware);

message.get("/history/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const payload = c.get("jwtPayload") as { id?: number };
  const authUserId = payload?.id;

  if (!sessionId) {
    return c.json({ message: "sessionId is required" }, 400);
  }

  if (!authUserId) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const session = await sessionDao.getById(sessionId);
  if (!session) {
    return c.json({ messages: [] });
  }

  if (session.userId !== authUserId) {
    return c.json({ message: "Forbidden" }, 403);
  }

  const messages = await messageDao.listBySessionId(sessionId);
  return c.json({ messages });
});

message.post("/send/:sessionId", async (c) => {
  // 1.获取请求参数
  const reqbody = await c.req.json();
  const sessionId = c.req.param("sessionId");
  const prompt = reqbody.prompt;
  const userId = reqbody.userId;
  const payload = c.get("jwtPayload") as { id?: number };
  const authUserId = payload?.id;

  // 2.参数校验
  if (!sessionId || !prompt) {
    return c.json({ message: "sessionId and message are required" }, 400);
  }
  if (!authUserId) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  if (userId && Number(userId) !== authUserId) {
    return c.json({ message: "Forbidden" }, 403);
  }
  const foundSession = await sessionDao.getById(sessionId);
  if (foundSession && foundSession.userId !== authUserId) {
    return c.json({ message: "Forbidden" }, 403);
  }
  await ensureSessionExists(sessionId, authUserId, prompt);

  // 3.获取历史消息
  const history = await getHistoryMessages(sessionId);

  // 4 添加系统提示词
  if (history.length === 0) {
    history.push(
      new SystemMessage(
        `你是ChatGPT，回答风格要与ChatGPT相似。
        在长篇回答中，使用 --- 这种Markdown分割线来分隔不同的段落或观点，提高可读性。
        当用户没有明确要求你写完整代码时，以分析问题和提供思路为主，可以用伪代码或代码片段来演示核心思想。在用户进一步提问的时候再给出完整代码。
        你可以积极的向用户提问，是否需要针对方案xxx进一步讲解和实现
        如果收到不友好的消息，可以提醒并拒绝完成任务。`,
      ),
    );
  }
  history.push(new HumanMessage(prompt));

  // 5.返回SSE流式响应
  return streamSSE(c, async (stream) => {
    let fulltext = "";
    let isStarted = false;

    // 5.1开始思考状态
    await stream.writeSSE({
      event: "state",
      data: JSON.stringify({ state: "thinking" }),
    });

    // 5.2获取模型响应并流式写入
    const responseStream = await model.stream(history);

    // 5.3从响应流中取出单个chunk，转换为文本并写入SSE流
    for await (const chunk of responseStream) {
      const text = chunkToText(chunk);
      if (!text) continue;

      // 第一次写入时，发送回答开始状态
      if (!isStarted) {
        isStarted = true;
        await stream.writeSSE({
          event: "state",
          data: JSON.stringify({ state: "answering" }),
        });
      }

      // 累积完整回答文本
      fulltext += text;

      // SSE流发送消息数据
      await stream.writeSSE({
        event: "message",
        data: JSON.stringify({ role: "assistant", delta: text }),
      });
    }

    // 5.4把完整的一问一答写入数据库
    await saveMessages(sessionId, prompt, fulltext);

    // 5.5回答结束
    await stream.writeSSE({
      event: "done",
      data: JSON.stringify({ sessionId: sessionId, fulltext }),
    });
  });
});

message.get("/uuid", (c) => {
  return c.json({ uuid: crypto.randomUUID() });
});

export default message;
