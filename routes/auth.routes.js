const express = require("express");
const router = express.Router();
const ctrlAuth = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

router.post("/users/signup", ctrlAuth.createUser);

router.post("/users/login", ctrlAuth.login);

router.get("/users/logout", auth, ctrlAuth.logout);

router.get("/users/current", auth, ctrlAuth.getCurrent);

router.get("/users/verify/:verificationToken", ctrlAuth.verify);

router.post("/users/verify", ctrlAuth.resendEmail);

module.exports = router;