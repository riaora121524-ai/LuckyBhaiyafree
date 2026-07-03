import { SUBJECTS, CHAPTERS, ALL_CHAPTER_LIST, Subject, Chapter } from "./chapters";
import { db } from "../firebase";
import { doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";

// Optimistic memory sync is synchronous for instantaneous UI feedback,
// and Firestore cloud persistence runs in the background.

export function getStoredSubjects(): Subject[] {
  return [...SUBJECTS];
}

export function saveStoredSubjects(subjects: Subject[]) {
  // 1. Instantly update in-memory cache
  SUBJECTS.length = 0;
  SUBJECTS.push(...subjects);

  // 2. Persist in Firestore in background
  saveStoredSubjectsToFirestore(subjects);
}

async function saveStoredSubjectsToFirestore(subjects: Subject[]) {
  try {
    const existingIds = subjects.map((s) => s.id) as string[];
    // Write updated subjects
    for (const sub of subjects) {
      await setDoc(doc(db, "subjects", sub.id), sub);
    }
    // Delete any subjects no longer in existence
    const snapshot = await getDocs(collection(db, "subjects"));
    for (const d of snapshot.docs) {
      if (!existingIds.includes(d.id)) {
        await deleteDoc(doc(db, "subjects", d.id));
      }
    }
  } catch (e) {
    console.error("Error saving subjects to Firestore:", e);
  }
}

export function getStoredChapters(): Chapter[] {
  return [...CHAPTERS];
}

export function saveStoredChapters(chapters: Chapter[]) {
  // 1. Instantly update in-memory cache
  CHAPTERS.length = 0;
  CHAPTERS.push(...chapters);

  // Update ALL_CHAPTER_LIST synchronously so UI is always accurate
  ALL_CHAPTER_LIST.length = 0;
  chapters.forEach((c) => {
    ALL_CHAPTER_LIST.push({
      id: c.id,
      number: c.number,
      title: c.title,
      classId: c.classId,
      subjectId: c.subjectId,
    });
  });

  // 2. Persist in Firestore in background
  saveStoredChaptersToFirestore(chapters);
}

async function saveStoredChaptersToFirestore(chapters: Chapter[]) {
  try {
    const existingIds = chapters.map((c) => c.id) as string[];
    // Write updated chapters
    for (const chap of chapters) {
      await setDoc(doc(db, "chapters", chap.id), chap);
    }
    // Delete any chapters no longer in existence
    const snapshot = await getDocs(collection(db, "chapters"));
    for (const d of snapshot.docs) {
      if (!existingIds.includes(d.id)) {
        await deleteDoc(doc(db, "chapters", d.id));
      }
    }
  } catch (e) {
    console.error("Error saving chapters to Firestore:", e);
  }
}

export function resetToDefaultStore() {
  resetDatabase();
}

async function resetDatabase() {
  try {
    const chapSnap = await getDocs(collection(db, "chapters"));
    for (const d of chapSnap.docs) {
      await deleteDoc(doc(db, "chapters", d.id));
    }
    const subSnap = await getDocs(collection(db, "subjects"));
    for (const d of subSnap.docs) {
      await deleteDoc(doc(db, "subjects", d.id));
    }
    window.location.reload();
  } catch (e) {
    console.error("Error resetting Firestore database:", e);
  }
}

// Generate the flat lightweight list of chapters for navigation, search, and footer displays
export function getChaptersList(chapters: Chapter[]) {
  return chapters.map((c) => ({
    id: c.id,
    number: c.number,
    title: c.title,
    classId: c.classId,
    subjectId: c.subjectId,
  }));
}

// Initial hydration from Firestore
export async function loadInitialDataFromFirestore() {
  try {
    const subSnap = await getDocs(collection(db, "subjects"));
    let subjectsList: Subject[] = [];
    subSnap.forEach((d) => {
      subjectsList.push(d.data() as Subject);
    });

    const chapSnap = await getDocs(collection(db, "chapters"));
    let chaptersList: Chapter[] = [];
    chapSnap.forEach((d) => {
      chaptersList.push(d.data() as Chapter);
    });

    // Seeding if Firestore is empty
    if (subjectsList.length === 0 || chaptersList.length === 0) {
      console.log("Firestore database is empty. Seeding defaults from local config...");
      
      const { SUBJECTS: defaultSubs, CHAPTERS: defaultChaps } = await import("./chapters");
      
      for (const sub of defaultSubs) {
        await setDoc(doc(db, "subjects", sub.id), sub);
      }
      for (const chap of defaultChaps) {
        await setDoc(doc(db, "chapters", chap.id), chap);
      }

      // Re-fetch seeded data
      const reSubSnap = await getDocs(collection(db, "subjects"));
      subjectsList = [];
      reSubSnap.forEach((d) => {
        subjectsList.push(d.data() as Subject);
      });

      const reChapSnap = await getDocs(collection(db, "chapters"));
      chaptersList = [];
      reChapSnap.forEach((d) => {
        chaptersList.push(d.data() as Chapter);
      });
    }

    // Sort subjects and chapters by default order
    const order = ["science", "maths", "sst", "english", "hindi"];
    subjectsList.sort((a, b) => order.indexOf(a.id as any) - order.indexOf(b.id as any));
    chaptersList.sort((a, b) => a.number - b.number);

    // Update global variables
    SUBJECTS.length = 0;
    SUBJECTS.push(...subjectsList);

    CHAPTERS.length = 0;
    CHAPTERS.push(...chaptersList);

    ALL_CHAPTER_LIST.length = 0;
    chaptersList.forEach((c) => {
      ALL_CHAPTER_LIST.push({
        id: c.id,
        number: c.number,
        title: c.title,
        classId: c.classId,
        subjectId: c.subjectId,
      });
    });

    console.log("Firestore successfully seeded and hydrated in-memory cache.", {
      subjects: SUBJECTS.length,
      chapters: CHAPTERS.length,
    });
  } catch (err) {
    console.error("Error during Firestore initialization:", err);
  }
}
