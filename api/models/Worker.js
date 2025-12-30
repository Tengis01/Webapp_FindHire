import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    jobs: { type: Number, required: true },
    emoji: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategories: { type: [String], required: true },
    experience: { type: Number, required: true },
    availability: { type: [String], required: true },
});

const Worker = mongoose.model('Worker', workerSchema);

export default Worker;
