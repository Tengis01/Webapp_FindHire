import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Worker from './models/Worker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = 'mongodb+srv://roott:12345@cluster0.qrsusnj.mongodb.net/findhire?retryWrites=true&w=majority';
const DATA_PATH = path.join(__dirname, '../public/data/workers.json');

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        const data = await fs.readFile(DATA_PATH, 'utf-8');
        const json = JSON.parse(data);
        const workers = json.workers;

        await Worker.deleteMany({});
        console.log('Cleared existing workers');

        await Worker.insertMany(workers);
        console.log(`Imported ${workers.length} workers successfully`);

        process.exit(0);
    } catch (error) {
        console.error('Error importing data:', error);
        await fs.writeFile('api/seed_error.txt', `ERROR: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`);
        process.exit(1);
    }
};

seedData();
