import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBbMkQNzdQz-VOyJ_ubWVuX9l0GgWdz_Iw',
  authDomain: 'juice-guru-wizard.firebaseapp.com',
  projectId: 'juice-guru-wizard',
  storageBucket: 'juice-guru-wizard.firebasestorage.app',
  messagingSenderId: '839196863301',
  appId: '1:839196863301:web:6481e850cd8fcba7bf2c2c',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Storage
export const storage = getStorage(app);
export default app;
