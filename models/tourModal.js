const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

// we can provide schema definition and schema options
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a Name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 characters"],
      minlength: [10, "A tour name must have more or equal than 10 characters"],
      // validate: [
      //   validator.isAlpha,
      //   "The tour name must only contain characters",
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a Duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a Group Size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a Difficulty"],
      enum: {
        values: ["easy", "medium", "difficulty"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a Price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // here (this) keyword only has access to current variable and will not work for the update
          return val < this.price; // 100 < 200 = true
        },
        message: "Discount price ({VALUE}) should be below the regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a Summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a Cover Image"],
    },
    images: [String],
    ceartedAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  // we use the actual function and not the arrow func becoz arrow function does not have its own this keyword
  return this.duration / 7;
});

// using the document middleware on schema
// pre middle ware will run before an actual evevnt
//  DOCUMENT MIDDLEWARE: runs before .save() and .create() but not after .insertMany()
tourSchema.pre("save", function (next) {
  //* this function will be called before the actual data is saved in the database
  //* now we will create a slug here before the data is put to DB
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", function (next) {
//   console.log("Will save document....");
//   next();
// });

// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// ? this middle ware looks excatly like Document middleware the only difference is that we are using (find) hook
// ? big differenec is that the this keyword will point at current query and not the current document

// this is not running for the findOne so we have 2 options we can duplicate the middleware and set the hook of second one to findOne
//  but its not good practice so we use regex instead
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre("find", function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);

  console.log(docs);
  next();
});

// AGGRGATION MIDDLWARE: allows us to add hooks before or after an aggregation happens
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  // console.log(this.pipeline());
  next();
});

// convention to always use Uppercase on modal name vars
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;

// ?virtual Properties are fields that are defined in schema but that will not be
// ?persisted (they will be calculated using some other value)
// just like express we also have middle ware in mongoose that we can use to run between the req to save the the query and
//  when the query is actually saved and these req are called pre and post middleware. There are 4 types of middleware in express
// 1. Document Middleware: runs before or after certain query is executed
// 2. Query Middleware: runs before or after certain query is executed
// 3. Aggregate Middleware: runs before or after certain query is executed
// 4. Model Middleware: runs before or after certain query is executed
// we can use middleware to encrypt password before saving it to the database

//? 2) Query Middleware: allows us to run certain functions before or after certain query is executed

// Now the last part of this module is Validating data using mongoose (DATA VALIDATION IN MONGOOSE)
// Data validation and data sanitization are different
