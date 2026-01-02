import mongoose from "mongoose";
import Worker from "../api/models/Worker.js";

// 🔗 MongoDB connect (шууд)
await mongoose.connect("mongodb://127.0.0.1:27017/findhire");
console.log("✅ MongoDB connected");

// 📞 Монгол утас
function randomPhone() {
  const prefixes = ["99", "95", "94", "88", "86"];
  return (
    prefixes[Math.floor(Math.random() * prefixes.length)] +
    Math.floor(100000 + Math.random() * 900000)
  );
}

// 📧 Email
function generateEmail(name, id) {
  return (
    name.toLowerCase().replace(/\s+/g, "").replace(/[^a-zа-яөүё]/gi, "") +
    id +
    "@gmail.com"
  );
}

// 🔍 phone/email байхгүй worker-ууд
const workers = await Worker.find({
  $or: [{ phone: { $exists: false } }, { phone: "" }]
});

console.log(`🔍 ${workers.length} workers found`);

// 🔄 Update
for (const w of workers) {
  if (!w.phone) w.phone = randomPhone();
  if (!w.email) w.email = generateEmail(w.name, w.id);

  await w.save();
  console.log(`✔ ${w.name} → ${w.phone} | ${w.email}`);
}

console.log("🎉 DONE");
await mongoose.disconnect();
process.exit(0);
