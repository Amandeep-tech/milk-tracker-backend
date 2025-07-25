const db = require("../models/db");
const ResponseDto = require("../utils/responseDto");
const {
  epochToMySQLTimestamp,
  mysqlTimestampToEpoch,
} = require("../utils/dateUtils");
const { getMilkSummaryQuantityWise } = require("../utils/globalUtil");

const isEntryAlreadyCreatedWithDate = async (mysqlDate) => {
  const [rows] = await db.execute(
    "Select id from milk_entries where DATE(date) = DATE(?) LIMIT 1",
    [mysqlDate]
  );
  return rows.length > 0;
};

// Create a milk entry
exports.createEntry = async (req, res) => {
  const { date, quantity, rate } = req.body;
  try {
    // Convert epoch to MySQL timestamp
    const mysqlDate = epochToMySQLTimestamp(date);

    // check if an entry is already present in table for mysqlDate
    const dateAlreadyPresent = await isEntryAlreadyCreatedWithDate(mysqlDate);
    if (dateAlreadyPresent) {
      return res
        .status(400)
        .json(ResponseDto.error("Entry for this date already present"));
    }

    // otherwise continue insertion :)
    const [result] = await db.execute(
      "INSERT INTO milk_entries (date, quantity, rate) VALUES (?, ?, ?)",
      [mysqlDate, quantity, rate]
    );
    res
      .status(201)
      .json(
        ResponseDto.success(
          { id: result.insertId },
          "Entry created successfully"
        )
      );
  } catch (err) {
    res.status(500).json(ResponseDto.error(err.message));
  }
};

// Get all entries
exports.getAllEntries = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM milk_entries ORDER BY date DESC"
    );
    // Convert MySQL timestamps to epoch in response
    const formattedRows = rows.map((row) => ({
      ...row,
      date: mysqlTimestampToEpoch(row.date),
    }));
    res.json(ResponseDto.success(formattedRows));
  } catch (err) {
    console.log(err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};

// Update entry
exports.updateEntry = async (req, res) => {
  const { id } = req.params;
  const { date, quantity, rate } = req.body;
  try {
    // Convert epoch to MySQL timestamp
    const mysqlDate = epochToMySQLTimestamp(date);
    await db.execute(
      "UPDATE milk_entries SET date=?, quantity=?, rate=? WHERE id=?",
      [mysqlDate, quantity, rate, id]
    );
    res.json(ResponseDto.success(null, "Updated successfully"));
  } catch (err) {
    res.status(500).json(ResponseDto.error(err.message));
  }
};

// Delete entry
exports.deleteEntry = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute("DELETE FROM milk_entries WHERE id = ?", [id]);
    res.json(ResponseDto.success(null, "Deleted successfully"));
  } catch (err) {
    res.status(500).json(ResponseDto.error(err.message));
  }
};

// Get entry by ID
exports.getEntryById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute("SELECT * FROM milk_entries WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json(ResponseDto.error("Entry not found"));
    }
    // Convert MySQL timestamp to epoch in response
    const formattedRow = {
      ...rows[0],
      date: mysqlTimestampToEpoch(rows[0].date),
    };
    res.json(ResponseDto.success(formattedRow));
  } catch (err) {
    res.status(500).json(ResponseDto.error(err.message));
  }
};

exports.getMonthSummary = async (req, res) => {
  const { monthYear } = req.params;
  try {
    // 1. fetch milk entried for this month
    const [entries] = await db.execute(
      `select quantity, rate, date from milk_entries where DATE_FORMAT(date, '%Y-%m') = ?`,
      [monthYear]
    );
    console.log("entries", entries);
    if (entries.length === 0) {
      return res
        .status(200)
        .json(ResponseDto.success(null, "No entries found for this month"));
    }

    // 2. calculate total quantity and total amount
    let totalQuantity = 0;
    let totalAmount = 0;
    entries.forEach((entry) => {
      totalQuantity += entry.quantity;
      totalAmount += entry.quantity * entry.rate;
    });

    // 3. fetch payment for this month
    const [payment] = await db.execute(
      `select amount_paid, paid_on, notes from payments where month_year = ? LIMIT 1`,
      [monthYear]
    );
    const paymentDone = payment.length > 0;

    // 4. Also format milk quantity by no.of days
    const summary = getMilkSummaryQuantityWise(entries)

    // 5. prepare response
    res.json(
      ResponseDto.success(
        {
          totalQuantity,
          totalAmount,
          entryCount: entries.length,
          month: monthYear,
          paymentDone,
          paymentDetails: paymentDone ? payment[0] : null,
          summary
        },
        "Month summary fetched"
      )
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};


exports.getEntriesByMonthYear = async (req, res) => {
  const { monthYear } = req.params;
  try {
    const [entries] = await db.execute(
      `select * from milk_entries where DATE_FORMAT(date, '%Y-%m') = ? order by date desc`,
      [monthYear]
    );
    // Convert MySQL timestamps to epoch in response
    const formattedRows = entries.map((row) => ({
      ...row,
      date: mysqlTimestampToEpoch(row.date),
    }));
    res.json(ResponseDto.success(formattedRows, "Entries fetched successfully"));
  } catch (err) {
    console.log(err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};