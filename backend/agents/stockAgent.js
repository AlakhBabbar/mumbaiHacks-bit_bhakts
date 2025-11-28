// SIMPLE STOCK AGENT
// 1. Load env
// 2. Fetch NSE quotes for symbols
// 3. Merge with dummy portfolio data (adds quantity & avgPrice)
// 4. Call Gemini for concise analysis
// 5. Return JSON output

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as NSE from "./tools/stock/fetchNSE.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const dummyPortfolio = [
  { symbol: "RELIANCE", quantity: 10, avgPrice: 2450 },
  { symbol: "TCS", quantity: 5, avgPrice: 3640 },
  { symbol: "HDFCBANK", quantity: 20, avgPrice: 1510 },
];

async function fetchQuotes(symbols) {
  const fetchOne = NSE.fetchNSEStock;
  if (typeof fetchOne !== "function") {
    // Fallback dummy prices
    const base = { RELIANCE: 2520, TCS: 3780, HDFCBANK: 1535 };
    return symbols.map(s => ({ symbol: s, price: base[s] || 1000 }));
  }
  const out = [];
  for (const sym of symbols) {
    try {
      const q = await fetchOne(sym);
      out.push({ symbol: sym, price: q.price ?? q.ltp ?? null });
    } catch {
      out.push({ symbol: sym, price: null });
    }
  }
  return out;
}

function enrichPositions(portfolio, quotes) {
  const map = new Map(quotes.map(q => [q.symbol.toUpperCase(), q]));
  return portfolio.map(p => {
    const q = map.get(p.symbol.toUpperCase());
    const ltp = q?.price ?? null;
    const cost = p.quantity * p.avgPrice;
    const value = ltp != null ? p.quantity * ltp : null;
    const pnl = value != null ? value - cost : null;
    const pnlPct = pnl != null ? (pnl / cost) * 100 : null;
    return { ...p, ltp, value, cost, pnl, pnlPct };
  });
}

async function analyzeWithGemini(positions) {
  const key = process.env.GEMINI_API;
  if (!key) return "Gemini API key missing (set GEMINI_API).";

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: key,
    temperature: 0.3,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are an Indian stock analysis agent. Be concise."],
    ["human", `Positions JSON:\n{positions}\n\nGive: 1) Brief summary 2) Key symbol notes 3) Action list.`]
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  return chain.invoke({ positions: JSON.stringify(positions) });
}

export async function runStockAgent() {
  const symbols = dummyPortfolio.map(p => p.symbol);
  const quotes = await fetchQuotes(symbols);
  const positions = enrichPositions(dummyPortfolio, quotes);
  const analysis = await analyzeWithGemini(positions);
  return { positions, analysis };
}

if (process.argv[1] && process.argv[1].endsWith("agent.js")) {
  runStockAgent()
    .then(r => {
      console.log(JSON.stringify(r, null, 2));
    })
    .catch(e => {
      console.error("Agent error:", e?.message || e);
      process.exit(1);
    });
}