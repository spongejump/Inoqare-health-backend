const mongoose = require('mongoose');
const asyncHandler = require("../middleware/async");
const Country = require("../models/country");
const Category = require("../models/category");

// @desc      Get all countries
// @route     GET /api/v1/country
// @access    
exports.getCountryList = asyncHandler(async (req, res, next) => {
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

  let rootCountry = await Category.findOne({ label: 'Countries' });

  if ('parent' in req.body) {
    if (req.body.parent.length > 0)
      searchInfo['parent'] = mongoose.Types.ObjectId(req.body.parent);
    else
      searchInfo['parent'] = null;
  } else {
    searchInfo['parent'] = null;
  }

  if (!searchInfo['parent'] && rootCountry) {
    searchInfo['parent'] = rootCountry._id;
  }

  let countries = await Category.find(searchInfo).populate('parent').sort({ 'order': 1 });
  
  res.status(200).json({
    success: true,
    message: "Fetched country list successfully",
    data: countries,
  });
});

// @desc      Get all countries
// @route     GET /api/v1/country
// @access    
exports.getCountrySmallList = asyncHandler(async (req, res, next) => {
  if (!('rootSpecialtyId' in req.body)) {
    res.status(500).send({
      message: "Root specialty id not specified!",
    });
    return;
  }

  const rootSpecialtyId = req.body['rootSpecialtyId'];

  Category.aggregate([
    {
      "$match": {
        "_id": mongoose.Types.ObjectId(rootSpecialtyId)
        /* "$and": [
          {
            "path": {
              "$regex": rootSpecialtyId
            }
          },
          {
            "$nor": [
              {
                "_id": mongoose.Types.ObjectId(rootSpecialtyId)
              }
            ]
          }
        ] */
      }
    },
    {
      "$project": {
        "_id": 1
      }
    },
    {
      "$lookup": {
        "from": "products",
        "localField": "_id",
        "foreignField": "categories.children._id",
        "as": "doc"
      }
    },
    {
      "$project": {
        "_id": 0,
        "doc.categories": 1
      }
    },
    {
      "$unwind": "$doc"
    },
    {
      "$replaceRoot": {
        "newRoot": "$doc"
      }
    },
    {
      "$unwind": "$categories"
    },
    {
      "$match": {
        "categories.label": "Countries"
      }
    },
    {
      "$project": {
        "categories.children._id": 1,
        "categories.children.label": 1
      }
    },
    {
      "$replaceRoot": {
        "newRoot": "$categories"
      }
    },
    {
      "$unwind": "$children"
    },
    {
      $group: {
        _id: "$children._id",
        label: {
          $push: "$children.label"
        }
      }
    },
    {
      "$unwind": "$label"
    },
    {
      $group: {
        _id: "$_id",
        label: {
          $push: "$label"
        }
      }
    },
    {
      "$lookup": {
        "from": "categories",
        "localField": "_id",
        "foreignField": "_id",
        "as": "doc"
      }
    },
    {
      "$project": {
        "_id": 1,
        "doc.label": 1,
        "doc.imageUrl": 1,
        "doc.imageName": 1
      }
    },
    {
      "$unwind": "$doc"
    },
    {
      "$set": {
        "label": "$doc.label",
        "imageName": "$doc.imageNamebel",
        "imageUrl": "$doc.imageUrl"
      }
    },
    {
      "$unset": "doc"
    }
  ]).exec((err, countries) => {
    if (err) {
      res.status(500).send({
        message: "Failed to get countries!",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Fetched country list successfully",
      data: countries,
    });
  });
});

exports.createCountry = asyncHandler(async (req, res, next) => {
  const {
    name,
    isActive
  } = req.body;

  const orderList = await Country.find().sort({ 'order': -1 }).limit(1);

  let order = 1;
  if (orderList.length > 0)
    order = orderList[0].order + 1;

  const country = await Country.create({
    name,
    isActive,
    order
  });

  res.status(201).json({
    success: true,
    message: "Country created successfully",
    data: country,
  });
});

// @desc      Update country
// @route     PUT /api/v1/country/:id
// @access    admin
exports.updateCountry = asyncHandler(async (req, res, next) => {
  const country = await Country.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: country,
  });
});

// @desc      Delete country
// @route     DELETE /api/v1/country/:id
// @access    admin
exports.deleteCountry = asyncHandler(async (req, res, next) => {
  const country = await Country.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Country is successfully deleted",
  });
});

// @desc      Change/Switch orders of countries
// @route     POST /api/v1/country/change_order
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

  const currentCountry = await Country.findOne({ _id: id });
  if (!currentCountry) {
    res.status(400).send({
      message: "Invalid id parameter!",
    });
    return;
  }

  if (currentCountry.order !== order) {
    res.status(400).send({
      message: "Invalid order parameter!",
    });
    return;
  }

  const otherCountryList = await Country.find(searchInfo).sort({ 'order': direction }).limit(1);
  if (otherCountryList.length === 0) {
    res.status(200).json({
      success: true,
      message: ""
    });
    return;
  }

  const otherCountry = otherCountryList[0];

  const currentOrder = order;
  const otherOrder = otherCountry.order;

  const tempOrder = 0;

  await Country.findByIdAndUpdate(
    currentCountry._id,
    { order: tempOrder },
    { new: true, runValidators: true }
  );

  await Country.findByIdAndUpdate(
    otherCountry._id,
    { order: currentOrder },
    { new: true, runValidators: true }
  );

  await Country.findByIdAndUpdate(
    currentCountry._id,
    { order: otherOrder },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: "Changed/switched orders successfully"
  });
});
