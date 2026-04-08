import { z } from "zod";

export const TaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const TaskUpdateSchema = TaskSchema.partial();

export type Task = z.infer<typeof TaskSchema> & {
  id: string;
  createdAt: Date;
  completed: boolean;
};

export function validateTask(data: unknown) {
  return TaskSchema.safeParse(data);
}

export function validateTaskUpdate(data: unknown) {
  return TaskUpdateSchema.safeParse(data);
}
