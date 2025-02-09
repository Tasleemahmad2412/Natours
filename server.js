const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connection successful!"));

// Monggose is all about modals, MODAL is a blueprint to create documents

const port = 3000 || process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// every thing that is not related to express we will do it outside the app.js file

//  DB password: dbNatoursDatabase
