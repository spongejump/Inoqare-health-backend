const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ContactEmployeeSchema = new mongoose.Schema({
  employee_name: {
    type: String,
    required: true,
  },
  employee_email: {
    type: String,
    required: true,
  },
  employee_phone: {
    type: String,
    required: true,
  },
  employee_country_code: {
    type: String,
    required: true,
  },
  organization_name: {
    type: String,
  },
  organization_contact_person_name: {
    type: String,
  },
  organization_contact_person_email: {
    type: String,
  },
  organization_contact_person_phone: {
    type: String,
  },
  organization_contact_person_country_code: {
    type: String,
  },
  country: {
    type: String,
  },
  remarks: {
    type: String,
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

ContactEmployeeSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Enterprise", ContactEmployeeSchema);
