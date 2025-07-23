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

exports.getAllPayments = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `Select id, month_year, amount_paid, paid_on, notes from payments
                order by month_year desc
            `
        );
    if(rows.length === 0) {
        return res.status(200).json(ResponseDto.success(rows, 'No payments found'));
    }
    res.json(ResponseDto.success(rows, 'Payments fetched successfully'));
    } catch (err) {
        console.log(err);
        res.status(500).json(ResponseDto.error(err.message));
    }
}

exports.getPaymentByMonth = async (req, res) => {
    const { monthYear } = req.params;
  
    try {
      const [rows] = await db.execute(
        `SELECT id, month_year, amount_paid, paid_on, notes FROM payments WHERE month_year = ? LIMIT 1`,
        [monthYear]
      );
  
      if (rows.length === 0) {
        return res.status(404).json(ResponseDto.error('No payment record found for this month'));
      }
  
      res.status(200).json(ResponseDto.success(rows[0], 'Payment record found'));
    } catch (err) {
      res.status(500).json(ResponseDto.error(err.message));
    }
  };
  