// src/lib/auth/utils.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS } from '../config';

export function hashPassword(password: string): string {
  if (!password) return "";
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  if (!plainPassword || !hashedPassword) return false;
  try {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  } catch (e) {
    return false;
  }
}

export function createAccessToken(data: Record<string, any>, expiresInMinutes?: number): string {
  const expiresIn = expiresInMinutes 
    ? `${expiresInMinutes}m` 
    : data.user_type === 'admin' ? '7d' : `${ACCESS_TOKEN_EXPIRE_MINUTES}m`;
    
  return jwt.sign(
    { ...data, type: "access" },
    SECRET_KEY,
    { expiresIn: expiresIn as any }
  );
}

export function createRefreshToken(data: Record<string, any>): string {
  return jwt.sign(
    { ...data, type: "refresh" },
    SECRET_KEY,
    { expiresIn: `${REFRESH_TOKEN_EXPIRE_DAYS}d` as any }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}
