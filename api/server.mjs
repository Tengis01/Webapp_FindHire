// pkill -f "node api/server.mjs"
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import process from "node:process";
import mongoose from "mongoose";
import Worker from "./models/Worker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use current working directory as root to avoid path issues
const rootDir = process.cwd();

const app = express();
const PORT = 3001;
const MONGO_URI = 'mongodb://localhost:27017/findhire';

// Global error handling to prevent server crashes
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection:', reason));

// Middleware
app.use(cors());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Routes-ийг static файлаас өмнө тодорхойлох
// Helper to create flexible regex for Mongolian/English search
function createMongolianRegex(term) {
  // 1. Check dictionary for direct English translations
  const lowerTerm = term.toLowerCase().trim();
  const dictionary = {
    "driver": "жолооч",
    "cleaner": "цэвэрлэгээ",
    "builder": "барилга",
    "plumber": "сантехник",
    "electrician": "цахилгаан",
    "painter": "будаг",
    "move": "нүүлгэлт",
    "mover": "нүүлгэлт",
    "nanny": "хүүхэд асрагч",
    "cook": "тогооч",
    "welder": "гагнуур",
    "carpenter": "мужаан"
  };

  let searchTerms = [term];
  if (dictionary[lowerTerm]) {
    searchTerms.push(dictionary[lowerTerm]);
  }

  // 2. Build Regex Pattern
  // Map Latin chars to potential Cyrillic matches
  const latinToCyrillic = {
    'a': '[аА]',
    'b': '[бБвВ]',
    'c': '[цЦчЧ]',
    'd': '[дД]',
    'e': '[еЕэЭ]',
    'f': '[фФ]',
    'g': '[гГ]',
    'h': '[хХ]',
    'i': '[иИйЙыЫ]',
    'j': '[жЖ]',
    'k': '[кК]',
    'l': '[лЛ]',
    'm': '[мМ]',
    'n': '[нН]',
    'o': '[оОөӨуУүҮ]', // Broad matching for vowels
    'p': '[пП]',
    'q': '[кК]',
    'r': '[рР]',
    's': '[сСшШ]',
    't': '[тТ]',
    'u': '[уУүҮ]',
    'v': '[вВ]',
    'w': '[вВ]',
    'x': '[хХ]',
    'y': '[уУүҮйЙ]',
    'z': '[зЗ]',
    'sh': '[шШ]',
    'ch': '[чЧ]',
    'kh': '[хХ]',
    'ts': '[цЦ]'
  };

  // Convert each term into a pattern
  const patterns = searchTerms.map(t => {
    let pattern = "";
    // If input is fully Latin, try to construct a mapped pattern
    const isLatin = /^[a-zA-Z\s]+$/.test(t);

    if (isLatin) {
      let i = 0;
      while (i < t.length) {
        // Check 2-char combos first
        const twoChar = t.substr(i, 2).toLowerCase();
        if (latinToCyrillic[twoChar]) {
          pattern += latinToCyrillic[twoChar];
          i += 2;
          continue;
        }

        const oneChar = t[i].toLowerCase();
        if (latinToCyrillic[oneChar]) {
          pattern += latinToCyrillic[oneChar];
        } else {
          // Keep special chars or unmapped chars as is (escaped)
          pattern += t[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        i++;
      }
      return `(${pattern}|${t})`; // Match generated cyrillic OR original latin
    } else {
      // Cyrillic input - just escape it
      return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  });

  // Join all variations with OR
  // Case insensitive flag 'i'
  return new RegExp(patterns.join('|'), 'i');
}

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
    const { main, sub, search, experience, availability, ratingRange } = req.query;
    console.log("API Request:", { main, sub, search, experience, availability, ratingRange });

    const query = {};

    // category filter
    if (main) {
      // Create case-insensitive regex for category
      query.category = new RegExp(`^${main.trim()}$`, 'i');
    }

    // subcategories filter
    if (sub) {
      const subList = sub.split(',').map(s => s.trim()).filter(Boolean);
      if (subList.length > 0) {
        // Use $all with regex to match subcategories case-insensitively
        query.subcategories = {
          $all: subList.map(s => new RegExp(s, 'i'))
        };
      }
    }

    // Search filter
    if (search) {
      const regex = createMongolianRegex(search);
      query.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
        { subcategories: { $in: [regex] } }
      ];
    }

    // Experience filter
    if (experience) {
      const minExp = parseFloat(experience);
      if (!isNaN(minExp)) {
        query.experience = { $gte: minExp };
      }
    }

    // Availability filter
    if (availability) {
      const days = availability.split(',').map(d => d.trim().toLowerCase());
      if (days.length > 0) {
        // Case insensitive matching for days in array
        // DB stores Capitalized days ("Даваа"), user might send lower case?
        // Actually JSON has "Даваа".
        // Let's use regex for safety or $in
        // For $all, we need to match all.
        // Can use list of regexes again.
        query.availability = {
          $all: days.map(d => new RegExp(`^${d}$`, 'i'))
        };
      }
    }

    // Rating filter
    if (ratingRange) {
      const minRating = parseFloat(ratingRange);
      if (!isNaN(minRating)) {
        query.rating = { $gte: minRating };
      }
    }

    const workers = await Worker.find(query);
    console.log(`Found ${workers.length} workers`);

    // Format response
    const formatted = workers.map((w) => ({
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
    console.error("API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Популяр ажилчдын API
app.get("/api/popular", async (req, res) => {
  try {
    // Get top 15 by rating decs, then jobs desc
    const workers = await Worker.find()
      .sort({ rating: -1, jobs: -1 })
      .limit(15);

    const formatted = workers.map((w) => ({
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

const server = app.listen(PORT, () => {
  console.log("");
  console.log("FindHire сервер амжилттай аслаа!");
  console.log(`http://localhost:${PORT}`);
  console.log("");
});

server.on('error', (e) => {
  console.error('Server Error:', e);
}); 