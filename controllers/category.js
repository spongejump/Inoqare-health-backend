const fs = require("fs");
const mongoose = require('mongoose');
// const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Category = require("../models/category");

let globalCategories = [];

// @desc      Get all categories
// @route     POST /api/v1/category/list
// @access    
exports.getCategoryList = asyncHandler(async (req, res, next) => {
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

  if ('parent' in req.body) {
    if (req.body.parent.length > 0)
      searchInfo['parent'] = mongoose.Types.ObjectId(req.body.parent);
    else
      searchInfo['parent'] = null;
  }

  let categories = await Category.find(searchInfo).populate('parent').sort({ 'order': 1 });
  if (categories.length > 0) {
    for (let i = 0; i < categories.length; i++) {
      const parentCategory = await Category.findById(categories[i].parent);
      if (parentCategory)
        categories[i].parentLabel = parentCategory.label;

      const tree = await categories[i].getChildrenTree({});
      categories[i].children = tree;
    }
  }

  res.status(200).json({
    success: true,
    message: "Fetched category list successfully",
    data: categories,
  });
});

const getSubCategories = (res, index) => {
  if (index >= globalCategories.length) {
    res.status(200).json({
      success: true,
      message: "Fetched category list successfully",
      data: globalCategories,
    });

    return;
  }
  const eachParentCategory = globalCategories[index];

  Category.aggregate([
    {
      $graphLookup: {
        from: "categories",
        startWith: "$parent",
        connectFromField: "parent",
        connectToField: "_id",
        as: "hierarchy"
      }
    },
    {
      $match: {
        "hierarchy._id": mongoose.Types.ObjectId(eachParentCategory._id)
      }
    }
  ]).exec((err, subCategories) => {
    if (err) {
      res.status(500).send({
        message: "Failed to get sub-categories!",
      });
      return;
    }

    eachParentCategory['subCategories'] = subCategories;

    getSubCategories(res, index + 1);
  });
}

// @desc      Create a new category
// @route     POST /api/v1/category
// @access    
exports.createCategory = asyncHandler(async (req, res, next) => {
  const {
    parentId,
    label,
    imageName,
    imageUrl,
    isActive
  } = req.body;

  let parentCategory = null;
  if (parentId) {
    parentCategory = await Category.findOne({ _id: parentId });
    
    if (!parentCategory) {
      res.status(400).send({
         message: "Invalid parent category!",
      });
      return;
    }
  }

  const uidList = await Category.find().sort({ 'uid': -1 }).limit(1);

  let uid = 1;
  if (uidList.length > 0)
    uid = uidList[0].uid + 1;

  const orderList = await Category.find().sort({ 'order': -1 }).limit(1);

  let order = 1;
  if (orderList.length > 0)
    order = orderList[0].order + 1;
    
  const category = await Category.create({
    uid: uid,
    parent: parentCategory,
    isAvailable: false,
    label,
    imageName,
    imageUrl,
    isActive,
    order
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

// @desc      Update category
// @route     PUT /api/v1/category/:id
// @access    admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const {
    parentId,
    isAvailable,
    label,
    imageName,
    imageUrl,
    isActive
  } = req.body;

  /* let parentCategoryID = null;
  if (parentId) {
    const parentCategoryObj = await Category.findOne({ _id: parentId });
    parentCategoryID = parentCategoryObj._id;

    if (!parentCategoryID) {
      res.status(400).send({
         message: "Invalid parent category!",
      });
      return;
    }
  }

  if (req.params.id === parentId) {
    res.status(400).send({
      message: "Invalid parent category!",
    });
    return;
  } */

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      isAvailable,
      label,
      imageName,
      imageUrl,
      isActive
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc      Delete category
// @route     DELETE /api/v1/category/:id
// @access    admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { imageName } = await Category.findOne({ _id: req.params.id });

  const directoryPath = __basedir + "/uploads/";

  if (imageName) {
    fs.unlink(directoryPath + imageName, async (err) => {
      deleteAllSubCategories(req.params.id, res);
    });
  } else {
    deleteAllSubCategories(req.params.id, res);
  }
});

// @desc      Change/Switch orders of categories
// @route     POST /api/v1/category/change_order
// @access    
exports.changeOrder = asyncHandler(async (req, res, next) => {
  const {
    id,
    order,
    direction,
    parent
  } = req.body;

  let searchInfo = {};
  if (direction === -1) {
    searchInfo = { order: { $lt: order } };
  } else if (direction === 1) {
    searchInfo = { order: { $gt: order } };
  } else {
    res.status(400).send({
      message: "Invalid direction parameter!",
    });
    return;
  }

  if ('parent' in req.body) {
    if (req.body.parent.length > 0)
      searchInfo['parent'] = mongoose.Types.ObjectId(req.body.parent);
    else
      searchInfo['parent'] = null;
  }

  const currentCategory = await Category.findOne({ _id: id });
  if (!currentCategory) {
    res.status(400).send({
      message: "Invalid id parameter!",
    });
    return;
  }

  if (currentCategory.order !== order) {
    res.status(400).send({
      message: "Invalid order parameter!",
    });
    return;
  }

  const otherCategoryList = await Category.find(searchInfo).sort({ 'order': direction }).limit(1);
  if (otherCategoryList.length === 0) {
    /* res.status(500).send({
      message: "Could not change order!",
    }); */
    res.status(200).json({
      success: true,
      message: ""
    });
    return;
  }

  const otherCategory = otherCategoryList[0];

  const currentOrder = order;
  const otherOrder = otherCategory.order;

  const tempOrder = 0;

  await Category.findByIdAndUpdate(
    currentCategory._id,
    { order: tempOrder },
    { new: true, runValidators: true }
  );

  await Category.findByIdAndUpdate(
    otherCategory._id,
    { order: currentOrder },
    { new: true, runValidators: true }
  );

  await Category.findByIdAndUpdate(
    currentCategory._id,
    { order: otherOrder },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: "Changed/switched orders successfully"
  });
});

const deleteAllSubCategories = (id, res) => {
  Category.aggregate([
    {
      $graphLookup: {
        from: "categories",
        startWith: "$parent",
        connectFromField: "parent",
        connectToField: "_id",
        as: "hierarchy"
      }
    },
    {
      $match: {
        $or: [
          { "hierarchy._id": mongoose.Types.ObjectId(id) },
          { _id: mongoose.Types.ObjectId(id) }
        ]
      }
    }
  ]).exec(async (err, categories) => {
    if (err) {
      res.status(500).send({
        message: "Failed to delete category and sub-categories!",
      });
      return;
    }

    categories.forEach(async (eachCategory) => {
      await Category.findByIdAndDelete(eachCategory._id);
    });
    
    res.status(200).json({
      success: true,
      message: "Category is successfully deleted",
    });
  });
}