const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// name, email, photo, password , passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell use your name"],
  },
  email: {
    type: String,
    required: [true, "Please Enter the E-mail"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please Provide a Valid Email"],
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    require: [true, "Please Provide the Password"],
    minlength: 8,
    select: false, // will never be shown in the res Object
  },
  photo: {
    type: String,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please Confirm your password"],
    validate: {
      //!  this will only work  ON CREATE and SAVE !!!
      //TODO: whenever we want to update the user we will always save the user first
      validator: function (el) {
        return el === this.password; // abc === abc (returns true)
      },
      message: "passwords are not the same ! 💣",
    },
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// ?==============================================================
// !========================= MIDDLEWARES ===========================
// ?==============================================================

// *This middle ware will run before the document is saved to the database
// *and it will hash the password using bcrypt
// we will use the document middleware to encrypt password
userSchema.pre("save", async function (next) {
  // only runs this function if password was actually modified
  if (!this.isModified("password")) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// *This middle ware will run before the document is saved to the database
// *and it will check if the password was modified or not
userSchema.pre("save", function (next) {
  // only runs this function if password was actually modified
  // or the user is new
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
// ?==============================================================
// !==============================================================

// ?==============================================================
// !========================= METHODS ============================
// ?==============================================================
// *This method will run when we want to check if the password is correct or not
// *and it will compare the password with the hashed password in the database
// create an instace method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// *This method will run when we want to check if the password was changed after the token was issued
// *and it will compare the password with the hashed password in the database
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // FALSE means password was NOT changed after the token was issued
  return false;
};

// *This method will run when we want to create a password reset token
// *and it will create a random token and hash it and save it to the database
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
