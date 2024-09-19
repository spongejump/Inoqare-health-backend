const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ContactPartner = require("../models/contactPartner");

// @desc      Get all ContactPartner
// @route     GET /api/v1/contact-partner
// @access
exports.getContactPartners = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single contactPartner
// @route     GET /api/v1/contact-partner/:id
// @access
exports.getContactPartner = asyncHandler(async (req, res, next) => {
  const contactPartner = await ContactPartner.findById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Data fetched successfully",
    data: contactPartner,
  });
});

// @desc      Create contact-partner
// @route     POST /api/v1/contact-partner/
// @access
exports.createContactPartner = asyncHandler(async (req, res, next) => {
  const contactPartner = await ContactPartner.create(req.body);

  res.status(201).json({
    success: true,
    message: "Data created successfully",
    data: contactPartner,
  });
});

// @desc      Update contact-partner
// @route     PUT /api/v1/contact-partner/:id
// @access
exports.updateContactPartner = asyncHandler(async (req, res, next) => {
  const contactPartner = await ContactPartner.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Data updated successfully",
    data: contactPartner,
  });
});

// @desc      Delete contact-partner
// @route     DELETE /api/v1/contact-partner/:id
// @access
exports.deleteContactPartner = asyncHandler(async (req, res, next) => {
  await ContactPartner.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Data deleted successfully",
    data: {},
  });
});
