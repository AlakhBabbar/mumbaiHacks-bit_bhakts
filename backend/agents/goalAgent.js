import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function ensureKey() {
  const key = process.env.GEMINI_API;
  if (!key || key.trim() === "") {
    throw new Error("GEMINI_API missing in backend/.env");
  }
  return key;
}

export async function createGoals({
  userId = "demo-user",
  focusArea = "Personal finance",
  timeframe = "30 days",
  startingPoint = "Beginner",
  constraints = [],
  preferences = {},
} = {}) {
  const key = ensureKey();
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: key,
    temperature: 0.2,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a pragmatic Goal Creator agent. Produce SMART goals with measurable milestones, action tasks, and simple metrics. Keep it realistic and concise.",
    ],
    [
      "human",
      `User: {userId}
    Focus Area: {focusArea}
    Timeframe: {timeframe}
    Starting Point: {startingPoint}
    Constraints: {constraints}
    Preferences: {preferences}

    Return a single JSON object with keys:
    - goals: array of objects (id, title, why, kpis[], deadline)
    - milestones: array of objects (goalId, title, due, metric)
    - tasks: array of objects (milestoneId, title, steps[], effort)
    - cadence: object (checkinsPerWeek, reviewTemplate)
    `
    ],
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const raw = await chain.invoke({
    userId,
    focusArea,
    timeframe,
    startingPoint,
    constraints: JSON.stringify(constraints),
    preferences: JSON.stringify(preferences),
  });

  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    json = { error: "LLM returned non-JSON", raw };
  }
  return json;
}

if (process.argv[1] && process.argv[1].endsWith("goalAgent.js")) {
  createGoals({
    focusArea: "Improve saving + investing habits",
    timeframe: "8 weeks",
    startingPoint: "Intermediate",
    constraints: ["busy weekdays", "limited capital"],
    preferences: { tools: ["Google Sheets", "NSE data"], style: "brief" },
  })
    .then((out) => {
      console.log(JSON.stringify(out, null, 2));
    })
    .catch((err) => {
      console.error("Goal agent error:", err?.message || err);
      process.exit(1);
    });
}
