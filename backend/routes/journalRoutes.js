const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const auth = require('../middlewares/auth');

// Create journal entry - POST /api/journal
router.post('/', auth, journalController.createEntry);

// Get user's journal entries - GET /api/journal
router.get('/', auth, journalController.getEntries);

// Get mood trends - GET /api/journal/trends
router.get('/trends', auth, journalController.getMoodTrends);

// Get detailed mood analysis - GET /api/journal/analysis
router.get('/analysis', auth, journalController.getMoodAnalysis);

module.exports = router;