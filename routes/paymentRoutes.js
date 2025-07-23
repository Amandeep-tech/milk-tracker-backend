const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');


router.get('/:monthYear', paymentController.getPaymentByMonth);
router.get('/', paymentController.getAllPayments);
router.post('/', paymentController.createPayment);

module.exports = router;