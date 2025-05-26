const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../util/error");

module.exports = async function (req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (!bearerHeader) {
    return res.status(403).json({ message: "Not authorized" });
  }
  try {
    const bearerToken = bearerHeader.split(" ")[1];
    const decoded = jwt.verify(bearerToken, process.env?.TOKEN_SECRET_KEY);
    if (!decoded)
      return res.status(403).json({ message: "Token is not valid" });
    req.user = decoded;
    return next();
  } catch (error) {
    return next(new ErrorHandler(403, "Authorization failed", error));
    // return res.status(403).json({
    //   message: "Authorization failed",
    //   reason: error?.message || error,
    // });
    // .json({ message: 'Authorization failed', status: 'MA102' });
  }
};
