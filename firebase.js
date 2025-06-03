// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsv0m1uyZqdm0Nnh_rvyfMqOyPLbbdOJM",
  authDomain: "dproject-7820f.firebaseapp.com",
  projectId: "dproject-7820f",
  storageBucket: "dproject-7820f.firebasestorage.app",
  messagingSenderId: "67120185273",
  appId: "1:67120185273:web:550b582ec1d6dcb9e94068",
  measurementId: "G-SKF03P08Y9"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export {storage};
