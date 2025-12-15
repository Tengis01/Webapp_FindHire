import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB холболт
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/findhire';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB холбогдлоо'))
  .catch(err => console.error('MongoDB холболтын алдаа:', err));

// Ажилд орогчийн Schema
const jobApplicationSchema = new mongoose.Schema({
  last: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },
  age: {
    type: Number,
    required: true,
    min: 21,
    max: 60
  },
  position: {
    type: String,
    required: true,
    enum: ['dotood', 'gadna', 'santehnik', 'tsahilgaan', 'orom', 'goyl']
  },
  experience: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  phone: {
    type: String,
    required: true,
    match: /^[6-9][0-9]{7}$/
  },
  availability: {
    type: String,
    required: true,
    enum: ['full-time', 'half-time']
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

// HTML Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "public", "index.html"));
});

app.get("/sign-in", (req, res) => {
  res.sendFile(path.join(rootDir, "sign-in", "sign-in.html"));
});

app.get("/ajild-oroh", (req, res) => {
  res.sendFile(path.join(rootDir, "ajild-oroh", "ajild-oroh.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(rootDir, "profile", "profile.html"));
});

app.get("/about-us", (req, res) => {
  res.sendFile(path.join(rootDir, "about-us", "about-us.html"));
});

// Static файлууд
app.use(express.static(path.join(rootDir, 'public')));
app.use(express.static(rootDir));

// API Routes

// 1. Ажилчдыг шүүж авах API (Workers filter)
app.get("/api/workers", async (req, res) => {
  try {
    const fs = await import("fs/promises");
    const data = await fs.readFile(
      path.join(rootDir, "public", "data", "workers.json"),
      "utf-8"
    );
    const jsonData = JSON.parse(data);
    let workers = jsonData.workers || jsonData;

    const { main, sub, search, minRating, serviceType, experience, paintType, repairType, floorType, budget } = req.query;

    console.log("API Request:", req.query);
    console.log("Total workers:", workers.length);

    // Category filter
    if (main) {
      workers = workers.filter(
        (w) => w.category?.trim().toLowerCase() === main.trim().toLowerCase()
      );
      console.log(`After main filter: ${workers.length}`);
    }

    // Subcategory filter
    if (sub) {
      workers = workers.filter((w) => {
        if (!w.subcategories || !Array.isArray(w.subcategories)) return false;
        return w.subcategories.some(
          (sc) => sc.trim().toLowerCase() === sub.trim().toLowerCase()
        );
      });
      console.log(`After sub filter: ${workers.length}`);
    }

    // Search filter
    if (search) {
      const term = search.toLowerCase();
      workers = workers.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.description.toLowerCase().includes(term)
      );
    }

    // Rating filter
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      workers = workers.filter((w) => w.rating >= minRatingNum);
      console.log(`After rating filter: ${workers.length}`);
    }

    // Service type filter
    if (serviceType) {
      const types = serviceType.split(',');
      workers = workers.filter((w) => 
        types.some(type => w.serviceType?.includes(type))
      );
    }

    // Experience filter
    if (experience) {
      const expValues = experience.split(',').map(Number);
      workers = workers.filter((w) => 
        expValues.some(exp => w.experience >= exp)
      );
    }

    // Paint type filter
    if (paintType) {
      const types = paintType.split(',');
      workers = workers.filter((w) => 
        types.some(type => w.paintType?.includes(type))
      );
    }

    // Repair type filter
    if (repairType) {
      const types = repairType.split(',');
      workers = workers.filter((w) => 
        types.some(type => w.repairType?.includes(type))
      );
    }

    // Floor type filter
    if (floorType) {
      const types = floorType.split(',');
      workers = workers.filter((w) => 
        types.some(type => w.floorType?.includes(type))
      );
    }

    // Budget filter
    if (budget) {
      const budgets = budget.split(',');
      workers = workers.filter((w) => 
        budgets.some(b => w.budget?.includes(b))
      );
    }

    // Response format
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

// 2. Ажилд орох хүсэлт илгээх
app.post('/api/job-application', async (req, res) => {
  try {
    const applicationData = {
      last: req.body.last,
      name: req.body.name,
      email: req.body.email,
      age: parseInt(req.body.age),
      position: req.body.posotion,
      experience: parseInt(req.body.experience),
      phone: req.body.dugaar,
      availability: req.body.valiability,
      message: req.body.message
    };

    const newApplication = new JobApplication(applicationData);
    await newApplication.save();

    res.status(201).json({
      success: true,
      message: 'Таны хүсэлт амжилттай илгээгдлээ!',
      data: newApplication
    });
  } catch (error) {
    console.error('Алдаа:', error);
    res.status(400).json({
      success: false,
      message: 'Хүсэлт илгээхэд алдаа гарлаа',
      error: error.message
    });
  }
});

// 3. Бүх хүсэлтүүдийг харах (Admin)
app.get('/api/job-applications', async (req, res) => {
  try {
    const { status, position, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (position) query.position = position;

    const applications = await JobApplication.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Алдаа гарлаа',
      error: error.message
    });
  }
});

// 4. Нэг хүсэлтийг ID-аар нь харах
app.get('/api/job-application/:id', async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Хүсэлт олдсонгүй'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Алдаа гарлаа',
      error: error.message
    });
  }
});

// 5. Хүсэлтийн статусыг шинэчлэх
app.patch('/api/job-application/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Хүсэлт олдсонгүй'
      });
    }

    res.json({
      success: true,
      message: 'Статус амжилттай шинэчлэгдлээ',
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Алдаа гарлаа',
      error: error.message
    });
  }
});

// 6. Хүсэлт устгах
app.delete('/api/job-application/:id', async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Хүсэлт олдсонгүй'
      });
    }

    res.json({
      success: true,
      message: 'Хүсэлт амжилттай устгагдлаа'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Алдаа гарлаа',
      error: error.message
    });
  }
});

// 7. Статистик мэдээлэл
app.get('/api/statistics', async (req, res) => {
  try {
    const total = await JobApplication.countDocuments();
    const pending = await JobApplication.countDocuments({ status: 'pending' });
    const accepted = await JobApplication.countDocuments({ status: 'accepted' });
    const rejected = await JobApplication.countDocuments({ status: 'rejected' });

    const byPosition = await JobApplication.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        accepted,
        rejected,
        byPosition
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Алдаа гарлаа',
      error: error.message
    });
  }
});

// Server эхлүүлэх
app.listen(PORT, () => {
  console.log('');
  console.log('FindHire сервер амжилттай аслаа!');
  console.log(`http://localhost:${PORT}`);
  console.log('');
});