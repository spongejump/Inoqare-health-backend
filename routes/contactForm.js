const express = require("express");
const {
  createContactForm,
  getContactForms,
  getContactForm,
  updateContactForm,
  deleteContactForm,
} = require("../controllers/contactForm.js");

const ContactForm = require("../models/contactForm");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
// const { protect, authorize } = require("../middleware/auth");

//public
router
  .route("/")
  .post(createContactForm)
  .get(advancedResults(ContactForm), getContactForms);
router.route("/:id").get(getContactForm);
// .put(updateContactForm)
// .delete(deleteContactForm);

module.exports = router;
