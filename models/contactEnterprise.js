const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ContactEnterpriseSchema = new mongoose.Schema({
  enterprise_name: {
    type: String,
    required: true,
  },
  coverage: {
    type: String,
  },
  number_of_employees: {
    type: Number,
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
  country_code: {
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

ContactEnterpriseSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("ContactEnterprise", ContactEnterpriseSchema);
