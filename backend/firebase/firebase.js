import admin from "firebase-admin";


console.log("ENV LOADED? =>", !!process.env.GEMINI_API);
console.log("RAW ENV =>", process.env.FIREBASE_SERVICE_ACCOUNT?.slice(0, 50));


let serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);



if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
