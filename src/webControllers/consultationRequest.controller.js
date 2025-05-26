const { ErrorHandler } = require("../util/error");
const { ConsultationRequestModel } = require("../models/index");
const { makeDateFormat } = require("../util/function");

module.exports = {
  // Create new ConsultationRequest
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      req.body.status = 1;
      req.body.date = makeDateFormat(req, "date", {
        format: "YYYY-MM-DD HH:mm",
      });
      await ConsultationRequestModel.create(req.body);
      return res
        .status(201)
        .json({ message: "ConsultationRequest was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new ConsultationRequest");
      return next(
        new ErrorHandler(400, "Failed to add new ConsultationRequest", err)
      );
    }
  },
};
