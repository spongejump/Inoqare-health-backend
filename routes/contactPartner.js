const express = require("express");
const {
  createContactPartner,
  getContactPartners,
  getContactPartner,
  updateContactPartner,
  deleteContactPartner,
} = require("../controllers/contactPartner.js");

const ContactPartner = require("../models/contactPartner");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

//public
router
  .route("/")
  .post(createContactPartner)
  .get(advancedResults(ContactPartner), getContactPartners);
router
  .route("/:id")
  .get(getContactPartner)
  .put(updateContactPartner)
  .delete(deleteContactPartner);

module.exports = router;
