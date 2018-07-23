const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = new mongoose.Schema({
  username:  {
    type: String,
    required: true,
    unique: true
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;