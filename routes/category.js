const express = require("express");
const {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
  changeOrder
} = require("../controllers/category.js");

const router = express.Router({ mergeParams: true });

const { authorize } = require("../middleware/auth");

router.route("/list").post(getCategoryList);
router.route("/").post(createCategory);
router
  // .use(authorize("admin"))
  .route("/:id")
  .put(updateCategory)
  .delete(deleteCategory);
router.route("/change_order").post(changeOrder);

module.exports = router;