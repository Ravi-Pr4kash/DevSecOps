const userRoutes = require("./routes/users.js");
const express = require("express");
const connectDB = require("./db");

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "DevSecOps API is running",
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
