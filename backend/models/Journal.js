const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mood: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    aiAnalysis: {
        sentiment: {
            score: Number,
            primaryEmotion: String,
            secondaryEmotions: [String]
        },
        summary: {
            brief: String,
            detailed: String
        },
        recommendations: [String],
        dailyReport: String,
        trendAnalysis: {
            moodTrend: String,
            insights: String,
            suggestedActions: [String]
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Journal', journalSchema);