import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDGhr9XeikXnkYIPuxm38PRQMYdqfoPaK8",
  authDomain: "golden-choice-d971f.firebaseapp.com",
  projectId: "golden-choice-d971f",
  storageBucket: "golden-choice-d971f.appspot.com",
  messagingSenderId: "991688784646",
  appId: "1:991688784646:web:73536e41625a43af81bc87",
  measurementId: "G-8FCDDV7E23"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined;

try {
  // Show a clear error if the most critical configuration is missing
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error("Firebase configuration is missing required properties.");
  }

  // Initialize Firebase App
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);

  // Initialize Analytics conditionally (only supported in browser environments)
  if (typeof window !== "undefined") {
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
      }
    }).catch(console.error);
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

export { app, auth, db, analytics };
