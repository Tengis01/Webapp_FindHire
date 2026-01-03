// pkill -f "node api/server.mjs"
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import process from "node:process";
import mongoose from "mongoose";
import Worker from "./models/Worker.js";
import User from "./models/User.js";
import Work from "./models/Work.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_change_in_production"; // In real app, use env var


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use current working directory as root to avoid path issues
const rootDir = process.cwd();

const app = express();
const PORT = process.env.PORT || 3001;
// const MONGO_URI = 'mongodb://localhost:27017/findhire';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://roott:12345@cluster0.qrsusnj.mongodb.net/findhire?retryWrites=true&w=majority';

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
  const cyrillicToLatin = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'ye', 'ё': 'yo',
    'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'ө': 'u', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ү': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
    'щ': 'sh', 'ъ': '', 'ы': 'y', 'ь': 'i', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  const latinToCyrillic = {
    'a': '[аА]', 'b': '[бБвВ]', 'c': '[цЦчЧ]', 'd': '[дД]', 'e': '[еЕэЭ]',
    'f': '[фФ]', 'g': '[гГ]', 'h': '[хХ]', 'i': '[иИйЙыЫ]', 'j': '[жЖ]',
    'k': '[кК]', 'l': '[лЛ]', 'm': '[мМ]', 'n': '[нН]', 'o': '[оОөӨуУүҮ]',
    'p': '[пП]', 'q': '[кК]', 'r': '[рР]', 's': '[сСшШ]', 't': '[тТ]',
    'u': '[уУүҮ]', 'v': '[вВ]', 'w': '[вВ]', 'x': '[хХ]', 'y': '[уУүҮйЙ]',
    'z': '[зЗ]', 'sh': '[шШ]', 'ch': '[чЧ]', 'kh': '[хХ]', 'ts': '[цЦ]'
  };

  // Convert each term into a pattern
  const patterns = searchTerms.map(t => {
    // If input is fully Latin, try to construct a mapped pattern
    const isLatin = /^[a-zA-Z\s]+$/.test(t);
    const isCyrillic = /[а-яА-ЯөӨүҮ]/.test(t);

    if (isLatin) {
      let pattern = "";
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
          pattern += t[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        i++;
      }
      return `(${pattern}|${t})`;
    } else if (isCyrillic) {
      // Convert Cyrillic to Latin Regex
      let latinPattern = "";
      for (let char of t.toLowerCase()) {
        if (cyrillicToLatin[char] !== undefined) {
          latinPattern += cyrillicToLatin[char]; // e.g. "т" -> "t"
        } else {
          latinPattern += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
      }
      return `(${latinPattern}|${t})`;
    } else {
      // Other
      return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  });

  // Join all variations with OR
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
    const lastWorker = await Worker.findOne().sort({ id: -1 });
    const nextId = lastWorker && lastWorker.id ? lastWorker.id + 1 : 1001;

    // Smart Initials for Mongolian Names
    let initial = lastname.charAt(0).toUpperCase();
    const l = lastname.trim();
    // Check for common digraphs at start: Sh, Ch, Ts, Kh
    // Need to handle both Latin and Cyrillic if necessary, 
    // but typically Lastname input determines it. 
    // Here we check Latin digraphs.
    if (/^(sh|ch|ts|kh)/i.test(l)) {
      initial = l.substring(0, 2);
      // Capitalize first, lowercase second: "Sh"
      initial = initial.charAt(0).toUpperCase() + initial.charAt(1).toLowerCase();
    }
    // Also check Cyrillic digraphs if they exist as 2 chars? Usually 1 char in Cyrillic (Ш, Ч, Ц, Х). 
    // If user typed Latin-Mongolian "Sharav", we get "Sh". 
    // If user typed Cyrillic "Шарав", we get "Ш". Correct.

    // Extract subdistrict from address (last part after comma)
    // Format: "City, District, Subdistrict" -> take last part
    let subdistrict = "N/A";
    if (address && address.includes(',')) {
      const parts = address.split(',').map(p => p.trim());
      subdistrict = parts[parts.length - 1] || "N/A";
    }

    const worker = new Worker({
      userId: savedUser._id,
      id: nextId,
      name: `${initial}.${firstname}`, // e.g. "Sh.Tengis" or "Т.Тэнгис"
      rating: 5.0, // New worker default
      jobs: 0,
      emoji: emoji || "👷",
      description: description || "Тайлбар оруулаагүй",
      category,
      subcategories: Array.isArray(subcategories) ? subcategories : [subcategories],
      experience: Number(experience) || 0,
      availability: Array.isArray(availability) ? availability : [availability],
      phone: phone || "",
      address: address || "",
      subdistrict: subdistrict
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

    let workerProfile = null;
    if (user && user.role === 'Worker') {
      workerProfile = await Worker.findOne({ userId: user._id });
    }

    res.json({ user, workerProfile });
  } catch (err) {
    res.clearCookie('token');
    res.json({ user: null });
  }
});

// 6. Update Worker Profile
app.put("/api/workers/profile", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== 'Worker') {
      return res.status(403).json({ error: "Access denied" });
    }

    const { category, subcategories, description, phone, email, firstname, lastname } = req.body;

    // Update User fields (Phone, Email, Name) - basic fields
    if (phone) user.phone = phone;
    // Email/Name changes might require checks, ignoring for simplicity or adding simple updates
    // const existingEmail = ...
    await user.save();

    // Update Worker fields
    const worker = await Worker.findOne({ userId: user._id });
    if (worker) {
      if (category) worker.category = category;
      if (subcategories) worker.subcategories = Array.isArray(subcategories) ? subcategories : [subcategories];
      if (description) worker.description = description;
      await worker.save();
    }

    res.json({ message: "Profile updated", user, workerProfile: worker });

  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Work Request API

// Create Work (User only)
app.post('/api/work', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    // Strict Checks
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.role !== 'User') return res.status(403).json({ error: "Only Users can post work requests" });

    const { title, description, price, hasFood, image, category, subcategories, isDeal } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ error: "Title, description, and category are required" });
    }

    const work = new Work({
      userId: user._id,
      title,
      description,
      category,
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      price: Number(price) || 0,
      isDeal: Boolean(isDeal),
      hasFood: Boolean(hasFood),
      image: image || "",
      status: 'OPEN'
    });

    await work.save();
    console.log(`New Work Created: ${title} (${category}) by ${user.email}`);

    res.status(201).json({ message: "Work request created", work });

  } catch (err) {
    console.error("Create Work Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Works (For Home Page)
app.get('/api/work', async (req, res) => {
  try {
    // Determine sort content
    // Fetch works sorted by newest first
    const works = await Work.find({ status: 'OPEN' })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstname lastname role') // Fetch user name
      .exec();

    const formatted = works.map(w => {
      // Handle User Name display
      let userName = "Unknown User";
      if (w.userId) {
        // Smart Initials logic again
        const fname = w.userId.firstname || "";
        const lname = w.userId.lastname || "";

        let initial = lname.charAt(0).toUpperCase();
        if (/^(sh|ch|ts|kh)/i.test(lname)) {
          initial = lname.substring(0, 2);
          initial = initial.charAt(0).toUpperCase() + initial.charAt(1).toLowerCase();
        }
        if (lname) {
          userName = `${initial}.${fname}`;
        } else {
          userName = fname;
        }
      }

      return {
        _id: w._id,
        title: w.title,
        description: w.description,
        category: w.category,
        subcategories: w.subcategories,
        price: w.price,
        isDeal: w.isDeal,
        hasFood: w.hasFood,
        image: w.image,
        createdAt: w.createdAt,
        user: {
          name: userName,
          role: w.userId ? w.userId.role : 'User'
        }
      };
    });

    res.json(formatted);

  } catch (err) {
    console.error("Get Works Error:", err);
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