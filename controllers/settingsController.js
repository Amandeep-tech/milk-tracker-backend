const supabase = require("../models/db");
const { isVacationActive } = require("../utils/globalUtil");
const ResponseDto = require("../utils/responseDto");

exports.vacationMode = async (req, res) => {
  const { startDate, endDate } = req.body;
  const today = new Date().toISOString().slice(0, 10);

  try {
    // 1️. Decide intent: enable or disable
    const isDisableRequest = startDate === null && endDate === null;

    if (!isDisableRequest) {
      // 2. Validation for enable
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json(ResponseDto.error("startDate and endDate are required"));
      }

      if (startDate > endDate) {
        return res
          .status(400)
          .json(ResponseDto.error("startDate cannot be after endDate"));
      }
    }

    // 3. Prepare update payload
    const updatePayload = isDisableRequest
      ? { vacation_from: null, vacation_to: null }
      : { vacation_from: startDate, vacation_to: endDate };

    // 4. Update DB (single place)
    const { data, error } = await supabase
      .from("milk_defaults")
      .update(updatePayload)
      .eq("id", 1)
      .select()
      .single();

    if (error) throw error;

    // 5. Respond
    return res.status(200).json(
      ResponseDto.success(
        {
          vacationFrom: data.vacation_from,
          vacationTo: data.vacation_to,
          active: isVacationActive(data, today),
        },
        isDisableRequest
          ? "Vacation mode disabled successfully"
          : "Vacation mode updated successfully"
      )
    );
  } catch (err) {
    console.error("vacationMode error:", err);
    return res
      .status(500)
      .json(ResponseDto.error("Server Error while updating vacation mode"));
  }
};
