const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

require("./database");

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/groceries", require("./routes/groceryRoutes"));

app.get("/", (req, res) => {
  res.send("Grocery Tracker API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});