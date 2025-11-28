import express from "express";
import { getFullMarketSnapshot } from "../agents/tools/stock/fetchUserMarketData.js";

const router = express.Router();

router.get("/stock-trend/:userId", async (req, res) => {
  try {
    const data = await getFullMarketSnapshot(req.params.userId);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch stock trend data" });
  }
});

export default router;
