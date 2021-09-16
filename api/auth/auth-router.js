const {
  checkPayload,
  checkUsernameExists,
} = require("../middleware/restricted");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const tokenBuilder = require("./token-builder");
const Users = require("./users-model");

router.post(
  "/register",
  checkPayload,
  checkUsernameExists,
  (req, res, next) => {
    let user = req.body;
    // bcrypting the password before saving
    const rounds = process.env.BCRYPT_ROUNDS || 8; // 2 ^ 8
    const hash = bcrypt.hashSync(user.password, rounds);

    user.password = hash;
    Users.add(user)
      .then((saved) => {
        res.status(201).json(saved);
      })
      .catch(next);
  }
);

router.post("/login", checkPayload, checkUsernameExists, (req, res, next) => {
  let { password } = req.body;
  const [user] = req.user;

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = tokenBuilder(user);
    res.status(200).json({
      message: `welcome, ${user.username}`,
      token,
    });
  } else {
    next({ status: 401, message: "invalid credentials" });
  }
});

// eslint-disable-next-line
router.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    sageAdvice: "Finding the real error is 90% of the bug fix",
    message: err.message,
    stack: err.stack,
  });
});

module.exports = router;
