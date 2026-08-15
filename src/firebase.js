import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD360tMP1tawwhNJhu4TYBP_CKms7LCfd8",
  authDomain: "samanvay-d0e2d.firebaseapp.com",
  projectId: "samanvay-d0e2d",
  storageBucket: "samanvay-d0e2d.firebasestorage.app",
  messagingSenderId: "313182200112",
  appId: "1:313182200112:web:d3c0d2938ea99e229c28f5",
  measurementId: "G-Q0D6S659Z8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;