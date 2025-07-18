const db = require('../models/db');
const ResponseDto = require('../utils/responseDto');

// Create a milk entry
exports.createEntry = async (req, res) => {
  const { date, quantity, rate } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO milk_entries (date, quantity, rate) VALUES (?, ?, ?)',
      [date, quantity, rate]
    );
    res.status(201).json(ResponseDto.success({ id: result.insertId }, 'Entry created successfully'));
  } catch (err) {
    res.status(500).json(ResponseDto.error(err.message));
  }
};

// Get all entries
exports.getAllEntries = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM milk_entries ORDER BY date DESC');
    res.json(ResponseDto.success(rows));
  } catch (err) {
    res.status(500).json(ResponseDto.error(err.message));
  }
};

// Update entry
exports.updateEntry = async (req, res) => {
  const { id } = req.params;
  const { date, quantity, rate } = req.body;
  try {
    await db.execute(
      'UPDATE milk_entries SET date=?, quantity=?, rate=? WHERE id=?',
      [date, quantity, rate, id]
    );
    res.json(ResponseDto.success(null, 'Updated successfully'));
  } catch (err) {
    res.status(500).json(ResponseDto.error(err.message));
  }
};

// Delete entry
exports.deleteEntry = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM milk_entries WHERE id = ?', [id]);
    res.json(ResponseDto.success(null, 'Deleted successfully'));
  } catch (err) {
    res.status(500).json(ResponseDto.error(err.message));
  }
};
