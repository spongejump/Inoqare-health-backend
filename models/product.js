const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ProductSchema = new mongoose.Schema({
  categories: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    label: {
      type: String,
      default: '',
      required: true
    },
    children: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Category",
      },
      label: {
        type: String,
        default: '',
        required: true
      },
    }]
  }],
  qty: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number
  },
  totalPrice: {
    type: Number,
    required: true,
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

/* ProductSchema.index({
  category: 1,
  specialty: 1,
  country: 1
}, {
  unique: true,
}); */

ProductSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Product", ProductSchema);
