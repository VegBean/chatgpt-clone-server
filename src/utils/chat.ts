import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import messageDao from "../db/dao/messageDao";
import sessionDao from "../db/dao/sessionDao";

const generateSessionName = (prompt: string) => {
  // todo 调用大模型生成sessionName
  return prompt.slice(0, 15);
};

const ensureSessionExists = async (sessionId: string, prompt: string) => {
  const existingSession = await sessionDao.getById(sessionId);
  if (!existingSession) {
    await sessionDao.insert({
      id: sessionId,
      userId: 1,
      sessionName: generateSessionName(prompt),
    });
  }
};

// 将模型响应的chunk转换为文本格式
const chunkToText = (chunk: { content?: unknown }) => {
  const content = chunk.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("");
  }
  return "";
};

// 获取指定会话id的历史消息记录
const getHistoryMessages = async (sessionId: string) => {
  const records = await messageDao.listBySessionId(sessionId);
  return records.map((record) => {
    switch (record.role) {
      case "assistant":
        return new AIMessage(record.content);
      case "system":
        return new SystemMessage(record.content);
      case "user":
      default:
        return new HumanMessage(record.content);
    }
  });
};

// 保存用户提问和模型回答到数据库
const saveMessages = async (
  sessionId: string,
  prompt: string,
  fulltext: string,
) => {
  await messageDao.insert({
    sessionId,
    role: "user",
    content: prompt,
  });

  await messageDao.insert({
    sessionId,
    role: "assistant",
    content: fulltext,
  });
};

export { chunkToText, getHistoryMessages, saveMessages, ensureSessionExists };
