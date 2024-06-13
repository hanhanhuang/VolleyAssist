import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: "AIzaSyBFrsKNN0hc56NkBnIfwZe5mj1wxg-fyTQ",
  authDomain: "my-app-b381b.firebaseapp.com",
  projectId: "my-app-b381b", 
  storageBucket: "my-app-b381b.appspot.com",
  messagingSenderId: "342241094655",
  appId: "1:342241094655:web:7004ee4ee4e60beec4d5ca",
  measurementId: "G-4ZW56M6WYD",
  databaseURL: 'https://my-app-b381b-default-rtdb.asia-southeast1.firebasedatabase.app',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;