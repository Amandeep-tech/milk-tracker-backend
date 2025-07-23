const db = require('../models/db');
const ResponseDto = require('../utils/responseDto');

exports.createPayment = async (req, res) => {
  const { monthYear, amountPaid, notes } = req.body;
  try {
    // Check if a payment already exists for the month
    const [existing] = await db.execute(
        'SELECT id FROM payments WHERE month_year = ? LIMIT 1',
        [monthYear]
      );
    if(existing.length > 0) {
      return res.status(400).json(ResponseDto.error('Payment for this month already exists'));
    }

    // otherwise continue insertion :)
    const [result] = await db.execute(
        'INSERT INTO payments (month_year, amount_paid, notes) VALUES (?, ?, ?)',
        [monthYear, amountPaid, notes]
      );  
    res.json(ResponseDto.success({ 
        id: result.insertId,
        monthYear,
        amountPaid,
        notes
     }, 'Payment created successfully'));
  } catch (err) {
    console.log(err);
    res.status(500).json(ResponseDto.error(err.message));
  }
}