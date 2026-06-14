import { z } from "zod";

export const evaluateRequestSchema = z.object({
  contentId: z.string().min(1, "Content ID is required"),
  answers: z.array(
    z.object({
      questionId: z.number(),
      answerIndex: z.number().optional(),
      answerText: z.string().optional(),
    })
  ).min(1, "At least one answer is required")
});

export type EvaluateRequestInput = z.infer<typeof evaluateRequestSchema>;
