const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    required: true
  },
  order: {
    type: Number,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

CountrySchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Country", CountrySchema);
