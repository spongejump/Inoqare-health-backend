const express = require("express");
const {
  createContactEnterprise,
  getContactEnterprises,
  getContactEnterprise,
  updateContactEnterprise,
  deleteContactEnterprise,
} = require("../controllers/contactEnterprise.js");

const ContactEnterprise = require("../models/contactEnterprise");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .post(createContactEnterprise)
  .get(advancedResults(ContactEnterprise), getContactEnterprises); //public
router
  .route("/:id")
  .get(getContactEnterprise)
  .put(updateContactEnterprise)
  .delete(deleteContactEnterprise); //only user quote

module.exports = router;
