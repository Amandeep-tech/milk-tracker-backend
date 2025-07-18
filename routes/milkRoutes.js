const express = require('express');
const router = express.Router();

const milkController = require('../controllers/milkController');

router.get('/', milkController.getAllEntries);
router.post('/', milkController.createEntry);
router.put('/:id', milkController.updateEntry);
router.delete('/:id', milkController.deleteEntry);

module.exports = router;