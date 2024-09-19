const express = require("express");
const {
  getQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  getUserQuotes,
  getAnyUserQuotes,
} = require("../controllers/quote.js");

const Quote = require("../models/quote");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

router.route("/").post(createQuote); // public

router.use(protect); // only user
router.route("/user/:id").get(getAnyUserQuotes); // find the quote of a user
router.route("/mine").get(getUserQuotes); // all quotes of user
router.route("/:id").get(getQuote); // only user quote

// for admin
router
  .use(authorize("admin"))
  .route("/:id")
  .put(updateQuote)
  .delete(deleteQuote);
router
  .use(authorize("admin"))
  .route("/")
  .get(advancedResults(Quote, "user"), getQuotes);

module.exports = router;
