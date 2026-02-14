const mongoose = require("mongoose");
const dotenv = require("dotenv");

// unhandled exceptions
process.on("unhandledException", (err) => {
  console.log(err.name, err.message);
  // in this case our application will not be able to recover from this error so the only option we have id to shut down the app
  console.log("UNHANDLED EXCEPTION! Shutting down...");
  process.exit(1);
});

const app = require("./app");
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Add this
    useCreateIndex: true, // If using unique indexes
  })
  .then(() => console.log("DB connection successful!"));

// Monggose is all about modals, MODAL is a blueprint to create documents

const port = 3000 || process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// every thing that is not related to express we will do it outside the app.js file

//  DB password: dbNatoursDatabase

// UNhandled rejection
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  // in this case our application will not be able to recover from this error so the only option we have id to shut down the app

  console.log("UNHANDLED REJECTION! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
