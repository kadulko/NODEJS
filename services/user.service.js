const User = require("../models/user.model");

const createUser = async (email, password, avatarURL, verificationToken) => {
  const newUser = new User({ email, avatarURL, verificationToken });
  newUser.setPassword(password);
  return newUser.save();
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const getUserById = async (id) => {
  return User.findOne({ _id: id });
};

const getUserByVerificationToken = async (verificationToken) => {
  return User.findOne({ verificationToken });
};

const saveToken = (id, token) => {
  return User.findByIdAndUpdate(
    { _id: id },
    { $set: { token } },
    { new: true }
  );
};

const removeToken = (id) => {
  return User.findByIdAndUpdate(
    { _id: id },
    { $set: { token: null } },
    { new: true }
  );
};

const updateAvatar = (id, fileName) => {
  return User.findByIdAndUpdate(
    { _id: id },
    { $set: { avatarURL: fileName } },
    { new: true }
  );
};

const setUserAsVerified = (id) => {
  return User.findByIdAndUpdate(
    { _id: id },
    { $set: { verify: true } },
    { new: true }
  );
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByVerificationToken,
  saveToken,
  removeToken,
  updateAvatar,
  setUserAsVerified,
};
