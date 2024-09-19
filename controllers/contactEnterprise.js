const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ContactEnterprise = require("../models/contactEnterprise");

// @desc      Get all ContactEnterprise
// @route     GET /api/v1/contact-enterprise
// @access
exports.getContactEnterprises = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single contactEnterprise
// @route     GET /api/v1/contact-enterprise/:id
// @access
exports.getContactEnterprise = asyncHandler(async (req, res, next) => {
  const contactEnterprise = await ContactEnterprise.findById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Data Fetched successfully",
    data: contactEnterprise,
  });
});

// @desc      Create contact-enterprise
// @route     POST /api/v1/contact-enterprise/
// @access
exports.createContactEnterprise = asyncHandler(async (req, res, next) => {
  const contactEnterprise = await ContactEnterprise.create(req.body);

  res.status(201).json({
    success: true,
    message: "Data Created successfully",
    data: contactEnterprise,
  });
});

// @desc      Update contact-enterprise
// @route     PUT /api/v1/contact-enterprise/:id
// @access
exports.updateContactEnterprise = asyncHandler(async (req, res, next) => {
  const contactEnterprise = await ContactEnterprise.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Data Updated successfully",
    data: contactEnterprise,
  });
});

// @desc      Delete contact-enterprise
// @route     DELETE /api/v1/contact-enterprise/:id
// @access
exports.deleteContactEnterprise = asyncHandler(async (req, res, next) => {
  // let contactEnterprise=await ContactEnterprise.findById(req.params.id);
  await ContactEnterprise.findByIdAndDelete(req.params.id);

  res.status(204).json({
    success: true,
    message: "Data deleted successfully",
    data: {},
  });
});
