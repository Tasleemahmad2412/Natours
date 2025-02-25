// its the convention to have all the express configs in app.js or index.js in my case
const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./dev-data/routes/tourRoutes");
const userRouter = require("./dev-data/routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(morgan("dev"));
app.use(express.json());

// how to access files from our file system using a middle ware
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// defining a global middleware for error handling
app.use(globalErrorHandler);

module.exports = app;

// param middlwware is a middleware that runs for a certain parameters
// in our case the only parameter we have is ID
// it means that the middlw ware will only run when this ID is present in URL
