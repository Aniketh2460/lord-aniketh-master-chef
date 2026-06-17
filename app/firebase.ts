import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtR2G7xDhFQipqwyLlv0ApJnoN7w9W8bE",
  authDomain: "lord-aniketh-master-chef.firebaseapp.com",
  projectId: "lord-aniketh-master-chef",
  storageBucket: "lord-aniketh-master-chef.firebasestorage.app",
  messagingSenderId: "24568949409",
  appId: "1:24568949409:web:483dd6522278e1d67d9ee0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;