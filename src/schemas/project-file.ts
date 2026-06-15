import { z } from "zod";

export const createFileSchema = z.object({
  path: z.string().min(1, "File path is required"),
  content: z.string().default(""),
  language: z.string().default("plaintext")
});

export const updateFileContentSchema = z.object({
  content: z.string()
});
