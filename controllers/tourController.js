const Tour = require("./../models/tourModal");
const APIFeatures = require("../utils/apiFeatures");

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // // BUILD QUERY
    // // 1A) Filtering
    // const queryObj = { ...req.query };
    // const excludedFields = ["page", "sort", "limit", "fields"];
    // excludedFields.forEach((el) => delete queryObj[el]);

    // // 1B) Advanced Filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // // console.log(req.query, queryObj);
    // console.log(JSON.parse(queryStr));
    // // Recommended way that we start chaining the special mongoose methods to build the query
    // let query = Tour.find(JSON.parse(queryStr));

    // 2) SORTING
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(",").join(" ");
    //   query = query.sort(sortBy);
    //   // if there are 2 objects with same price then we have to add another criteria to sort them
    //   // sort('price ratingsAverage')
    // } else {
    //   // if user does not add my sorting param
    //   query = query.sort("-createdAt");
    // }

    // 3) FIELD LIMITING
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(",").join(" ");
    //   query = query.select(fields);
    // } else {
    //   query = query.select("-__v");
    // }

    // 4) PAGINATION
    // page=2&limit=10  [page 1-10 on page1 , 11-20 on page2, 21-30 on page3 ...]
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numbTours = await Tour.countDocuments();
    //   if (skip >= numbTours) throw new Error("This page does not exist !!!");
    // }

    // 5) API ALIASING
    // it is a route that specifically gives user the specific results like it will give the tours with top 5 and cheapest
    // which means that we will perform different filters and sort or maybe limit features
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const tours = await features.query;

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "There are no tours !!!",
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

// reating AGGREGATED PIPELINE
// creating a helper function that is gonna calculate a couple of stats about tours
exports.getTourStats = async (req, res) => {
  try {
    // * we pass in an array of so called stages in aggregation, then the document will pass one by one through these stages
    // * in defined sequence

    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // this group will help us group docs together using an accumulator
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 }, // 1 for ascending
      },
      // {
      //   $match: { _id: { $ne: "EASY" } }, new operator not equal to
      // },
    ]);

    // sending the response
    res.status(201).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
// after handler function the next step is to add a new tour route

// TODO: OBJECTIVE: lets say we are developing this applucation for the real business need and they asked us to implement a function
// TODO: that calculates the busiest month of the given year so we will implement this function with aggregation

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        // * unwind will deconstruct an array field from the input documents to output a document for each element
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStart: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStart: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: "success",
      result: plan.length,
      data: {
        plan,
      },
    });
  } catch (e) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
