const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ContactPartnerSchema = new mongoose.Schema({
  organization_name: {
    type: String,
  },
  contact_person_name: {
    type: String,
  },
  contact_person_email: {
    type: String,
  },
  contact_person_phone: {
    type: String,
  },
  contact_person_country_code: {
    type: String,
  },
  country: {
    type: String,
  },
  remarks: {
    type: String,
  },
  user_type: {
    type: String,
    enum: ["broker", "medical_partner"],
  },
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ContactPartnerSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("ContactPartner", ContactPartnerSchema);
