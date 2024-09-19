const express = require("express");
const {
  createContactEmployee,
  getContactEmployees,
  getContactEmployee,
  updateContactEmployee,
  deleteContactEmployee,
} = require("../controllers/contactEmployee.js");

const ContactEmployee = require("../models/contactEmployee");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

//public
router
  .route("/")
  .post(createContactEmployee)
  .get(advancedResults(ContactEmployee), getContactEmployees);
router
  .route("/:id")
  .get(getContactEmployee)
  .put(updateContactEmployee)
  .delete(deleteContactEmployee);

module.exports = router;
