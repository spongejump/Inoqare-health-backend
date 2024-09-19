const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Quote = require("../models/quote");
const User = require("../models/user");
const quoteAckMail = require("../utils/quoteAckMail");
const newUserAckMail = require("../utils/quoteAckMailforNewUser");
// const { v4 as uuidv4 } =require("uuid");

// @desc      Create new quote
// @route     POST /api/v1/quote
// @access    public
exports.createQuote = asyncHandler(async (req, res, next) => {
  const {
    salutation,
    first_name,
    middle_name,
    last_name,
    email,
    country_code,
    phone,
    treatment_info,
    source_country,
    destination_country,
    remarks,
    specialty,
  } = req.body;

  //find if there is any user with given email
  const user = await User.findOne({ email: req.body.email });
  //console.log("user find by emai", user);

  //user using that mail doesn't exists, it'll create user using user mail then create quote using newly created user_id
  if (!user) {
    //create new user
    const userNew = await User.create({
      salutation,
      first_name,
      middle_name,
      last_name,
      email,
      password: "12345678",
      country_code,
      phone,
    });
    // console.log("user create", user);
    //find the newly created user_id
    const { _id: newUserID } = await User.findOne({ email: req.body.email });
    //create quote using new user_id
    const quote = await Quote.create({
      treatment_info,
      source_country,
      destination_country,
      specialty,
      remarks,
      user: newUserID,
    });

    // const message = `You are receiving this email because you (or someone else) has requested quote on carehealth.\n\n ${quote}`;

    try {
      await newUserAckMail({
        email: userNew.email,
        subject: "quote information",
        context: {
          userId: newUserID,
          quoteId: quote?._id,
          email: userNew?.email,
          password: userNew?.password,
          salutation: userNew?.salutation,
          firstName: userNew?.first_name,
          lastName: userNew?.last_name,
          email: userNew?.email,
          password: "12345678",
          countryCode: userNew?.country_code,
          phone: userNew?.phone,
          treatmentInfo: quote?.treatment_info,
          sourceCountry: quote?.source_country,
          destinationCountry: quote?.destination_country,
          remarks: quote?.remarks,
          specialty:quote?.specialty,
          status: quote?.status,
          createdAt: quote?.createdAt,
        },
      });

      res
        .status(200)
        .json({ success: true, data: "Quote info is sent to user email" });
    } catch (err) {
      console.log(err);
      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } else {
    //if user is logged in/ or has user account, it will find the user_id
    //and add quote to that user_id.
    const quote = await Quote.create({
      treatment_info,
      source_country,
      destination_country,
      remarks,
      specialty,
      user: user._id,
    });

    // const message = `You are receiving this email because you (or someone else) has requested quote on inoqare.\n\n ${quote}`;

    try {
      await quoteAckMail({
        email: user.email,
        subject: "Submitted quote information",
        context: {
          firstName: user?.first_name,
          lastName: user?.last_name,
          userId: quote?.user,
          quoteId: quote?._id,
          treatmentInfo: quote?.treatment_info,
          sourceCountry: quote?.source_country,
          destinationCountry: quote?.destination_country,
          specialty: quote?.specialty,
          remarks: quote?.remarks,
          status: quote?.status,
          createdAt: quote?.createdAt,
          countryCode: user?.country_code,
          phone: user?.phone,
          email: user?.email,
        },
      });

      res
        .status(200)
        .json({ success: true, data: "Quote info is sent to user email" });
    } catch (err) {
      console.log(err);
      return next(new ErrorResponse("Email could not be sent", 500));
    }

    // res.status(201).json({
    //   success: true,
    //   data: quote,
    // });
  }
});

// @desc      Get all quote result, allow filtering
// @route     GET /api/v1/quote/
// @access    admin
exports.getQuotes = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get all quote of single user
// @route     GET /api/v1/quote
// @access    Private/user
exports.getUserQuotes = asyncHandler(async (req, res, next) => {
  const quotes = await Quote.find({ user: req.user.id });
  // console.log(quotes);

  res.status(200).json({
    success: true,
    message: "User's quote fetch successful",
    data: quotes,
  });
});

// @desc      Get all quote of single user
// @route     GET /api/v1/quote/user/:id
// @access    Private/user
exports.getAnyUserQuotes = asyncHandler(async (req, res, next) => {
  const quotes = await Quote.find({ user: req.params.id }).populate("user");
  // console.log(quotes);

  res.status(200).json({
    success: true,
    message: "User's quote fetch successful",
    data: quotes,
  });
});

// @desc      Get single quote
// @route     GET /api/v1/quote/:id
// @access    Private
exports.getQuote = asyncHandler(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id).populate("user");

  res.status(200).json({
    success: true,
    data: quote,
  });
});

// @desc      Update quote
// @route     PUT /api/v1/quote/:id
// @access    ADMIN
exports.updateQuote = asyncHandler(async (req, res, next) => {
  const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: quote,
  });
});

// @desc      Delete quote
// @route     DELETE /api/v1/quote/:id
// @access    admin
exports.deleteQuote = asyncHandler(async (req, res, next) => {
  const quote = await Quote.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Quote is successfully deleted",
  });
});
