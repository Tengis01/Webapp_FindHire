// pkill -f "node api/server.mjs"
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import process from "node:process";
import mongoose from "mongoose";
import Worker from "./models/Worker.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const JWT_SECRET = "your_super_secret_key_change_in_production"; // In real app, use env var


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
// Middleware
app.use(express.json()); // Enable JSON body parsing
app.use(cookieParser());
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
  res.sendFile(join(rootDir, "public", "ajild-oroh", "ajild-oroh.html"));
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
// Authentication Routes

// 1. Unified Sign In
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email or password incorrect" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Email or password incorrect" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: "Successfully logged in", user: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Signin Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. User Sign Up
app.post("/api/auth/signup/user", async (req, res) => {
  try {
    const { firstname, lastname, email, phone, address, password } = req.body;

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = new User({
      firstname,
      lastname,
      email,
      phone,
      address,
      password: hashedPassword,
      role: 'User'
    });
    await user.save();

    // Auto login (generate token)
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ message: "User registered successfully", user: { firstname, role: 'User' } });
  } catch (err) {
    console.error("User Signup Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Worker Sign Up
app.post("/api/auth/signup/worker", async (req, res) => {
  try {
    const {
      firstname, lastname, email, phone, address, password,
      category, subcategories, experience, description, availability,
      // Default overrideable fields
      emoji
    } = req.body;

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = new User({
      firstname,
      lastname,
      email,
      phone,
      address,
      password: hashedPassword,
      role: 'Worker'
    });
    const savedUser = await user.save();

    // Create Worker Profile
    // Note: 'subcategories' and 'availability' might come as arrays or comma-separated strings depending on client.
    // We'll normalize them here if needed.

    // Auto-generate ID (simple max+1 strategy for now, or random)
    // Ideally use UUID or let Mongo ID be sufficient, but Schema has customized Number ID.
    // Let's find max ID.
    const lastWorker = await Worker.findOne().sort({ id: -1 });
    const nextId = lastWorker && lastWorker.id ? lastWorker.id + 1 : 1001;

    const worker = new Worker({
      userId: savedUser._id,
      id: nextId,
      name: `${lastname.charAt(0)}.${firstname}`, // Standard Mongolian formatting
      rating: 5.0, // New worker default
      jobs: 0,
      emoji: emoji || "👷",
      description: description || "Тайлбар оруулаагүй",
      category,
      subcategories: Array.isArray(subcategories) ? subcategories : [subcategories],
      experience: Number(experience) || 0,
      availability: Array.isArray(availability) ? availability : [availability]
    });

    await worker.save();

    // Auto login
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ message: "Worker registered successfully", user: { firstname, role: 'Worker' } });

  } catch (err) {
    console.error("Worker Signup Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Logged out" });
});

// 5. Get Current User (Me)
app.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    res.json({ user });
  } catch (err) {
    res.clearCookie('token');
    res.json({ user: null });
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