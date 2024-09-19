const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ContactForm = require("../models/contactForm");

// @desc      Get all ContactForm
// @route     GET /api/v1/contact-form
// @access
exports.getContactForms = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single contactForm
// @route     GET /api/v1/contact-form/:id
// @access
exports.getContactForm = asyncHandler(async (req, res, next) => {
  const contactForm = await ContactForm.findById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Data fetched successfully",
    data: contactForm,
  });
});

// @desc      Create contact-form
// @route     POST /api/v1/contact-form/
// @access
exports.createContactForm = asyncHandler(async (req, res, next) => {
  const contactForm = await ContactForm.create(req.body);

  res.status(201).json({
    success: true,
    message: "Data created successfully",
    data: contactForm,
  });
});

// @desc      Update contact-form
// @route     PUT /api/v1/contact-form/:id
// @access
exports.updateContactForm = asyncHandler(async (req, res, next) => {
  const contactForm = await ContactForm.findByIdAndUpdate(
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
    data: contactForm,
  });
});

// @desc      Delete contact-form
// @route     DELETE /api/v1/contact-form/:id
// @access
exports.deleteContactForm = asyncHandler(async (req, res, next) => {
  await ContactForm.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Data deleted successfully",
    data: {},
  });
});
