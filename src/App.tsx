import React, { useState, useEffect } from "react";
import { ArrowUp, Star, Award, Heart, CheckCircle2, Loader2, Lock, Key, Eye, EyeOff, Database, ShieldAlert } from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import ClassPage from "./components/ClassPage";
import ChapterPage from "./components/ChapterPage";
import AdminPortal from "./components/AdminPortal";
import { AboutView, ContactView, PYQsView, MCQsView } from "./components/SecondaryViews";
import { loadInitialDataFromFirestore } from "./data/chaptersStore";
import { getOrCreateUserId, loadUserPrefs, saveUserPrefs, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

interface RouteState {
  name: "home" | "class-9" | "class-10" | "chapter" | "about" | "contact" | "pyqs" | "mcqs" | "admin";
  classId?: "class-9" | "class-10";
  subjectId?: "maths" | "science" | "english" | "sst" | "hindi";
  chapterId?: string;
}

const getRouteFromHash = (): RouteState => {
  const hash = window.location.hash; // e.g. #/class-10/science/chemical-reactions
  if (!hash || hash === "#" || hash === "#/") return { name: "home" };

  // Strip leading '#' to parse route parts correctly
  const cleanHash = hash.startsWith("#") ? hash.substring(1) : hash;
  const parts = cleanHash.split("/").filter(Boolean); // e.g. ["class-10", "science", "chemical-reactions"]

  if (parts[0] === "class-9" || parts[0] === "class-10") {
    if (parts.length === 1) {
      return { name: parts[0] as "class-9" | "class-10", classId: parts[0] as "class-9" | "class-10" };
    }
    if (parts.length === 3) {
      return {
        name: "chapter",
        classId: parts[0] as "class-9" | "class-10",
        subjectId: parts[1] as any,
        chapterId: parts[2]
      };
    }
  }

  if (["about", "contact", "pyqs", "mcqs", "admin"].includes(parts[0])) {
    return { name: parts[0] as any };
  }

  return { name: "home" };
};

export default function App() {
  const [route, setRoute] = useState<RouteState>({ name: "home" });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("lucky_dark_mode");
    return saved === "true";
  });
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [creatorMode, setCreatorMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("lucky_admin_fallback_logged_in") === "true";
  });

  // Track Firebase Auth and Fallback local storage for admin status
  useEffect(() => {
    const checkAdmin = () => {
      const isFallback = localStorage.getItem("lucky_admin_fallback_logged_in") === "true";
      const user = auth.currentUser;
      if ((user && user.email === "luckyzone.240808@gmail.com") || isFallback) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        // Turn off creatorMode immediately if we're not admin anymore
        setCreatorMode(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, checkAdmin);
    window.addEventListener("storage", checkAdmin);
    const interval = setInterval(checkAdmin, 1000);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", checkAdmin);
      clearInterval(interval);
    };
  }, []);

  // Synchronize initial data from Firestore and load user preferences
  useEffect(() => {
    async function initApp() {
      try {
        // 1. Initial hydration from Firestore
        await loadInitialDataFromFirestore();
        
        // 2. Fetch or create unique client-side userId
        const uid = getOrCreateUserId();
        
        // 3. Load user preferences (bookmarks, creatorMode, completed chapters)
        const prefs = await loadUserPrefs(uid);
        if (prefs) {
          setBookmarks(prefs.bookmarks || []);
          setCreatorMode(prefs.creatorMode || false);
        }
      } catch (err) {
        console.error("Failed to initialize application data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initApp();
  }, []);

  // Sync state with hash updates
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    // Trigger initially
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Sync dark mode class with root HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("lucky_dark_mode", String(darkMode));
  }, [darkMode]);

  // Back to Top button scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = (itemRoute: string) => {
    if (itemRoute === "home") {
      window.location.hash = "/";
    } else {
      window.location.hash = `/${itemRoute}`;
    }
  };

  const navigateToChapter = (chapterId: string, classId: string, subjectId: string) => {
    window.location.hash = `/${classId}/${subjectId}/${chapterId}`;
  };

  const toggleBookmark = async (chapterId: string) => {
    let nextBookmarks = [...bookmarks];
    if (nextBookmarks.includes(chapterId)) {
      nextBookmarks = nextBookmarks.filter((id) => id !== chapterId);
    } else {
      nextBookmarks.push(chapterId);
    }
    setBookmarks(nextBookmarks);
    const uid = getOrCreateUserId();
    await saveUserPrefs(uid, { bookmarks: nextBookmarks });
  };

  const [showCreatorPasswordModal, setShowCreatorPasswordModal] = useState(false);
  const [creatorPasswordInput, setCreatorPasswordInput] = useState("");
  const [showCreatorPassword, setShowCreatorPassword] = useState(false);
  const [creatorPasswordError, setCreatorPasswordError] = useState<string | null>(null);

  const toggleCreatorMode = async () => {
    if (creatorMode) {
      setCreatorMode(false);
      const uid = getOrCreateUserId();
      await saveUserPrefs(uid, { creatorMode: false });
    } else {
      setCreatorPasswordInput("");
      setCreatorPasswordError(null);
      setShowCreatorPasswordModal(true);
    }
  };

  const handleVerifyCreatorPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatorPasswordInput === "Princebhaiya") {
      setCreatorMode(true);
      const uid = getOrCreateUserId();
      await saveUserPrefs(uid, { creatorMode: true });
      setShowCreatorPasswordModal(false);
      setCreatorPasswordInput("");
      setCreatorPasswordError(null);
    } else {
      setCreatorPasswordError("Incorrect creator mode password. Please try again.");
    }
  };

  const handleDataChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeRouteLabel = route.name;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-4 max-w-md animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 animate-pulse">
            <span className="text-white font-extrabold text-xl">LB</span>
          </div>
          <h1 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Lucky Bhaiya Board Prep</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Synchronizing curriculum and notes with Firestore...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200 font-sans">
      {/* Sticky Header Navigation */}
      <Header
        currentRoute={activeRouteLabel}
        onNavigate={navigate}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        bookmarks={bookmarks}
        onNavigateToChapter={navigateToChapter}
        creatorMode={creatorMode}
        onToggleCreatorMode={toggleCreatorMode}
        isAdmin={isAdmin}
      />

      {/* Main Content Layout Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render current view based on active route */}
        {route.name === "home" && (
          <HomeView
            onNavigate={navigate}
            onNavigateToChapter={navigateToChapter}
            creatorMode={creatorMode}
            onDataChange={handleDataChange}
          />
        )}

        {(route.name === "class-9" || route.name === "class-10") && (
          <ClassPage
            classId={route.classId!}
            onNavigateToChapter={navigateToChapter}
            onBack={() => navigate("home")}
            creatorMode={creatorMode}
            onDataChange={handleDataChange}
          />
        )}

        {route.name === "chapter" && (
          <ChapterPage
            chapterId={route.chapterId!}
            classId={route.classId!}
            subjectId={route.subjectId!}
            onBackToClass={() => navigate(route.classId!)}
            onNavigateToChapter={navigateToChapter}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            creatorMode={creatorMode}
            onDataChange={handleDataChange}
          />
        )}

        {route.name === "about" && <AboutView />}

        {route.name === "contact" && <ContactView />}

        {route.name === "pyqs" && (
          <PYQsView
            onNavigateToChapter={navigateToChapter}
          />
        )}

        {route.name === "mcqs" && (
          <MCQsView
            onNavigateToChapter={navigateToChapter}
          />
        )}

        {route.name === "admin" && (
          <AdminPortal
            onNavigate={navigate}
            creatorMode={creatorMode}
            onToggleCreatorMode={toggleCreatorMode}
          />
        )}

      </main>

      {/* Footer Block */}
      <Footer onNavigate={navigate} />

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all z-40 cursor-pointer print:hidden"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Creator Mode Security Passcode Modal */}
      {showCreatorPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="creator-mode-modal">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Unlock Creator Privileges
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Author passcode required to toggle editor
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyCreatorPassword} className="space-y-4">
              {creatorPasswordError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                  {creatorPasswordError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                  Creator Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showCreatorPassword ? "text" : "password"}
                    required
                    autoFocus
                    placeholder="Enter creator passcode"
                    value={creatorPasswordInput}
                    onChange={(e) => setCreatorPasswordInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatorPassword(!showCreatorPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showCreatorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatorPasswordModal(false)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md hover:shadow-red-500/10 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Confirm Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
