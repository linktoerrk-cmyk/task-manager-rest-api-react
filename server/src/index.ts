import express, { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const PORT = process.env.PORT || 4000;

// ---------- Auth Middleware ----------
interface AuthRequest extends Request {
  userId?: number;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ---------- Auth Routes ----------
app.post("/api/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashed]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Email already in use" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, email: user.email });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- Task Routes ----------
app.get("/api/tasks", authMiddleware, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
    [req.userId]
  );
  res.json(result.rows);
});

app.post("/api/tasks", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const result = await pool.query(
    "INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *",
    [req.userId, title, description || null]
  );
  res.status(201).json(result.rows[0]);
});

app.put("/api/tasks/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  const result = await pool.query(
    `UPDATE tasks
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         completed = COALESCE($3, completed)
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [title, description, completed, id, req.userId]
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Task not found" });
  res.json(result.rows[0]);
});

app.delete("/api/tasks/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, req.userId]
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Task not found" });
  res.json({ message: "Task deleted" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));