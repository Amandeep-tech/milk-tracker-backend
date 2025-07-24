const express = require('express');
const router = express.Router();

const milkController = require('../controllers/milkController');

router.get('/', milkController.getAllEntries);
router.get('/:id', milkController.getEntryById);
router.post('/', milkController.createEntry);
router.put('/:id', milkController.updateEntry);
router.delete('/:id', milkController.deleteEntry);

router.get('/summary/:monthYear', milkController.getMonthSummary);
router.get('/entries/:monthYear', milkController.getEntriesByMonthYear);

module.exports = router;