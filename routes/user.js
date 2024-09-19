const express = require("express");
const {
  register,
  login,
  logout,
  userInfo,
  updateDetailsUpdate,
  getUsers,
  getOneUser,
  updateUser,
  forgotPassword,
  resetPassword,
  deleteUser,
  addUser,
  socialLogin,
} = require("../controllers/user");

const User = require("../models/user");
const Quote = require("../models/quote");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

// both for public
router.post("/register", register);
router.post("/login", login);
router.post("/socialLogin", socialLogin);
router.get("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
// only logged In user
router.use(protect);
router.put("/info/:id", updateDetailsUpdate).get("/info/:id", userInfo); //for profle data both user and admin

// for admin get single User and get all user
router
  .use(authorize("admin"))
  .route("/:id")
  .get(getOneUser)
  .put(updateUser)
  .delete(deleteUser);
router
  .use(authorize("admin"))
  .route("/")
  .get(advancedResults(User), getUsers)
  .post(addUser);

module.exports = router;
