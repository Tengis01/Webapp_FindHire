import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());

// Routes-ийг static файлаас өмнө тодорхойлох
app.get("/", (req, res) => {
  res.sendFile(join(rootDir, "public", "index.html"));
});

// Sign-in хуудас route
app.get("/sign-in", (req, res) => {
  res.sendFile(join(rootDir, "sign-in", "sign-in.html"));
});

// Ажилд орох хуудас route  
app.get("/ajild-oroh", (req, res) => {
  res.sendFile(join(rootDir, "ajild-oroh", "ajild-oroh.html"));
});

// Profile хуудас route
app.get("/profile", (req, res) => {
  res.sendFile(join(rootDir, "profile", "profile.html"));
});

// About-us хуудас route
app.get("/about-us", (req, res) => {
  res.sendFile(join(rootDir, "about-us", "about-us.html"));
});

// Static файлууд (routes-ээс хойш)
app.use(express.static(join(rootDir, "public")));
app.use(express.static(rootDir));

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

    const { main, sub, search, experience, ratingRange } = req.query;

    console.log("API Request:", { main, sub, search, experience, ratingRange });
    console.log("Total workers:", workers.length);

    // category талбараар шүүнэ
    if (main) {
      workers = workers.filter(
        (w) => w.category?.trim().toLowerCase() === main.trim().toLowerCase()
      );
      console.log(`After main filter: ${workers.length}`);
    }

    // subcategories array-с олно (олон subcategory дэмжинэ)
    if (sub) {
      // sub нь таслалаар тусгаарлагдсан утгууд байж болно (e.g., "Цахилгаан,Сантехник")
      const subList = sub.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

      if (subList.length > 0) {
        workers = workers.filter((w) => {
          if (!w.subcategories || !Array.isArray(w.subcategories)) return false;
          // Хэрэв ажилчдын subcategories-ын аль нэг нь шүүлтийн жагсаалтад байвал
          return w.subcategories.some((sc) =>
            subList.includes(sc.trim().toLowerCase())
          );
        });
        console.log(`After sub filter: ${workers.length}`);
      }
    }

    // Experience filter - minimum experience шаардлагаар шүүнэ
    if (experience) {
      const minExp = parseFloat(experience);
      if (!isNaN(minExp)) {
        workers = workers.filter((w) => {
          const workerExp = parseFloat(w.experience || 0);
          return workerExp >= minExp;
        });
        console.log(`After experience filter (>= ${minExp}): ${workers.length}`);
      }
    }

    // Rating range filter - minimum rating-аар шүүнэ
    if (ratingRange) {
      const minRating = parseFloat(ratingRange);
      if (!isNaN(minRating)) {
        workers = workers.filter((w) => {
          const workerRating = parseFloat(w.rating || 0);
          return workerRating >= minRating;
        });
        console.log(`After rating filter (>= ${minRating}): ${workers.length}`);
      }
    }

    // Search filter
    if (search) {
      const term = search.toLowerCase();
      workers = workers.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.description.toLowerCase().includes(term)
      );
      console.log(`After search filter: ${workers.length}`);
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
      experience: w.experience, // Debugging-д хэрэгтэй
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
  console.log("FindHire сервер амжилттай аслаа!");
  console.log(`http://localhost:${PORT}`);
  console.log("");
}); 