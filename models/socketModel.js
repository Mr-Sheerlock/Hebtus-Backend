const mongoose = require('mongoose');

const socketSchema = new mongoose.Schema({
  attendeeID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  socketID: {
    type: String,
    required: true,
  },
});

//All find querries
socketSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
    attendeeID: 0,
  });
  next();
});

const Notification = mongoose.model('sockets', socketSchema);

module.exports = Notification;
