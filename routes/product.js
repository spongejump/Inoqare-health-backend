const express = require("express");
const {
  getProductList,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  changeOrder,
  getPrice
} = require("../controllers/product.js");

const router = express.Router({ mergeParams: true });

const { authorize } = require("../middleware/auth");

router.route("/list").post(getProductList);
router.route("/:id").get(getSingleProduct);
router.route("/").post(createProduct);
router.route("/price").post(getPrice);
router
  // .use(authorize("admin"))
  .route("/:id")
  .put(updateProduct)
  .delete(deleteProduct);
router.route("/change_order").post(changeOrder);

module.exports = router;