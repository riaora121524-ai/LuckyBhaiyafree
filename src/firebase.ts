import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9IBIoB5XyqcYcPY_LM89irTvDNk_uHw8",
  authDomain: "gen-lang-client-0855132090.firebaseapp.com",
  projectId: "gen-lang-client-0855132090",
  storageBucket: "gen-lang-client-0855132090.firebasestorage.app",
  messagingSenderId: "644477251429",
  appId: "1:644477251429:web:38af92a89927fba5b7fb8c"
};

const app = initializeApp(firebaseConfig);
const databaseId: string = "ai-studio-luckybhaiya-58744101-d359-4570-9398-e53deaef3482";

export const db = databaseId && databaseId !== "(default)"
  ? getFirestore(app, databaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Client-side user ID to separate bookmarks/progress without requiring accounts
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "guest";
  let userId = localStorage.getItem("lucky_user_id");
  if (!userId) {
    userId = "user_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("lucky_user_id", userId);
  }
  return userId;
}

export interface UserPrefs {
  bookmarks: string[];
  creatorMode: boolean;
  completedChapters_class9: string[];
  completedChapters_class10: string[];
}

export async function loadUserPrefs(userId: string): Promise<UserPrefs> {
  try {
    const docRef = doc(db, "user_preferences", `user_${userId}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        bookmarks: data.bookmarks || [],
        creatorMode: data.creatorMode || false,
        completedChapters_class9: data.completedChapters_class9 || [],
        completedChapters_class10: data.completedChapters_class10 || [],
      };
    }
  } catch (err) {
    console.error("Error loading user preferences from Firestore:", err);
  }
  
  // Migration fallback from localStorage
  let legacyBookmarks: string[] = [];
  let legacyCreator = false;
  let legacyComp9: string[] = [];
  let legacyComp10: string[] = [];

  if (typeof window !== "undefined") {
    try {
      const b = localStorage.getItem("lucky_bookmarks");
      if (b) legacyBookmarks = JSON.parse(b);
      const c = localStorage.getItem("lucky_creator_mode");
      if (c) legacyCreator = c === "true";
      const c9 = localStorage.getItem("lucky_completed_class-9");
      if (c9) legacyComp9 = JSON.parse(c9);
      const c10 = localStorage.getItem("lucky_completed_class-10");
      if (c10) legacyComp10 = JSON.parse(c10);
    } catch (e) {
      console.error("Failed to parse legacy localStorage items", e);
    }
  }
  
  const initialPrefs: UserPrefs = {
    bookmarks: legacyBookmarks,
    creatorMode: legacyCreator,
    completedChapters_class9: legacyComp9,
    completedChapters_class10: legacyComp10,
  };

  // Save migrated preferences immediately to Firestore
  await saveUserPrefs(userId, initialPrefs);
  return initialPrefs;
}

export async function saveUserPrefs(userId: string, prefs: Partial<UserPrefs>): Promise<void> {
  try {
    const docRef = doc(db, "user_preferences", `user_${userId}`);
    await setDoc(docRef, prefs, { merge: true });
  } catch (err) {
    console.error("Error saving user preferences to Firestore:", err);
  }
}

