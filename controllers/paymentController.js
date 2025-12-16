const supabase = require('../models/db');
const db = require('../models/db');
const ResponseDto = require('../utils/responseDto');

exports.createPayment = async (req, res) => {
  const { monthYear, amountPaid, notes } = req.body;

  try {
    // Validate monthYear
    if (!/^\d{4}-\d{2}$/.test(monthYear)) {
      return res
        .status(400)
        .json(ResponseDto.error("monthYear must be in YYYY-MM format"));
    }

    // Convert "YYYY-MM" → "YYYY-MM-01"
    // this is just to understand that this payment is for which month.
    const monthDate = `${monthYear}-01`;

    // 1. Check if payment already exists
    const { data: existing, error: checkError } = await supabase
      .from("payments")
      .select("id")
      .eq("month_year", monthDate)
      .limit(1);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return res
        .status(400)
        .json(ResponseDto.error("Payment for this month already exists"));
    }

    // 2. Insert payment
    const { data, error } = await supabase
      .from("payments")
      .insert({
        month_year: monthDate,
        amount_paid: amountPaid,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(
      ResponseDto.success(
        {
          id: data.id,
          monthYear,
          amountPaid,
          notes: data.notes,
        },
        "Payment created successfully"
      )
    );
  } catch (err) {
    console.error("createPayment error:", err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};


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
  