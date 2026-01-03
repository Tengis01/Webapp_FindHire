import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Name of reviewer
  text: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  lang: { type: String, default: 'mn' }, // 'mn', 'latin'
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Review", reviewSchema);
