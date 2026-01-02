import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
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
        let workers = json.workers;

        // Create Default Admin User for these workers
        let adminUser = await User.findOne({ email: 'admin@findhire.com' });
        if (!adminUser) {
            console.log('Creating default admin user...');
            // We need to hash the password properly, or just use a dummy if we don't care about logging in as this user yet.
            // But better to use the User model properly. 
            // Since we can't easily import bcrypt here without making it complicated, let's just make a dummy user or assume User model handles it? 
            // Server.mjs handles hashing. User model has no pre-save hook in the file I saw?
            // Let's check api/server.mjs again... it hashes manually.
            // So we'll just insert a raw user. It's fine for `ref` purposes.
            adminUser = await User.create({
                firstname: 'Admin',
                lastname: 'User',
                email: 'admin@findhire.com',
                password: 'hashed_dummy_password', // won't work for login but works for ref
                role: 'Admin',
                phone: '99119911',
                address: 'Ulaanbaatar'
            });
        }

        // Attach userId to all workers
        workers = workers.map(w => ({ ...w, userId: adminUser._id }));

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
