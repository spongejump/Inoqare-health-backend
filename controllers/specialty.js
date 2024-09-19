const fs = require("fs");
const mongoose = require('mongoose');
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Specialty = require("../models/specialty");
const Category = require("../models/category");

// @desc      Get all specialties
// @route     POST /api/v1/specialty/list
// @access    
exports.getSpecialtyList = asyncHandler(async (req, res, next) => {
  let searchInfo = {};
  if ('isActive' in req.body) {
    if (req.body.isActive)
      searchInfo['isActive'] = true;
    else
      searchInfo['isActive'] = false;
  }

  if ('isAvailable' in req.body) {
    if (req.body.isAvailable)
      searchInfo['isAvailable'] = true;
    else
      searchInfo['isAvailable'] = false;
  }

  let rootSpecialty = await Category.findOne({ label: 'Specialties' });

  if ('parent' in req.body) {
    if (req.body.parent.length > 0)
      searchInfo['parent'] = mongoose.Types.ObjectId(req.body.parent);
    else
      searchInfo['parent'] = null;
  } else {
    searchInfo['parent'] = null;
  }

  if (!searchInfo['parent'] && rootSpecialty) {
    searchInfo['parent'] = rootSpecialty._id;
  }

  let categories = await Category.find(searchInfo).populate('parent').sort({ 'order': 1 });
  
  res.status(200).json({
    success: true,
    message: "Fetched category list successfully",
    data: categories,
  });
});

exports.createSpecialty = asyncHandler(async (req, res, next) => {
  const {
    imageName,
    imageUrl,
    name,
    category,
    isActive,
    order
  } = req.body;

  const { _id: categoryID } = await Category.findOne({ _id: category });
  if (!categoryID) {
    res.status(500).send({
       message: "Invalid category!",
    });
    return;
  }

  const specialty = await Specialty.create({
    imageName,
    imageUrl,
    name,
    category: categoryID,
    isActive,
    order
  });

  res.status(201).json({
    success: true,
    message: "Specialty created successfully",
    data: specialty,
  });
});

// @desc      Update specialty
// @route     PUT /api/v1/specialty/:id
// @access    admin
exports.updateSpecialty = asyncHandler(async (req, res, next) => {
  const {
    imageName,
    imageUrl,
    isImageReplaced,
    name,
    category,
    isActive,
    order
  } = req.body;

  const { _id: categoryID } = await Category.findOne({ _id: category });
  if (!categoryID) {
    res.status(500).send({
       message: "Invalid category!",
    });
    return;
  }

  if (isImageReplaced) {
    const directoryPath = __basedir + "/uploads/";
    const { imageName: oldImageName } = await Specialty.findOne({ _id: req.params.id });
    
    fs.unlink(directoryPath + oldImageName, async (err) => {
    });
  }

  const specialty = await Specialty.findByIdAndUpdate(
    req.params.id,
    {
      imageName,
      imageUrl,
      name,
      category: categoryID,
      isActive,
      order
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: specialty,
  });
});

// @desc      Delete specialty
// @route     DELETE /api/v1/specialty/:id
// @access    admin
exports.deleteSpecialty = asyncHandler(async (req, res, next) => {
  const { imageName } = await Specialty.findOne({ _id: req.params.id });

  const directoryPath = __basedir + "/uploads/";

  fs.unlink(directoryPath + imageName, async (err) => {
    await Specialty.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Specialty is successfully deleted",
    });
  });
});
