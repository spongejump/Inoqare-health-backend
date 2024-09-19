const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const QuoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  treatment_info: {
    type: String,
    required: true,
  },
  source_country: {
    type: String,
    required: true,
  },
  destination_country: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
  },
  specialty:{
    type: String,
  }, 
  current_address: {
    type: String,
  },
  discussion: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  time: {
    type: String,
  },
});

QuoteSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Quote", QuoteSchema);
