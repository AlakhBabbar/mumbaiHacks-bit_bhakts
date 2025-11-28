import axios from "axios";

const NSE_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  "Accept": "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.nseindia.com/"
};

export async function fetchNSEStock(symbol) {
  const url = `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`;
  const res = await axios.get(url, { headers: NSE_HEADERS });
  
  const data = res.data;

  return {
    symbol,
    price: data.priceInfo.lastPrice,
    change: data.priceInfo.change,
    pChange: data.priceInfo.pChange,
    chart: data.priceInfo.intraday || null,
    metadata: data.metadata,
  };
}

export async function fetchNiftyIndex() {
  const url = "https://www.nseindia.com/api/marketStatus";
  const res = await axios.get(url, { headers: NSE_HEADERS });

  const nifty = res.data.marketState.find(i => i.index === "NIFTY 50");

  return {
    index: nifty.index,
    last: nifty.last,
    change: nifty.change,
    pChange: nifty.perChange,
  };
}
