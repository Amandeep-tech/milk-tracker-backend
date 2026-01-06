const supabase = require("../models/db");
const { isVacationActive } = require("../utils/globalUtil");
const ResponseDto = require("../utils/responseDto");

exports.runDailyMilkEntryJob = async (req, res) => {
  if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
    return res.status(401).json(ResponseDto.error("Unauthorized"));
  }

  // 	1. Read milk_defaults
  // 	2. If auto_entry_enabled = false → exit
	// 	3. Check vacation mode
  // 	4. Check if today’s entry exists
  // 	5. Insert using defaults
  let defaultMilkConfig;
	const today = new Date().toISOString().slice(0, 10);
  try {
    // 1. Read milk_defaults
    const { data: defaults, error } = await supabase
      .from("milk_defaults")
      .select("*")
      .limit(1)
      .single();

    if (error) throw error;

    defaultMilkConfig = defaults;
    // 2. If auto_entry_enabled = false → exit
    if (!defaultMilkConfig.auto_entry_enabled) {
      return res.json(ResponseDto.success(null, "Auto milk entry is disabled"));
    }
		// 3. Check vacation mode
		if (isVacationActive(defaultMilkConfig, today)) {
      return res
        .status(200)
        .json(ResponseDto.error("Vacation mode is active"));
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ResponseDto.error("Server Error while reading milk defaults"));
  }

  // 3. Check vacation mode
  if (isVacationActive(defaultMilkConfig, today)) {
    return res
		.status(200)
		.json(ResponseDto.error("Vacation mode is active"));
  }

  try {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;

    const { data: existing } = await supabase
      .from("milk_entries")
      .select("id")
      .eq("date", date)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.json(ResponseDto.success(null, "Milk entry already exists"));
    }

    await supabase.from("milk_entries").insert({
      date,
      quantity: defaultMilkConfig.quantity,
      rate: defaultMilkConfig.rate,
      notes: "github cron job entry",
    });

    res.status(201).json(ResponseDto.success(null, "Milk entry created"));
  } catch (err) {
    console.error(err);
    res.status(500).json(ResponseDto.error(err.message));
  }
};
