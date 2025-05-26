const { News } = require("../models/index");
// const allowedIPs = ["127.0.0.1", "::1"]; // Define allowed IPs

module.exports = {
  // upload images which telegram bot sent and return its path back
  telegramFileUpload: async (req, res, next) => {
    try {
      return res.status(200).json({ imagePath: req.body?.photo });
    } catch (err) {
      console.log(err, "- error on uploading telegram file");
      return res.status(400).json({ message: err?.message || err });
    }
  },

  // create news via telegram bot
  createByTelegramBot: async (req, res, next) => {
    // const clientIP = req.headers["x-forwarded-for"] || req.ip;
    // if (!allowedIPs.includes(clientIP)) {
    //   return res.status(403).json({ message: `Forbidden` });
    // }
    try {
      await News.create(req.body);
      return res
        .status(201)
        .json({ message: "News was created successfully!" });
    } catch (err) {
      return next(new ErrorHandler(400, "Failed to add new News", err));
    }
  },

  // update a news via telegram bot
  updateByTelegramBot: async (req, res, next) => {
    const { id } = req.params;
    // const clientIP = req.headers["x-forwarded-for"] || req.ip;
    // if (!allowedIPs.includes(clientIP)) {
    //   return res.status(403).json({ message: `Forbidden` });
    // }
    try {
      const updated = await News.update(req.body, { where: { id } });

      if (!updated)
        return res.status(400).json({ message: `News not found, id: ${id}` });

      return res
        .status(200)
        .json({ message: "News was updated successfully!" });
    } catch (err) {
      return next(new ErrorHandler(400, "Failed to update News", err));
    }
  },
};
