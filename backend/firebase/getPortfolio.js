import { db } from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";

export async function getUserPortfolio(userId) {
  const colRef = collection(db, `users/${userId}/portfolio`);
  const snap = await getDocs(colRef);

  const symbols = [];
  snap.forEach(doc => symbols.push(doc.id));

  return symbols;  // ["TCS", "INFY", "RELIANCE"]
}
