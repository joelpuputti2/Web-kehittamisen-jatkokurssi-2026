import express from "express";
import cors from "cors";
import pool from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Needed in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running successfully 🚀" });
});

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, task_name, task_description, priority, created_at, updated_at FROM tasks ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { task_name, task_description, priority } = req.body;

    const result = await pool.query(
      "INSERT INTO tasks (task_name, task_description, priority) VALUES ($1, $2, $3) RETURNING id, task_name, task_description, priority, created_at, updated_at",
      [task_name, task_description, priority]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Insert failed:", error);
    res.status(500).json({ error: "Insert failed" });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});