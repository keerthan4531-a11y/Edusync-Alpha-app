// src/lib/config.ts
// Constants and configuration settings extracted from Python config.py

export const SECRET_KEY = process.env.SECRET_KEY || "edusync-secret-key-2025-v1-do-not-use-in-production";
export const ALGORITHM = "HS256";
export const ACCESS_TOKEN_EXPIRE_MINUTES = 1440; // 24 hours for regular users
export const REFRESH_TOKEN_EXPIRE_DAYS = 30;

// Pollinations AI config
export const POLLINATIONS_API_BASE = process.env.POLLINATIONS_API_BASE || "https://text.pollinations.ai/openai";
export const POLLINATIONS_MODEL = process.env.POLLINATIONS_MODEL || "openai";

export const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.mp3', '.mp4', '.txt', '.py', '.java', '.cpp', '.c', '.js', '.html', '.css', '.md', '.json', '.csv', '.xlsx', '.docx'];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
