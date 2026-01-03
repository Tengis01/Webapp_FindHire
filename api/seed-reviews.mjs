import mongoose from "mongoose";
import Review from "./models/Review.js";
import process from "node:process";

// Use same URI as server
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://roott:12345@cluster0.qrsusnj.mongodb.net/findhire?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Seeding");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

const firstNames = [
  "Bat", "Dorj", "Bold", "Tuya", "Sarnai", "Chimid", "Ganaa", "Saraa", "Naraa", "Tsetseg",
  "Tengis", "Anar", "Bilguun", "Khuslen", "Uchral", "Temuujin", "Khulan", "Nomin", "Erdene"
];

const lastNames = ["B.", "D.", "G.", "O.", "Ts.", "Kh.", "N.", "E.", "S.", "M."];

const templates = [
  { text: "Маш сайн үйлчилгээ!", lang: "mn", rating: 5 },
  { text: "Mash sain uilchilgee!", lang: "latin", rating: 5 },
  { text: "Цагтаа ирсэн, баярлалаа.", lang: "mn", rating: 4 },
  { text: "Tsagtaa irsen, bayarlalaa.", lang: "latin", rating: 4 },
  { text: "Дажгүй шүү.", lang: "mn", rating: 4 },
  { text: "Dajgui shuu.", lang: "latin", rating: 4 },
  { text: "Sain ajilladaagui.", lang: "latin", rating: 2 },
  { text: "Сайн ажиллаагүй.", lang: "mn", rating: 2 },
  { text: "Uneheer setgel hangaluun baina.", lang: "latin", rating: 5 },
  { text: "Үнэхээр сэтгэл хангалуун байна.", lang: "mn", rating: 5 },
  { text: "Hudlaa yariad ireegui.", lang: "latin", rating: 1 },
  { text: "Худлаа яриад ирээгүй.", lang: "mn", rating: 1 },
  { text: "Super!", lang: "latin", rating: 5 },
  { text: "Мундаг!", lang: "mn", rating: 5 },
  { text: "Ajlaa meddeg hun bn.", lang: "latin", rating: 5 },
  { text: "Ажлаа мэддэг хүн байна.", lang: "mn", rating: 5 },
  { text: "Une dundaj.", lang: "latin", rating: 3 },
  { text: "Үнэ дундаж.", lang: "mn", rating: 3 },
  { text: "Hurdan shuurhai.", lang: "latin", rating: 5 },
  { text: "Хурдан шуурхай.", lang: "mn", rating: 5 }
];

const generateRandomReview = () => {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  const t = templates[Math.floor(Math.random() * templates.length)];
  
  // Add some randomness to rating
  let r = t.rating;
  if (Math.random() > 0.8) r = Math.max(1, Math.min(5, r + (Math.random() > 0.5 ? 1 : -1)));

  return {
    user: `${l}${f}`,
    text: t.text,
    rating: r,
    lang: t.lang
  };
};

const seedReviews = async () => {
  await connectDB();

  console.log("Dropping existing reviews collection...");
  try {
    await mongoose.connection.db.dropCollection('reviews');
  } catch (err) {
    if (err.code === 26) {
      console.log("Collection does not exist, skipping drop.");
    } else {
      console.error("Error dropping collection:", err);
    }
  }

  console.log("Generating 60 key reviews...");
  const reviews = [];
  for (let i = 0; i < 60; i++) {
    reviews.push(generateRandomReview());
  }

  try {
    await Review.insertMany(reviews);
    console.log("Seeding complete!");
  } catch (err) {
    console.error("Seeding Error:", err);
    if (err.writeErrors) {
      console.error("Write Errors:", err.writeErrors);
    }
  }
  
  mongoose.connection.close();
};

seedReviews();
