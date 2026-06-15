import { z } from "zod";

export const codeReviewRequestSchema = z.object({
  fileContent: z.string(),
  language: z.string(),
  fileName: z.string()
});

export const ideaGenRequestSchema = z.object({
  problemStatementId: z.string().optional(),
  currentIdea: z.string().optional()
});
