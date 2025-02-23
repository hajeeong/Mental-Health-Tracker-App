// Helper functions for data analysis
exports.calculateTrends = (entries) => {
    const moodScores = entries.map(entry => entry.mood);
    const avgMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
    
    return {
        average: avgMood,
        trend: avgMood > 3 ? 'improving' : avgMood < 3 ? 'declining' : 'stable',
        variability: Math.std(moodScores) // measure of mood swings
    };
};

exports.generateSummary = (trends) => {
    let summary = '';
    if (trends.trend === 'improving') {
        summary = 'Overall mood has been improving. ';
    } else if (trends.trend === 'declining') {
        summary = 'There has been a slight decline in mood. ';
    } else {
        summary = 'Mood has been relatively stable. ';
    }

    return summary;
}; 