import { HumanMessage } from "@langchain/core/messages";
import { Hono } from "hono";
import { stream, streamSSE } from "hono/streaming";
import { model } from "../utils/deepseek";
import {
  chunkToText,
  ensureSessionExists,
  getHistoryMessages,
  saveMessages,
} from "../utils/chat";

const message = new Hono();

message.post("/send", async (c) => {
  // 1.获取请求参数
  const reqbody = await c.req.json();
  const sessionId = reqbody.sessionId;
  const prompt = reqbody.prompt;

  // 2.参数校验
  if (!sessionId || !prompt) {
    return c.json({ message: "sessionId and message are required" }, 400);
  }

  // 3.确保会话存在，如果不存在就根据sessionId创建一个
  await ensureSessionExists(Number(sessionId), prompt);

  // 4.获取历史消息
  const history = await getHistoryMessages(Number(sessionId));
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
        data: JSON.stringify({ delta: text }),
      });
    }

    // 5.4把完整的一问一答写入数据库
    await saveMessages(Number(sessionId), prompt, fulltext);

    // 5.5回答结束
    await stream.writeSSE({
      event: "done",
      data: JSON.stringify({ sessionId: Number(sessionId) }),
    });
  });
});

export default message;
