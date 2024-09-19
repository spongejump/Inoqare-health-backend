const mongoose = require('mongoose');
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Product = require("../models/product");
const Category = require("../models/category");
const Specialty = require("../models/specialty");
const Country = require("../models/country");

// @desc      Get all products
// @route     GET /api/v1/product
// @access    
exports.getProductList = asyncHandler(async (req, res, next) => {
  let searchInfo = {};
  if ('isActive' in req.body) {
    if (req.body.isActive)
      searchInfo['isActive'] = true;
    else
      searchInfo['isActive'] = false;
  }

  const products = await Product.find(searchInfo).populate("categories.children").sort({ 'order': 1 });
  
  res.status(200).json({
    success: true,
    message: "Fetched product list successfully",
    data: products,
  });
});

// @desc      Get single product
// @route     GET /api/v1/product/:id
// @access    Private
exports.getSingleProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("categories");
  
  res.status(200).json({
    success: true,
    data: product,
  });
});

const getSubCategories = async(parentCategoryId) => {
  const agg = Category.aggregate([
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
        "hierarchy._id": mongoose.Types.ObjectId(parentCategoryId)
      }
    }
  ]);

  const subCategories = await agg.exec();

  return subCategories;
}

exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    categories,
    qty,
    price,
    discount,
    isActive
  } = req.body;

  const categoriesID = await Promise.all(categories.map(async (each) => {
    let eachCategoriesID = {
      _id: null,
      label: '',
      children: []
    };

    if (each._id && each._id !== '') {
      eachCategoriesID._id = mongoose.Types.ObjectId(each._id);
      const parentCategory = await Category.findById(each._id);
      if (parentCategory)
        eachCategoriesID.label = parentCategory.label;
    } else {
      res.status(500).send({
        message: "Please select category!",
      });
      return;
    }

    for (let i = 0; i < each.children.length; i++) {
      const child = each.children[i];
      if (!child || !child._id || child._id === '')
        continue;

      const { label: childCategoryLabel } = await Category.findById(child._id);

      eachCategoriesID.children.push({
        _id: mongoose.Types.ObjectId(child._id),
        label: childCategoryLabel
      });

      const subCategories = await getSubCategories(child._id);
      if (!subCategories)
        continue;

      for (let j = 0; j < subCategories.length; j++) {
        eachCategoriesID.children.push({
          _id: mongoose.Types.ObjectId(subCategories[j]._id),
          label: subCategories[j].label
        });
      }
    }

    return eachCategoriesID;
  }));

  const orderList = await Product.find().sort({ 'order': -1 }).limit(1);

  let order = 1;
  if (orderList.length > 0)
    order = orderList[0].order + 1;

  const totalPrice = qty * price - (discount ? discount : 0);

  const product = await Product.create({
    categories: categoriesID,
    qty,
    price,
    discount,
    totalPrice,
    isActive,
    order
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// @desc      Update product
// @route     PUT /api/v1/product/:id
// @access    admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const {
    categories,
    qty,
    price,
    discount,
    isActive
  } = req.body;

  const updatedCategoriesID = await Promise.all(categories.map(async (each) => {
    let eachCategoriesID = {
      _id: null,
      label: '',
      children: []
    };

    if (each._id && each._id !== '') {
      eachCategoriesID._id = mongoose.Types.ObjectId(each._id);
      const parentCategory = await Category.findById(each._id);
      if (parentCategory)
        eachCategoriesID.label = parentCategory.label;
    } else {
      res.status(500).send({
        message: "Please select category!",
      });
      return;
    }

    for (let i = 0; i < each.children.length; i++) {
      const child = each.children[i];
      if (!child || !child._id || child._id === '')
        continue;

      const { label: childCategoryLabel } = await Category.findById(child._id);

      eachCategoriesID.children.push({
        _id: mongoose.Types.ObjectId(child._id),
        label: childCategoryLabel
      });

      const subCategories = await getSubCategories(child._id);
      if (!subCategories)
        continue;

      for (let j = 0; j < subCategories.length; j++) {
        eachCategoriesID.children.push({
          _id: mongoose.Types.ObjectId(subCategories[j]._id),
          label: subCategories[j].label
        });
      }
    }

    return eachCategoriesID;
  }));
    
  const totalPrice = qty * price - (discount ? discount : 0);

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      categories: updatedCategoriesID,
      qty,
      price,
      discount,
      totalPrice,
      isActive
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc      Delete product
// @route     DELETE /api/v1/product/:id
// @access    admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product is successfully deleted",
  });
});

// @desc      Change/Switch orders of products
// @route     POST /api/v1/product/change_order
// @access    
exports.changeOrder = asyncHandler(async (req, res, next) => {
  const {
    id,
    order,
    direction
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

  if ('category' in req.body) {
    if (req.body.category.length > 0)
      searchInfo['category'] = mongoose.Types.ObjectId(req.body.category);
    else
      searchInfo['category'] = null;
  }

  const currentProduct = await Product.findOne({ _id: id });
  if (!currentProduct) {
    res.status(400).send({
      message: "Invalid id parameter!",
    });
    return;
  }

  if (currentProduct.order !== order) {
    res.status(400).send({
      message: "Invalid order parameter!",
    });
    return;
  }

  const otherProductList = await Product.find(searchInfo).sort({ 'order': direction }).limit(1);
  if (otherProductList.length === 0) {
    res.status(200).json({
      success: true,
      message: ""
    });
    return;
  }

  const otherProduct = otherProductList[0];

  const currentOrder = order;
  const otherOrder = otherProduct.order;

  const tempOrder = 0;

  await Product.findByIdAndUpdate(
    currentProduct._id,
    { order: tempOrder },
    { new: true, runValidators: true }
  );

  await Product.findByIdAndUpdate(
    otherProduct._id,
    { order: currentOrder },
    { new: true, runValidators: true }
  );

  await Product.findByIdAndUpdate(
    currentProduct._id,
    { order: otherOrder },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: "Changed/switched orders successfully"
  });
});

// @desc      Get price
// @route     GET /api/v1/product
// @access    
exports.getPrice = asyncHandler(async (req, res, next) => {
  if (!('specialtyId' in req.body)) {
    res.status(500).send({
      message: "Specialty id not specified!",
    });
    return;
  }
  const specialtyId = req.body['specialtyId'];

  if (!('countryId' in req.body)) {
    res.status(500).send({
      message: "Country id not specified!",
    });
    return;
  }
  const countryId = req.body['countryId'];

  Product.aggregate([
    {
      "$project": {
        "_id": "$_id",
        "categories": "$categories",
        "qty": "$qty",
        "totalPrice": "$totalPrice",
        "isActive": "$isActive"
      }
    },
    {
      "$match": {
        "$and": [
          {
            "categories.label": "Specialties",
            "categories.children._id": mongoose.Types.ObjectId(specialtyId)
          },
          {
            "categories.label": "Countries",
            "categories.children._id": mongoose.Types.ObjectId(countryId)
          }
        ]
      }
    }
  ]).exec((err, products) => {
    if (err) {
      res.status(500).send({
        message: "Failed to get countries!",
      });
      return;
    }

    if (products.length === 0) {
      res.status(500).send({
        message: "Could not get price!",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Fetched country list successfully",
      data: {
        specialtyId,
        countryId,
        price: products[0].totalPrice
      }
    });
  });
});
