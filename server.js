const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

const ErrorResponse = require("./utils/errorResponse");
const asyncHandler = require("./middleware/async");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route files
const user = require("./routes/user");
const quote = require("./routes/quote");
const contactEnterprise = require("./routes/contactEnterprise");
const contactEmployee = require("./routes/contactEmployee");
const contactPartner = require("./routes/contactPartner");
const contactForm = require("./routes/contactForm");
const category = require("./routes/category");
const country = require("./routes/country");
const specialty = require("./routes/specialty");
const product = require("./routes/product");
const file = require("./routes/file");

const app = express();

global.__basedir = __dirname;
global.__baseUrl = process.env.BASE_URL

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Enable CORS
app.use(cors());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Mount routers
app.use("/api/v1/user", user);
app.use("/api/v1/quote", quote);
app.use("/api/v1/contact-enterprise", contactEnterprise);
app.use("/api/v1/contact-employee", contactEmployee);
app.use("/api/v1/contact-partner", contactPartner);
app.use("/api/v1/contact-form", contactForm);
app.use("/api/v1/category", category);
app.use("/api/v1/country", country);
app.use("/api/v1/specialty", specialty);
app.use("/api/v1/product", product);
app.use("/", file);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
