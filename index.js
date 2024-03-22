const express = require("express");
const cors = require("cors");
const connectDb = require("./services/connectDB");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: `${process.env.FRONTEND_BASE_URL}`,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/folder", require("./routes/folderRoutes"));
app.use("/api/file", require("./routes/fileRoutes"));
app.get("/", (req, res) => {
  res.end("Hello");
});

app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is running on port ${PORT}`);
});
