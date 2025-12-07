import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(join(rootDir, "public")));

app.get("/", (req, res) => {
  res.sendFile(join(rootDir, "public", "index.html"));
});

// Ажилчдыг шүүж авах API
app.get("/api/workers", async (req, res) => {
  try {
    const fs = await import("node:fs/promises");
    const data = await fs.readFile(
      join(rootDir, "public", "data", "workers.json"),
      "utf-8"
    );
    const jsonData = JSON.parse(data);
    let workers = jsonData.workers || jsonData;

    const { main, sub, search } = req.query;

    console.log("API Request:", { main, sub, search });
    console.log("Total workers:", workers.length);

    // category талбараар шүүнэ
    if (main) {
      workers = workers.filter(
        (w) => w.category?.trim().toLowerCase() === main.trim().toLowerCase()
      );
      console.log(`After main filter: ${workers.length}`);
    }

    // subcategories array-с олно
    if (sub) {
      workers = workers.filter((w) => {
        if (!w.subcategories || !Array.isArray(w.subcategories)) return false;
        return w.subcategories.some(
          (sc) => sc.trim().toLowerCase() === sub.trim().toLowerCase()
        );
      });
      console.log(`After sub filter: ${workers.length}`);
    }

    if (search) {
      const term = search.toLowerCase();
      workers = workers.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.description.toLowerCase().includes(term)
      );
    }

    // Response форматыг mini-job-card-д тохируулах
    const formatted = workers.map((w) => ({
      name: w.name,
      rating: String(w.rating),
      jobs: `${w.jobs} ${w.emoji || "🤝"}`,
      description: w.description,
      pic: w.pic || "",
      category: w.category,
      subcategories: w.subcategories,
    }));

    console.log(`Sending ${formatted.length} workers`);
    res.json(formatted);
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Популяр ажилчдын API
app.get("/api/popular", async (req, res) => {
  try {
    const fs = await import("node:fs/promises");
    const data = await fs.readFile(
      join(rootDir, "public", "data", "workers.json"),
      "utf-8"
    );
    const jsonData = JSON.parse(data);
    const workers = jsonData.workers || jsonData;

    const sorted = workers
      .sort((a, b) => b.rating - a.rating || b.jobs - a.jobs)
      .slice(0, 15);

    const formatted = sorted.map((w) => ({
      name: w.name,
      rating: String(w.rating),
      jobs: `${w.jobs} ${w.emoji || "🤝"}`,
      description: w.description,
      pic: w.pic || "",
      category: w.category,
      subcategories: w.subcategories,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Popular API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("");
  console.log("🚀 FindHire сервер амжилттай аслаа!");
  console.log(`🔗 http://localhost:${PORT}`);
  console.log("");
});