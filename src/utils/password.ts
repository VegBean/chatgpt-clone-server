import bcrypt from "bcryptjs";

// 加密密码
const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// 验证密码
const verifyPassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

export { hashPassword, verifyPassword };
