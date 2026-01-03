import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
        enum: ['OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED'],
        default: 'OPEN'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Work', workSchema);
