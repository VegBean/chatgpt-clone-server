import { jwt, sign, verify } from "hono/jwt";

const JWT_SECRET = "chatgpt-clone-secret-key";

// 根据用户信息生成 JWT token
const generateJwtToken = async (payload: { id: number; name: string }) => {
  const token = await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7天过期
    },
    JWT_SECRET,
    "HS256",
  );
  return token;
};

// 验证 JWT token
const verifyJwtToken = async (token: string) => {
  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error };
  }
};

// 使用hono内置jwt中间件
const authMiddleware = jwt({
  secret: JWT_SECRET,
  alg: "HS256",
});

export { generateJwtToken, verifyJwtToken, authMiddleware };
