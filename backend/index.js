import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
// import { db, auth } from "./firebase/firebase.js";

const app = express();

const { db, auth } = await import("./firebase/firebase.js"); // dynamic import

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Finance backend running 🚀" });
});


// Test Firestore
app.get("/test/firestore", async (req, res) => {
  try {
    // write test doc
    await db.collection("test").doc("ping").set({ ok: true, time: Date.now() });

    // read it back
    const snap = await db.collection("test").doc("ping").get();

    res.json({
      firestoreConnected: true,
      data: snap.data(),
    });
  } catch (error) {
    res.status(500).json({
      firestoreConnected: false,
      error: error.message,
    });
  }
});

// Test Auth
app.get("/test/auth", async (req, res) => {
  try {
    const listUsers = await auth.listUsers(1);

    res.json({
      authConnected: true,
      sampleUser: listUsers.users.length ? listUsers.users[0] : null,
    });
  } catch (error) {
    res.status(500).json({
      authConnected: false,
      error: error.message,
    });
  }
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
