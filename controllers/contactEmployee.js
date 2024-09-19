const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ContactEmployee = require("../models/contactEmployee");

// @desc      Get all ContactEmployee
// @route     GET /api/v1/contact-employee
// @access
exports.getContactEmployees = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single contactEmployee
// @route     GET /api/v1/contact-employee/:id
// @access
exports.getContactEmployee = asyncHandler(async (req, res, next) => {
  const contactEmployee = await ContactEmployee.findById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Data fetched successfully",
    data: contactEmployee,
  });
});

// @desc      Create contact-employee
// @route     POST /api/v1/contact-employee/
// @access
exports.createContactEmployee = asyncHandler(async (req, res, next) => {
  const contactEmployee = await ContactEmployee.create(req.body);

  res.status(201).json({
    success: true,
    message: "Data created successfully",
    data: contactEmployee,
  });
});

// @desc      Update contact-employee
// @route     PUT /api/v1/contact-employee/:id
// @access
exports.updateContactEmployee = asyncHandler(async (req, res, next) => {
  const contactEmployee = await ContactEmployee.findByIdAndUpdate(
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
    data: contactEmployee,
  });
});

// @desc      Delete contact-employee
// @route     DELETE /api/v1/contact-employee/:id
// @access
exports.deleteContactEmployee = asyncHandler(async (req, res, next) => {
  await ContactEmployee.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Data deleted successfully",
    data: {},
  });
});
