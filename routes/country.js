const express = require("express");
const {
  getCountryList,
  getCountrySmallList,
  createCountry,
  updateCountry,
  deleteCountry,
  changeOrder
} = require("../controllers/Country.js");

const router = express.Router({ mergeParams: true });

const { authorize } = require("../middleware/auth");

router.route("/list").post(getCountryList);
router.route("/small_list").post(getCountrySmallList);
router.route("/").post(createCountry);
router
  // .use(authorize("admin"))
  .route("/:id")
  .put(updateCountry)
  .delete(deleteCountry);
router.route("/change_order").post(changeOrder);

module.exports = router;