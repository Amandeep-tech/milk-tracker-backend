const express = require('express');
const router = express.Router();

const settingsController = require('../controllers/settingsController');

router.post('/vacation', settingsController.vacationMode);

module.exports = router;