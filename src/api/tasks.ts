import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { validateTask, validateTaskUpdate, type Task } from "../utils/validate.js";

const router = Router();
const tasks = new Map<string, Task>();

router.get("/", (_req: Request, res: Response) => {
  res.json([...tasks.values()]);
});

router.post("/", (req: Request, res: Response) => {
  const result = validateTask(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  const task: Task = {
    id: randomUUID(),
    ...result.data,
    createdAt: new Date(),
    completed: false,
  };

  tasks.set(task.id, task);
  res.status(201).json(task);
});

router.get("/stats", (_req: Request, res: Response) => {
  const all = [...tasks.values()];
  const completed = all.filter((t) => t.completed).length;
  const byPriority = { low: 0, medium: 0, high: 0 };
  for (const t of all) {
    byPriority[t.priority]++;
  }
  res.json({
    total: all.length,
    completed,
    pending: all.length - completed,
    byPriority,
  });
});

router.get("/:id", (req: Request, res: Response) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

router.put("/:id", (req: Request, res: Response) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const result = validateTaskUpdate(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  const updated = { ...task, ...result.data };
  tasks.set(task.id, updated);
  res.json(updated);
});

router.delete("/:id", (req: Request, res: Response) => {
  if (!tasks.delete(req.params.id)) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.status(204).send();
});

export { router as taskRouter };
