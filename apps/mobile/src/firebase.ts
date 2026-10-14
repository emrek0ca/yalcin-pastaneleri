import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: 'yalcin-pastaneleri',
  appId: '1:746379317680:web:cbd69207fae036cda08675',
  storageBucket: 'yalcin-pastaneleri.firebasestorage.app',
  apiKey: 'AIzaSyDZXtdEeJV_5tG68230Y0PB-iSdE2kwmew',
  authDomain: 'yalcin-pastaneleri.firebaseapp.com',
  messagingSenderId: '746379317680',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
