import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import stockTrendRoute from "./routes/stockTrend.js";
import financialDataRoute from "./routes/financialData.js";
import goalsRoute from "./routes/goals.js";


const app = express();

const { db, auth } = await import("./firebase/firebase.js"); // dynamic import

// Middleware
app.use(cors());
app.use(express.json());

app.use("/agent", stockTrendRoute);
app.use("/api/financial", financialDataRoute);
app.use("/api/goals", goalsRoute);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Finance backend running 🚀" });
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
