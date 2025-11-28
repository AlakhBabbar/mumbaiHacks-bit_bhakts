import { getUserPortfolio } from "../../../firebase/getPortfolio.js";
import { fetchNSEStock, fetchNiftyIndex } from "./fetchNSE.js";

export async function getFullMarketSnapshot(userId) {
  // 1) User portfolio from Firestore
  const portfolio = await getUserPortfolio(userId);

  // 2) Fetch live data for each stock
  const livePrices = {};
  for (const symbol of portfolio) {
    livePrices[symbol] = await fetchNSEStock(symbol);
  }

  // 3) Fetch Nifty index
  const index = await fetchNiftyIndex();

  return {
    portfolio,
    livePrices,
    index
  };
}
