import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "samanvay-d0e2d.firebaseapp.com",
  projectId: "samanvay-d0e2d",
  storageBucket: "samanvay-d0e2d.firebasestorage.app",
  messagingSenderId: "313182200112",
  appId: "1:313182200112:web:bce194bba17cc7139c28f5",
};

const app = initializeApp(firebaseConfig);

export default app;