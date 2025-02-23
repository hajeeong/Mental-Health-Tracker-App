const Journal = require('../models/Journal');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.createEntry = async (req, res) => {
    try {
        const { content, mood } = req.body;
        const userId = req.user.id;

        // Enhanced AI prompt for comprehensive analysis
        const aiPrompt = `
        Analyze this journal entry and provide insights in JSON format:
        Content: "${content}"
        Mood Rating: ${mood}
        
        Provide analysis including:
        1. Emotional state and sentiment
        2. Key themes or concerns
        3. Suggested activities or coping strategies
        4. A summary for caregivers
        
        Format as JSON with sentiment scores (0-100), emotions, and recommendations.`;

        const aiResponse = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: aiPrompt,
            max_tokens: 500
        });

        const analysis = JSON.parse(aiResponse.choices[0].text);

        const journal = new Journal({
            userId,
            content,
            mood,
            aiAnalysis: analysis
        });

        await journal.save();

        // Get recent entries for trend analysis
        const recentEntries = await Journal.find({ userId })
            .sort({ createdAt: -1 })
            .limit(7);

        const trends = {
            recentMood: recentEntries.map(entry => entry.mood),
            averageMood: recentEntries.reduce((acc, entry) => acc + entry.mood, 0) / recentEntries.length
        };

        res.status(201).json({
            journal,
            trends
        });

    } catch (error) {
        console.error('Error creating journal entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getEntries = async (req, res) => {
    try {
        const userId = req.user.id;
        const entries = await Journal.find({ userId })
            .sort({ date: -1 })
            .limit(10);
        
        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMoodTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const entries = await Journal.find({ userId })
            .sort({ createdAt: -1 })
            .limit(30); // Last 30 days

        const trendData = entries.map(entry => ({
            date: entry.createdAt,
            mood: entry.mood,
            sentiment: entry.aiAnalysis.sentiment.score,
            summary: entry.aiAnalysis.guardianSummary
        }));

        // Calculate overall trend
        const averageMood = entries.reduce((acc, entry) => acc + entry.mood, 0) / entries.length;
        const moodTrend = averageMood > 3 ? 'positive' : averageMood < 3 ? 'concerning' : 'stable';

        res.json({
            trendData,
            overall: {
                trend: moodTrend,
                averageMood,
                latestSummary: entries[0]?.aiAnalysis.guardianSummary
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMoodAnalysis = async (req, res) => {
    try {
        const userId = req.user.id;
        const timeRange = req.query.range || '7days';

        let dateFilter = {};
        if (timeRange === '7days') {
            dateFilter = { 
                createdAt: { 
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                }
            };
        }

        const entries = await Journal.find({ 
            userId,
            ...dateFilter 
        }).sort({ createdAt: 1 });

        const moodData = entries.map(entry => ({
            date: entry.createdAt,
            mood: entry.mood,
            sentiment: entry.aiAnalysis.sentiment.score
        }));

        const analysis = {
            trendData: moodData,
            overview: {
                averageMood: moodData.reduce((acc, curr) => acc + curr.mood, 0) / moodData.length,
                dominantEmotion: entries[entries.length - 1]?.aiAnalysis.sentiment.primaryEmotion,
                recentTrend: entries.length > 1 ? 
                    (moodData[moodData.length - 1].mood > moodData[0].mood ? 'improving' : 'declining') : 
                    'stable'
            },
            recommendations: entries[entries.length - 1]?.aiAnalysis.recommendations || []
        };

        res.json(analysis);
    } catch (error) {
        console.error('Error getting mood analysis:', error);
        res.status(500).json({ message: 'Server error' });
    }
};