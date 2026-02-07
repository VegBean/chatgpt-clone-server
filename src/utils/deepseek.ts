import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "deepseek-chat",
  apiKey: "sk-fac6cdb1c0b34234a1faa6573bbd86c7",
  streaming: true,
  configuration: {
    baseURL: "https://api.deepseek.com",
  },
});

export { model };
