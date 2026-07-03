import React, { useState } from "react";
import { BookOpen, Search, Moon, Sun, Bookmark, Menu, X, Heart, Landmark, GraduationCap, Database, Lock } from "lucide-react";
import { ALL_CHAPTER_LIST, SUBJECTS } from "../data/chapters";

interface HeaderProps {
  currentRoute: string; // e.g. "home", "class-9", "class-10", "subject-science", etc.
  onNavigate: (route: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  bookmarks: string[]; // Bookmarked chapter IDs
  onNavigateToChapter: (chapterId: string, classId: string, subjectId: string) => void;
  creatorMode?: boolean;
  onToggleCreatorMode?: () => void;
  isAdmin?: boolean;
}

export default function Header({
  currentRoute,
  onNavigate,
  darkMode,
  toggleDarkMode,
  bookmarks,
  onNavigateToChapter,
  creatorMode = false,
  onToggleCreatorMode,
  isAdmin = false
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showBookmarksDropdown, setShowBookmarksDropdown] = useState(false);

  // Filter chapters based on search query
  const filteredChapters = ALL_CHAPTER_LIST.filter(chapter => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    const sub = SUBJECTS.find(s => s.id === chapter.subjectId)?.name || "";
    return (
      chapter.title.toLowerCase().includes(query) ||
      sub.toLowerCase().includes(query) ||
      chapter.classId.toLowerCase().replace("-", " ").includes(query)
    );
  });

  const handleSearchResultClick = (chap: typeof ALL_CHAPTER_LIST[0]) => {
    onNavigateToChapter(chap.id, chap.classId, chap.subjectId);
    setSearchQuery("");
    setShowSearchResults(false);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Home", route: "home" },
    { label: "Class 10", route: "class-10" },
    { label: "Class 9", route: "class-9" },
    { label: "PYQs", route: "pyqs" },
    { label: "MCQs", route: "mcqs" },
    { label: "About", route: "about" },
    { label: "Contact", route: "contact" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-850 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-500/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white block">
                Lucky <span className="text-blue-600 dark:text-blue-400 font-extrabold">Bhaiya</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono -mt-1 block flex items-center gap-0.5">
                <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500 animate-pulse" /> Support Poor Students
              </span>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Real-time Search Box */}
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search chapters, subjects..."
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {/* Search dropdown suggestions */}
              {showSearchResults && searchQuery && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Search Results ({filteredChapters.length})</span>
                    <button onClick={() => setShowSearchResults(false)} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  {filteredChapters.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No chapters found for "{searchQuery}"</div>
                  ) : (
                    filteredChapters.map((chap) => (
                      <div
                        key={chap.id}
                        onClick={() => handleSearchResultClick(chap)}
                        className="p-3 border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex justify-between items-center group transition-colors"
                      >
                        <div>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {chap.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono capitalize">
                            {chap.classId.replace("-", " ")} • {chap.subjectId}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Bookmarks Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBookmarksDropdown(!showBookmarksDropdown)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl relative transition-all cursor-pointer"
                title="Bookmarked chapters"
              >
                <Bookmark className="w-5 h-5" />
                {bookmarks.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                    {bookmarks.length}
                  </span>
                )}
              </button>

              {/* Bookmarks list dropdown */}
              {showBookmarksDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Your Bookmarks ({bookmarks.length})</span>
                    <button onClick={() => setShowBookmarksDropdown(false)} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  {bookmarks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No bookmarks saved yet. Click the bookmark icon on chapter pages!</div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      {bookmarks.map((bId) => {
                        const chapter = ALL_CHAPTER_LIST.find((c) => c.id === bId);
                        if (!chapter) return null;
                        return (
                          <div
                            key={bId}
                            onClick={() => {
                              onNavigateToChapter(chapter.id, chapter.classId, chapter.subjectId);
                              setShowBookmarksDropdown(false);
                            }}
                            className="p-3 border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex flex-col group transition-colors"
                          >
                            <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {chapter.title}
                            </span>
                            <span className="text-[10px] text-slate-500 capitalize">
                              {chapter.classId.replace("-", " ")} • {chapter.subjectId}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Creator Mode / Resource Manager Toggle */}
            {isAdmin ? (
              <button
                onClick={onToggleCreatorMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  creatorMode
                    ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="Toggle Resource Creator Mode"
              >
                <Database className={`w-4 h-4 ${creatorMode ? "text-red-500 animate-pulse" : ""}`} />
                <span className="hidden sm:inline">Creator Mode</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("admin")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
                title="Admin Portal"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Admin Portal</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>

          {/* Mobile hamburger menu & dark mode & creator mode */}
          <div className="flex lg:hidden items-center gap-2">
            {isAdmin ? (
              <button
                onClick={onToggleCreatorMode}
                className={`p-2 rounded-xl transition-all border ${
                  creatorMode
                    ? "bg-red-500/10 border-red-500/30 text-red-600"
                    : "bg-gray-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-gray-500"
                }`}
                title="Toggle Resource Creator Mode"
              >
                <Database className={`w-4 h-4 ${creatorMode ? "text-red-500 animate-pulse" : ""}`} />
              </button>
            ) : (
              <button
                onClick={() => onNavigate("admin")}
                className="p-2 rounded-xl transition-all border bg-gray-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-gray-500"
                title="Admin Portal"
              >
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-6 space-y-4 shadow-lg">
          {/* Mobile Search */}
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters, subjects..."
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 focus:outline-none"
            />
            {searchQuery && (
              <div className="absolute w-full mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto">
                {filteredChapters.map((chap) => (
                  <div
                    key={chap.id}
                    onClick={() => handleSearchResultClick(chap)}
                    className="p-3 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    {chap.title} ({chap.classId.replace("-", " ")})
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => {
                    onNavigate(item.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-center text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-900">
            <button
              onClick={() => {
                onNavigate("admin");
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAdmin ? "Admin Suite" : "Admin Login"}</span>
            </button>
          </div>

          {/* Mobile Bookmarks summary link */}
          {bookmarks.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
              <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1 mb-2">
                <Bookmark className="w-4 h-4 fill-red-500 text-red-500" /> Bookmarks Saved ({bookmarks.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {bookmarks.map((bId) => {
                  const chapter = ALL_CHAPTER_LIST.find((c) => c.id === bId);
                  if (!chapter) return null;
                  return (
                    <button
                      key={bId}
                      onClick={() => {
                        onNavigateToChapter(chapter.id, chapter.classId, chapter.subjectId);
                        setMobileMenuOpen(false);
                      }}
                      className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                    >
                      {chapter.title.split(":")[0] || chapter.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-center">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 block mb-1">Support Lucky Bhaiya's Mission</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                // Scroll to support widget
                const widget = document.getElementById("support-poor-widget");
                if (widget) {
                  widget.scrollIntoView({ behavior: "smooth" });
                } else {
                  onNavigate("home");
                  setTimeout(() => {
                    document.getElementById("support-poor-widget")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
              className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
            >
              Watch Ad to Support 💖
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
