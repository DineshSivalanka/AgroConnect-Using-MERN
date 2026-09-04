import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8")
    );

    initializeApp({
      credential: cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully");
  } else {
    console.warn(
      "FIREBASE_SERVICE_ACCOUNT_KEY_PATH is not set in .env. Firebase Admin not initialized."
    );
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

const admin = {
  auth: getAuth,
  get apps() {
    return getApps();
  }
};

export default admin;