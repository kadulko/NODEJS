const nodemailer = require("nodemailer");

require("dotenv").config();

const config = {
  pool: true,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

const sendVerificationEmail = async (to, verificationToken) => {
  const transporter = nodemailer.createTransport(config);

  const emailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject: "User verification",
    text: `Please click the link below to verify your email and activate your account:
       http://localhost:3000/api/users/verify/${verificationToken}`,
  };

  return await transporter.sendMail(emailOptions);
};

module.exports = {
  sendVerificationEmail,
};
