import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static файлууд serve хийх
app.use(express.static('public'));
app.use('/ajild-oroh', express.static('ajild-oroh'));

// MongoDB холболт
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/findhire';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB холбогдлоо'))
  .catch(err => console.error('❌ MongoDB холболтын алдаа:', err));

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

// Routes

// 1. Ажилд орох хүсэлт илгээх
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

// 2. Бүх хүсэлтүүдийг харах (Admin)
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

// 3. Нэг хүсэлтийг ID-аар нь харах
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

// 4. Хүсэлтийн статусыг шинэчлэх
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

// 5. Хүсэлт устгах
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

// 6. Статистик мэдээлэл
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
  console.log(`🚀 Server http://localhost:${PORT} дээр ажиллаж байна`);
});0
