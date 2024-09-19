const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/resetPasswordEmail");
const User = require("../models/user");
const crypto = require("crypto");

// @desc      Register user
// @route     POST /api/v1/user/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const {
    user_name,
    email,
    password,
    phone,
    country_code,
    salutation,
    first_name,
    middle_name,
    last_name,
    address,
    role,
  } = req.body;
  if (role !== "admin") {
    // Create user
    const user = await User.create(req.body);
    sendTokenResponse(user, 200, res);
  } else {
    // Create admin
    const user = await User.create({
      user_name,
      email,
      password,
      phone,
      country_code,
      salutation,
      first_name,
      middle_name,
      last_name,
      address,
      role: "admin",
    });
    sendTokenResponse(user, 200, res);
  }
});

// @desc      add user by admin
// @route     POST /api/v1/user/
// @access    Admin
exports.addUser = asyncHandler(async (req, res, next) => {
  const {
    user_name,
    email,
    phone,
    country_code,
    salutation,
    first_name,
    middle_name,
    last_name,
    address,
    role,
  } = req.body;
  // Create user
  const user = await User.create({
    user_name,
    email,
    password: "12345678",
    phone,
    country_code,
    salutation,
    first_name,
    middle_name,
    last_name,
    address,
    role,
  });
  // sendTokenResponse(user, 201, res);
  res.status(201).json({
    success: true,
    message: "user added successfully",
    data: user,
  });
});

// @desc      Login user
// @route     POST /api/v1/user/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/user/login
// @access    Public
exports.socialLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");
  //not user then create on
  if (!user) {
    const newUser = await User.create({
      email,
      password,
    });
    // Check for user
    const result = await User.findOne({ email }).select("+password");
    // Check if password matches
    const isMatch = await result.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }
    sendTokenResponse(result, 200, res);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/user/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "successfully logged out",
    data: {},
  });
});

// @desc      Get current logged in user
// @route     POST /api/v1/user/info/:id
// @access    Private
exports.userInfo = asyncHandler(async (req, res, next) => {
  console.log(req.params.id);
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      update user profile info
// @route     PUT /api/v1/user/info/:id
// @access    Private
exports.updateDetailsUpdate = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      update user by admin
// @route     Put /api/v1/user/:id
// @access    ADMIN
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      data: {
        _id: user._id,
        user_name: user.username,
        email: user.email,
        country_code: user.country_code,
        phone: user.phone,
        salutation: user.salutation,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        address: user.address,
        role: user.role,
      },
    });
};

// @desc      Get all users,allow filtering
// @route     GET /api/v1/user/admin/
// @access    Private/admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single user details by admin
// @route     GET /api/v1/user/:id
// @access    admin
exports.getOneUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Delete user
// @route     DELETE /api/v1/user/:id
// @access
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Data deleted successfully",
    data: {},
  });
});

// @desc      Forgot password
// @route     POST /api/v1/user/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  console.log("mail", req.body.email);
  const user = await User.findOne({ email: req.body.email });
  console.log("user", user);

  if (!user) {
    return next(
      new ErrorResponse(
        "There is no user with that email.Please valid mail address",
        404
      )
    );
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  // const resetUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/user/resetpassword/${resetToken}`;

  const resetUrl = `https://www.inoqare.com/user/resetpassword/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Inoqare Account Password reset token",
      context: {
        salutation: user.salutation,
        firstName: user.first_name,
        lasName: user.last_name,
        resetLink: resetUrl,
      },
    });

    res.status(200).json({ success: true, data: "Email sent to user account" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  console.log(resetPasswordToken, user);

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
