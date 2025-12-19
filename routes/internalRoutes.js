const express = require('express');
const router = express.Router();

const cronController = require('../controllers/cronController');

router.post('/cron/daily-milk-entry', cronController.runDailyMilkEntryJob);

module.exports = router;