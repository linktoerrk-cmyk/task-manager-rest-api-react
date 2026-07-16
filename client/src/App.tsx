import { useState, useEffect } from "react";

const API = "http://localhost:4000/api";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  async function fetchTasks() {
    const res = await fetch(`${API}/tasks`, { headers });
    if (res.ok) setTasks(await res.json());
  }

  async function handleAuth() {
    setAuthError("");
    const res = await fetch(`${API}/${authMode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return setAuthError(data.error || "Something went wrong");
    if (authMode === "login") {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      setAuthMode("login");
      setAuthError("Registered! Please log in.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
  }

  async function addTask() {
    if (!newTitle.trim()) return;
    const res = await fetch(`${API}/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title: newTitle, description: newDesc }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks([task, ...tasks]);
      setNewTitle("");
      setNewDesc("");
    }
  }

  async function toggleTask(task: Task) {
    const res = await fetch(`${API}/tasks/${task.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ completed: !task.completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    }
  }

  async function deleteTask(id: number) {
    const res = await fetch(`${API}/tasks/${id}`, { method: "DELETE", headers });
    if (res.ok) setTasks(tasks.filter((t) => t.id !== id));
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif" }}>
        <h1>Task Manager</h1>
        <h2>{authMode === "login" ? "Log In" : "Register"}</h2>
        {authError && <p style={{ color: "red" }}>{authError}</p>}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <button onClick={handleAuth} style={{ width: "100%", padding: 10, marginBottom: 8 }}>
          {authMode === "login" ? "Log In" : "Register"}
        </button>
        <button
          onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
          style={{ width: "100%", padding: 10, background: "none", border: "1px solid #ccc" }}
        >
          {authMode === "login" ? "Need an account? Register" : "Have an account? Log In"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Tasks</h1>
        <button onClick={logout}>Log Out</button>
      </div>

      <div style={{ marginBottom: 24, padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Add Task</h3>
        <input
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8, boxSizing: "border-box" }}
        />
        <input
          placeholder="Description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8, boxSizing: "border-box" }}
        />
        <button onClick={addTask} style={{ padding: "8px 20px" }}>Add</button>
      </div>