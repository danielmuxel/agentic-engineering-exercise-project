import express from "express";
import { config } from "./config/index.js";
import { taskRouter } from "./api/tasks.js";

const app = express();

app.use(express.json());
app.use("/tasks", taskRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: config.env });
});

app.listen(config.port, () => {
  console.log(`Task API running on http://localhost:${config.port}`);
});
