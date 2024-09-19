const mongoose = require("mongoose");
const MpathPlugin = require('mongoose-mpath');
const mongoosePaginate = require("mongoose-paginate-v2");

const CategorySchema = new mongoose.Schema({
  uid: {
    type: Number,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  imageName: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentLabel: {
    type: String,
    default: ''
  },
});

CategorySchema.index({
  label: 1
}, {
  unique: true,
});

CategorySchema.plugin(mongoosePaginate);
CategorySchema.plugin(MpathPlugin);
module.exports = mongoose.model("Category", CategorySchema);
