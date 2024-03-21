const express = require("express");
const connectDb = require("./services/connectDB");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.get("/", (req, res) => {
  res.end("Hello");
});

app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is running on port ${PORT}`);
});
