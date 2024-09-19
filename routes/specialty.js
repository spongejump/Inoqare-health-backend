const express = require("express");
const {
  getSpecialtyList,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty
} = require("../controllers/specialty.js");

const router = express.Router({ mergeParams: true });

const { authorize } = require("../middleware/auth");

router.route("/list").post(getSpecialtyList);
router.route("/").post(createSpecialty);
router
  // .use(authorize("admin"))
  .route("/:id")
  .put(updateSpecialty)
  .delete(deleteSpecialty);

module.exports = router;