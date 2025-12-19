const supabase = require("../models/db"); 
const ResponseDto = require("../utils/responseDto");

exports.runDailyMilkEntryJob = async (req, res) => {
	if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
		return res.status(401).json(ResponseDto.error("Unauthorized"));
	}

	try {
		const now = new Date();
		const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

		const { data: existing } = await supabase
			.from("milk_entries")
			.select("id")
			.eq("date", date)
			.limit(1);

		if (existing && existing.length > 0) {
			return res.json(
				ResponseDto.success(null, "Milk entry already exists")
			);
		}

		await supabase.from("milk_entries").insert({
			date,
			quantity: 1,
			rate: 52,
			notes: "github cron job entry",
		});

		res.status(201).json(ResponseDto.success(null, "Milk entry created"));
	} catch (err) {
		console.error(err);
		res.status(500).json(ResponseDto.error(err.message));
	}
}