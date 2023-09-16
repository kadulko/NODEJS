require("dotenv").config();
const service = require("../services/user.service");
const emailService = require("../services/email.service");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");

const createUser = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await service.getUserByEmail(email);
  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }
  try {
    const verificationToken = nanoid();
    const user = await service.createUser(
      email,
      password,
      gravatar.url(email, { d: "mp" }, true),
      verificationToken
    );

    await emailService.sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      status: "success",
      code: 201,
      message: "Registration successful",
      user: { email, subscription: user.subscription },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await service.getUserByEmail(email);

  if (!user || !user.validPassword(password)) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Email or password is wrong",
    });
  }

  if (!user.verify) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Verification not completed",
    });
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });

  await service.saveToken(user.id, token);

  res.status(200).json({
    status: "success",
    code: 200,
    token,
    user: { email: user.email, subscription: user.subscription },
  });
};

const logout = async (req, res, next) => {
  const user = await service.getUserById(req.user.id);

  if (!user) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Not autorized",
    });
  }

  await service.removeToken(req.user.id);

  res.status(204).json({
    status: "success",
    code: 204,
    message: "Successfuly logged out",
  });
};

const getCurrent = async (req, res, next) => {
  const user = await service.getUserById(req.user.id);

  if (!user) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Not autorized",
    });
  }

  res.status(200).json({
    status: "success",
    code: 200,
    user: { email: req.user.email, subscription: req.user.subscription },
  });
};

const verify = async (req, res, next) => {
  const { verificationToken } = req.params;

  const user = await service.getUserByVerificationToken(verificationToken);

  if (!user) {
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "User not found",
    });
  }

  await service.setUserAsVerified(user.id);

  res.status(200).json({
    status: "success",
    code: 200,
    message: "User verification successfull",
  });
};

const resendEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: "bad request",
      code: 400,
      message: "Missing required field email",
    });
  }

  const user = await service.getUserByEmail(email);

  if (!user) {
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "User not found",
    });
  }

  if (user.verify) {
    return res.status(400).json({
      status: "bad request",
      code: 400,
      message: "Verification has already been passed",
    });
  }

  await emailService.sendVerificationEmail(user.email, user.verificationToken);

  res.status(200).json({
    status: "success",
    code: 200,
    message: "Verification email sent",
  });
};

module.exports = {
  createUser,
  login,
  logout,
  getCurrent,
  verify,
  resendEmail,
};
