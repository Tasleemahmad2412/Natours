const User = require("../models/userModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
exports.createUser = async (req, res) => {
  // this will create a new user in our mongoDB
  const newUser = await User.create(req.body);

  // will send the data that user has been created
  res.status(200).json({
    status: "success",
    message: "New user created !",
    newUser,
  });
};
exports.getUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("This user does not exists !!"), 404);
  }
  res.status(200).json({
    status: "success",
    message: "User successfuly fetched",
    user,
  });
};

exports.updateUser = (req, res) => {
  const updatedUser = User.findByIdAndUpdate(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    message: "User updated successfully",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
};
