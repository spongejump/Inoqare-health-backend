const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const SpecialtySchema = new mongoose.Schema({
  imageName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  isActive: {
    type: Boolean,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

SpecialtySchema.index({
  category: 1,
  name: 1,
}, {
  unique: true,
});

SpecialtySchema.index({
  category: 1,
  order: 1,
}, {
  unique: true,
});

SpecialtySchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Specialty", SpecialtySchema);
