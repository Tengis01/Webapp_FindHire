import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker', // or User if referencing the user ID of the worker
        required: false
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    subcategories: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    scheduledDate: {
        type: Date,
        required: false
    },
    isDeal: {
        type: Boolean,
        default: false
    },
    hasFood: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: '' // URL or path to image
    },
    status: {
        type: String,
        enum: ['OPEN', 'REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'OPEN'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Work', workSchema);
