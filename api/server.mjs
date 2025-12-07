import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url"; // Changed to node:url
import { dirname, join } from "node:path"; // Changed to node:path

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, ".."); // Going back to ICSI301/

const app = express();
const PORT = 3000;

app.use(cors());

// Serve all static files from the "public" folder
app.use(express.static(join(rootDir, "public")));

// Serve index.html when localhost:3000 is accessed
app.get("/", (req, res) => {
  res.sendFile(join(rootDir, "public", "index.html"));
});

// Dynamic API to filter workers
app.get("/api/workers", async (req, res) => {
  try {
    const fs = await import("node:fs/promises"); // Changed to node:fs/promises
    const data = await fs.readFile(join(rootDir, "data", "workers.json"), "utf-8");
    let workers = JSON.parse(data);

    const { main_category, sub_category, search } = req.query;

    if (main_category) {
      workers = workers.filter(w => w.main_category?.trim() === main_category.trim());
    }
    if (sub_category) {
      workers = workers.filter(w => w.sub_category?.trim() === sub_category.trim());
    }
    if (search) {
      const term = search.toLowerCase();
      workers = workers.filter(w => 
        w.name.toLowerCase().includes(term) ||
        w.description.toLowerCase().includes(term)
      );
    }

    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).json([]); // Handle the error or don't catch it if you prefer
  }
});

// API for popular workers (for load-popular.js)
app.get("/api/popular", async (req, res) => {
  try {
    const fs = await import("node:fs/promises"); // Changed to node:fs/promises
    const data = await fs.readFile(join(rootDir, "data", "workers.json"), "utf-8");
    const workers = JSON.parse(data);

    res.json(
      workers
        .sort((a, b) => b.rating - a.rating || Number.parseInt(b.jobs) - Number.parseInt(a.jobs)) // Changed parseInt to Number.parseInt
        .slice(0, 15)
    );
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log("");
  console.log("🚀 FindHire server is up and running!");
  console.log(`🔗 http://localhost:${PORT}`);
  console.log("");
});
