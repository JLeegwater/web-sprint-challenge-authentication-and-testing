const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../secrets/index");
const db = require("../auth/users-model");

const restricted = (req, res, next) => {
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
  try {
    const token = req.headers.authorization;
    !token && next({ status: 401, message: "Token required" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return next({
          status: 401,
          message: "Token invalid",
          realErrorMessage: err.message,
        });
      }
      req.decodedJwt = decoded;
      next();
    });
  } catch (error) {
    next(error);
  }
};

const checkPayload = async (req, res, next) => {
  try {
    const { username } = req.body;
    const { password } = req.body;
    username && password
      ? next()
      : next({ status: 400, message: "username and password required" });
  } catch (error) {
    next(error);
  }
};

const checkUsernameExists = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await db.findBy({ username });

    if (user) {
      req.user = user;
      next();
    } else {
      next({ message: "invalid credentials", status: 401 });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  restricted,
  checkPayload,
  checkUsernameExists,
};
