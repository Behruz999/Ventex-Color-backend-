const { UserModel } = require("../models/index");
const { ErrorHandler } = require("../util/error");
const jwt = require("jsonwebtoken");
const env = process.env;

module.exports = {
  adminAuth: (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (
        username !== env?.ADMIN_USERNAME ||
        password !== env?.ADMIN_PASSWORD
      ) {
        return res
          .status(400)
          .json({ message: "The username or password is incorrect" });
      }

      const token = jwt.sign(
        {
          _id: null,
          title: username,
          role: "admin",
        },
        env?.TOKEN_SECRET_KEY,
        {
          algorithm: "HS256",
          expiresIn: env?.TOKEN_EXPIRESIN,
        }
      );
      return res.status(200).json({ token });
    } catch (err) {
      console.log(err, "- error on admin's authentication");
    }
  },

  // Xodimlar
  userAuth: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    const { login, password } = req.body;
    try {
      const doc = await UserModel.findOne({ where: { login } });

      if (!doc) {
        return res
          .status(400)
          .json({ message: "The login or password is incorrect" });
      }

      if (doc?.password !== password) {
        return res
          .status(400)
          .json({ message: "The password or login is incorrect" });
      }

      if (doc?.password === password) {
        const token = jwt.sign(
          {
            id: doc?.id,
            first_name: doc?.first_name,
            last_name: doc?.last_name,
            phone: doc?.phone,
            role: doc?.role,
          },
          env?.TOKEN_SECRET_KEY,
          {
            algorithm: "HS256",
            expiresIn: env?.TOKEN_EXPIRESIN,
          }
        );

        return res.status(200).json({ token });
      }
    } catch (err) {
      return next(new ErrorHandler(400, "Failed to authenticate User", err));
    }
  },
};
