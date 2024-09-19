const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ContactFormSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  message: {
    type: String,
  },
  subject: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ContactFormSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("ContactForm", ContactFormSchema);
