import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYOnZlKPXQ1d25OonijX_AOZR-4-_ditQ",
  authDomain: "hopelunchapp.firebaseapp.com",
  projectId: "hopelunchapp",
  storageBucket: "hopelunchapp.appspot.com",
  messagingSenderId: "992971103778",
  appId: "1:992971103778:web:f103b5076a55bdce24347b",
  measurementId: "G-PREDM20B9Y",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
