const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const ExcerciseSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true
  },
  description:  {
    type: String,
    required: true
  },
  duration:  {
    type: Number,
    required: true
  },
  date: Date
})

const Exercise = mongoose.model('Exercise', ExcerciseSchema);

module.exports = Exercise;