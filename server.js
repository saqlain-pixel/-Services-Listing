require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

// connect DB
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, ".")));

// routes
app.use("/api/services", require("./routes/serviceRoutes"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/services", (req, res) => {
  res.sendFile(path.join(__dirname, "services.html"));
});

app.get("/service-details", (req, res) => {
  res.sendFile(path.join(__dirname, "service-details.html"));
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});