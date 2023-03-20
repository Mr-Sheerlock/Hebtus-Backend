const mongoose = require('mongoose');
const crypto = require('crypto');
// const validator = require('validator');

const passwordResetSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  passwordResetToken: String,
  passwordResetTokenExpiry: Date,
});

passwordResetSchema.pre('save', async function (next) {
  await this.constructor.deleteMany({
    passwordResetTokenExpiry: { $lt: Date.now() },
  });
  next();
});

//All find querries
passwordResetSchema.pre(/^find/, async function (next) {
  this.select({
    __v: 0,
  });
  await this.model.deleteMany({
    passwordResetTokenExpiry: { $lt: Date.now() },
  });

  next();
});

passwordResetSchema.statics.createResetPasswordToken = async function (userID) {
  const passwordResetToken = crypto.randomBytes(32).toString('hex');
  const passwordReset = await this.findOne({ userID: userID });
  if (!passwordReset) {
    //save token in either email confirm or password tables
    await this.create({
      userID: this._id,
      passwordResetToken: crypto
        .createHash('sha256')
        .update(passwordResetToken)
        .digest('hex'),
      passwordResetTokenExpiry: Date.now() + 10 * 60 * 1000, //10 mins
    });
  } else {
    passwordReset.passwordResetToken = crypto
      .createHash('sha256')
      .update(passwordResetToken)
      .digest('hex');
    passwordReset.passwordResetTokenExpiry = Date.now() + 10 * 60 * 1000; //10 mins
    await passwordReset.save();
  }

  return passwordResetToken;
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;