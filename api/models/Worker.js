import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id: { type: Number, unique: true }, // Keeping legacy ID for compatibility if needed, but userId is better link
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    jobs: { type: Number, required: true },
    emoji: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    phone: { type: String, index: true },
    email: { type: String, index: true },
    subcategories: { type: [String], required: true },
    experience: { type: Number, required: true },
    availability: { type: [String], required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    subdistrict: { type: String, required: true },
});

const Worker = mongoose.model('Worker', workerSchema);

export default Worker;
