const supabase = require("../models/db"); // should export supabase client (CommonJS)
const ResponseDto = require("../utils/responseDto");
const {
  epochToMySQLTimestamp,
  mysqlTimestampToEpoch,
} = require("../utils/dateUtils");
const { getMilkSummaryQuantityWise } = require("../utils/globalUtil");

/*
  ASSUMPTION: Supabase table columns are:
    milk_entries: id, entry_date (date), liters (numeric), rate_per_litre (numeric), total_amount, notes, created_at
    payments: id, month_date (date, first of month), amount_paid, paid_on, notes, created_at

  If your tables use different column names (e.g., date/quantity/rate), replace field names accordingly (see note below).
*/

// helper to get month start (YYYY-MM-01) and next month start
function monthStartAndNext(monthYear /* e.g. "2025-01" */) {
  const [yearStr, monStr] = monthYear.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monStr, 10); // 1-12
  const monthStart = new Date(Date.UTC(year, month - 1, 1)); // UTC date
  const next = new Date(Date.UTC(year, month - 1, 1));
  next.setUTCMonth(next.getUTCMonth() + 1);
  // Format YYYY-MM-DD
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { monthStart: fmt(monthStart), nextMonthStart: fmt(next) };
}

// Check if entry exists for a given date (dateString expected as 'YYYY-MM-DD' or ISO)
const isEntryAlreadyCreatedWithDate = async (isoDate) => {
  const { data, error } = await supabase
    .from("milk_entries")
    .select("id", { count: "exact", head: false })
    .eq("date", isoDate)
    .limit(1);

  if (error) {
    // bubble up error to caller
    throw error;
  }
  return Array.isArray(data) && data.length > 0;
};

// Create a milk entry
exports.createEntry = async (req, res) => {
  let { date, quantity, rate, notes } = req.body;

  try {
    if (typeof date === "number") {
      // epoch -> YYYY-MM-DD
      const ms = date.toString().length === 13 ? date : date * 1000;
      date = new Date(ms).toISOString().slice(0, 10);
    } else if (typeof date === "string") {
      // already in YYYY-MM-DD
      if (isNaN(Date.parse(date))) {
        return res
          .status(400)
          .json(ResponseDto.error("Invalid date format. Use YYYY-MM-DD"));
      }
    } else {
      return res
        .status(400)
        .json(ResponseDto.error("Date is required"));
    }

    const exists = await isEntryAlreadyCreatedWithDate(date);
    if (exists) {
      return res
        .status(400)
        .json(ResponseDto.error("Entry for this date already present"));
    }

    const { data, error } = await supabase
      .from("milk_entries")
      .insert({
        date,
        quantity,
        rate,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    res
      .status(201)
      .json(ResponseDto.success({ id: data.id }, "Entry created successfully"));
  } catch (err) {
    console.error(err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};


// Get all entries
exports.getAllEntries = async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from("milk_entries")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    const formattedRows = (rows || []).map((row) => ({
      ...row,
      // convert date (date) to epoch ms (reuse your util)
      date: mysqlTimestampToEpoch(row.date),
    }));

    res.json(ResponseDto.success(formattedRows));
  } catch (err) {
    console.error(err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};

// Update entry
exports.updateEntry = async (req, res) => {
  const { id } = req.params;
  const { date, quantity, rate, notes } = req.body;

  try {
    // Normalize date for Postgres (YYYY-MM-DD)
    let entryDate;

    if (typeof date === "number") {
      // epoch → YYYY-MM-DD
      const ms = date.toString().length === 13 ? date : date * 1000;
      const d = new Date(ms);
      entryDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    } else if (typeof date === "string") {
      // already YYYY-MM-DD
      if (isNaN(Date.parse(date))) {
        return res
          .status(400)
          .json(ResponseDto.error("Invalid date format. Use YYYY-MM-DD"));
      }
      entryDate = date;
    } else {
      return res
        .status(400)
        .json(ResponseDto.error("Date is required"));
    }

    const { error } = await supabase
      .from("milk_entries")
      .update({
        date: entryDate,
        quantity,
        rate,
        notes: notes ?? null,
      })
      .eq("id", id);

    if (error) throw error;

    res.json(ResponseDto.success(null, "Updated successfully"));
  } catch (err) {
    console.error("updateEntry error:", err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};


// Delete entry
exports.deleteEntry = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("milk_entries").delete().eq("id", id);

    if (error) throw error;
    res.json(ResponseDto.success(null, "Deleted successfully"));
  } catch (err) {
    console.error("deleteEntry error:", err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};

// Get entry by ID
exports.getEntryById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: rows, error } = await supabase
      .from("milk_entries")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error) throw error;
    if (!rows || rows.length === 0) {
      return res.status(404).json(ResponseDto.error("Entry not found"));
    }

    const formattedRow = {
      ...rows[0],
      date: mysqlTimestampToEpoch(rows[0].date),
    };

    res.json(ResponseDto.success(formattedRow));
  } catch (err) {
    console.error(err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};

// set auto milk entry defaults
exports.setMilkDefaults = async (req, res) => {
  const { autoMilkEntryEnabled } = req.body;

  if (typeof autoMilkEntryEnabled !== "boolean") {
    return res
      .status(400)
      .json(ResponseDto.error("autoMilkEntryEnabled key must be boolean"));
  }

  try {
    const { data, error } = await supabase
      .from("milk_defaults")
      .update({ auto_entry_enabled: autoMilkEntryEnabled })
      .eq("id", 1)
      .select("auto_entry_enabled")
      .single();

    if (error) throw error;

    res.json(
      ResponseDto.success(
        { autoMilkEntryEnabled: data.auto_entry_enabled },
        `Auto milk entry ${autoMilkEntryEnabled ? "enabled" : "disabled"}`
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};


// Fetch milk defaults
exports.getMilkDefaults = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("milk_defaults")
      .select("*")
      .limit(1)
      .single();

    if (error) throw error;

    res.json(ResponseDto.success(data, "Milk defaults fetched successfully"));
  } catch (err) {
    console.error("fetchMilkDefaults error:", err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};

exports.getMonthSummary = async (req, res) => {
  const { monthYear } = req.params; // "YYYY-MM"

  try {
    const { monthStart, nextMonthStart } = monthStartAndNext(monthYear);

    // 1. fetch milk entries for this month
    const { data: entries, error: entriesError } = await supabase
      .from("milk_entries")
      .select("quantity, rate, date")
      .gte("date", monthStart)
      .lt("date", nextMonthStart)
      .order("date", { ascending: false });

    if (entriesError) throw entriesError;

    if (!entries || entries.length === 0) {
      return res
        .status(200)
        .json(ResponseDto.success(null, "No entries found for this month"));
    }

    // 2. calculate totals
    let totalQuantity = 0;
    let totalAmount = 0;

    entries.forEach((entry) => {
      const amount =
        entry.total_amount !== null && entry.total_amount !== undefined
          ? Number(entry.total_amount)
          : Number(entry.quantity) * Number(entry.rate);

      totalQuantity += Number(entry.quantity);
      totalAmount += amount;
    });

    // 3. fetch payment for this month
    const { data: payments, error: paymentError } = await supabase
      .from("payments")
      .select("amount_paid, paid_on, notes")
      .eq("month_year", monthStart)
      .limit(1);

    if (paymentError) throw paymentError;

    const paymentDone = payments && payments.length > 0;

    // 4. quantity summary by day
    const summary = getMilkSummaryQuantityWise(entries);

    // 5. response
    res.json(
      ResponseDto.success(
        {
          totalQuantity,
          totalAmount,
          entryCount: entries.length,
          month: monthYear,
          paymentDone,
          paymentDetails: paymentDone ? payments[0] : null,
          summary,
        },
        "Month summary fetched"
      )
    );
  } catch (err) {
    console.error("getMonthSummary error:", err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};


exports.getEntriesByMonthYear = async (req, res) => {
  const { monthYear } = req.params; // "YYYY-MM"
  try {
    const { monthStart, nextMonthStart } = monthStartAndNext(monthYear);

    const { data: entries, error } = await supabase
      .from("milk_entries")
      .select("*")
      .gte("date", monthStart)
      .lt("date", nextMonthStart)
      .order("date", { ascending: false });

    if (error) throw error;

    const formattedRows = (entries || []).map((row) => ({
      ...row,
      date: mysqlTimestampToEpoch(row.date),
    }));

    res.json(ResponseDto.success(formattedRows, "Entries fetched successfully"));
  } catch (err) {
    console.error("getEntriesByMonthYear error:", err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};
