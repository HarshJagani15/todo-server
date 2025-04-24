import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const comparePassword = async (
  password: string,
  storedPassword: string
) => {
  const isPasswordValid = await bcrypt.compare(password, storedPassword);
  return isPasswordValid;
};

export const generateToken = (email: string) => {
  const secretKey: string = process.env.JWT_SECRET!;
  const token = jwt.sign({ email }, secretKey, { expiresIn: "24h" });
  return token;
};

export const generateRefreshToken = (email: string) => {
  const secretKey: string = process.env.JWT_SECRET!;
  const refreshToken = jwt.sign({ email }, secretKey, { expiresIn: "30d" });
  return refreshToken;
};

export const passwordEncryption = async (password: string) => {
  const encryptedPassword = await bcrypt.hash(password, 10);
  return encryptedPassword;
};
