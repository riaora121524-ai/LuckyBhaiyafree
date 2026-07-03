import React, { useState } from "react";
import { BookOpen, Search, ArrowRight, CheckCircle, FileText, HelpCircle, Award, Compass, Laptop, Star, Heart, Flame, RefreshCw, Trash2, Plus, Upload, X } from "lucide-react";
import { ALL_CHAPTER_LIST, CHAPTERS, SUBJECTS, syncDataFromStorage } from "../data/chapters";
import { getStoredSubjects, saveStoredSubjects, getStoredChapters, saveStoredChapters } from "../data/chaptersStore";
import SupportPoorWidget from "./SupportPoorWidget";

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onNavigateToChapter: (chapterId: string, classId: string, subjectId: string) => void;
  creatorMode?: boolean;
  onDataChange?: () => void;
}

export default function HomeView({
  onNavigate,
  onNavigateToChapter,
  creatorMode = false,
  onDataChange
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Subject Creator Form State
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubId, setNewSubId] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");
  const [newSubColor, setNewSubColor] = useState("from-blue-500 to-indigo-600");
  const [newSubIcon, setNewSubIcon] = useState("BookOpen");

  const deleteSubject = (subjectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Are you sure you want to delete the subject "${subjectId}"? This will delete all NCERT notes, MCQs, and PYQs in this subject!`
    );
    if (!confirmed) return;

    const currentSubs = getStoredSubjects();
    const nextSubs = currentSubs.filter(s => s.id !== subjectId);
    saveStoredSubjects(nextSubs);

    const currentChaps = getStoredChapters();
    const nextChaps = currentChaps.filter(c => c.subjectId !== subjectId);
    saveStoredChapters(nextChaps);

    syncDataFromStorage();
    if (onDataChange) onDataChange();
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubId || !newSubName) {
      alert("Please fill in Subject ID and Name!");
      return;
    }

    const currentSubs = getStoredSubjects();
    if (currentSubs.some(s => s.id.toLowerCase() === newSubId.toLowerCase())) {
      alert("A subject with this ID already exists!");
      return;
    }

    const newSubject = {
      id: newSubId.toLowerCase().replace(/\s+/g, "-"),
      name: newSubName,
      description: newSubDesc || `${newSubName} NCERT chapter summaries and board prep solutions.`,
      icon: newSubIcon,
      color: newSubColor
    };

    saveStoredSubjects([...currentSubs, newSubject]);
    syncDataFromStorage();
    setShowAddSubjectModal(false);
    
    // Reset Form
    setNewSubId("");
    setNewSubName("");
    setNewSubDesc("");
    setNewSubColor("from-blue-500 to-indigo-600");
    setNewSubIcon("BookOpen");

    if (onDataChange) onDataChange();
  };

  const handleUploadSubjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.id && parsed.name) {
          const currentSubs = getStoredSubjects();
          if (currentSubs.some(s => s.id.toLowerCase() === parsed.id.toLowerCase())) {
            alert(`A subject with ID "${parsed.id}" already exists.`);
            return;
          }
          const subToSave = {
            id: parsed.id,
            name: parsed.name,
            description: parsed.description || "",
            icon: parsed.icon || "BookOpen",
            color: parsed.color || "from-blue-500 to-indigo-600"
          };
          saveStoredSubjects([...currentSubs, subToSave]);
          syncDataFromStorage();
          if (onDataChange) onDataChange();
          alert("Subject uploaded and imported successfully!");
        } else {
          alert("Invalid file format. Must be a JSON object containing 'id' and 'name' fields.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const deleteChapter = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this chapter and all of its notes/questions?");
    if (!confirmed) return;

    const currentChaps = getStoredChapters();
    const nextChaps = currentChaps.filter(c => c.id !== chapterId);
    saveStoredChapters(nextChaps);

    syncDataFromStorage();
    if (onDataChange) onDataChange();
  };

  // Search filtered results
  const searchResults = ALL_CHAPTER_LIST.filter(chap => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    const subjectName = SUBJECTS.find(s => s.id === chap.subjectId)?.name || "";
    return (
      chap.title.toLowerCase().includes(query) ||
      subjectName.toLowerCase().includes(query) ||
      chap.classId.replace("-", " ").includes(query)
    );
  });

  const popularChapters = CHAPTERS.filter(c => 
    ["chemical-reactions", "real-numbers", "matter-surroundings", "nationalism-india"].includes(c.id)
  );

  const latestUpdates = [
    { id: "chemical-reactions", title: "Chemical Reactions and Equations", classId: "class-10", subjectId: "science", updateType: "Notes & Quiz Updated", isNew: true },
    { id: "real-numbers", title: "Real Numbers", classId: "class-10", subjectId: "maths", updateType: "MCQs Solved", isNew: true },
    { id: "matter-surroundings", title: "Matter in Our Surroundings", classId: "class-9", subjectId: "science", updateType: "Notes & PYQs Added", isNew: true },
    { id: "nationalism-india", title: "Nationalism in India", classId: "class-10", subjectId: "sst", updateType: "Mindmap Added", isNew: false }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 md:py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>100% Free NCERT Study Material</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                NCERT Notes, <span className="text-blue-600 dark:text-blue-400 font-extrabold">Important Questions</span>, PYQs & MCQs
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
                Crack Class 9 & Class 10 CBSE Board Exams with high-yield chapter-wise revisions, concept mind maps, and interactive quizzes. Ad-supported, 100% original.
              </p>

              {/* Large Hero Search Bar */}
              <div className="relative max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="What are you studying today? e.g., Chemical Reactions"
                  className="w-full bg-white dark:bg-slate-900 text-slate-950 dark:text-white text-sm pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg shadow-blue-500/5 transition-all"
                />
                
                {/* Hero Search Results Dropdown */}
                {showResults && searchQuery && (
                  <div className="absolute left-0 mt-2 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-30 overflow-hidden max-h-60 overflow-y-auto">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500 uppercase">Search Results</span>
                      <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
                    </div>
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No chapters found. Try "Science" or "Maths"</div>
                    ) : (
                      searchResults.map((chap) => (
                        <div
                          key={chap.id}
                          onClick={() => onNavigateToChapter(chap.id, chap.classId, chap.subjectId)}
                          className="p-3 border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white block">{chap.title}</span>
                            <span className="text-[10px] text-slate-500 capitalize">{chap.classId.replace("-", " ")} • {chap.subjectId}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => onNavigate("class-10")}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Explore Class 10
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate("class-9")}
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold py-3.5 px-6 rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer text-center"
                >
                  Explore Class 9
                </button>
              </div>
            </div>

            {/* Right Educational Graphic Section */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
                {/* Decorative Glowing Rings */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-20 dark:opacity-30 animate-pulse" />
                
                {/* CSS flat educational illustration */}
                <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center w-72 h-72 sm:w-80 sm:h-80 transition-all">
                  
                  {/* Floating Elements */}
                  <div className="absolute top-6 left-6 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 p-2.5 rounded-2xl shadow-md rotate-12 animate-bounce">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="absolute bottom-10 right-4 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-2xl shadow-md -rotate-12">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div className="absolute top-10 right-8 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 p-2 rounded-full shadow-md animate-pulse">
                    <Star className="w-4 h-4 fill-current" />
                  </div>

                  {/* Core Stacked Books representation */}
                  <div className="space-y-2 mt-4 w-full px-4">
                    {/* Book 1 (Top, open) */}
                    <div className="bg-gradient-to-r from-primary-500 to-indigo-600 h-10 rounded-lg shadow-md flex items-center px-4 justify-between border-b-2 border-indigo-700">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">NCERT notes</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      </div>
                    </div>
                    {/* Book 2 */}
                    <div className="bg-emerald-500 h-8 rounded-lg shadow-md flex items-center px-4 justify-between border-b-2 border-emerald-700 translate-x-2">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Class 10 CBSE</span>
                      <div className="w-3 h-1 bg-white/30 rounded" />
                    </div>
                    {/* Book 3 */}
                    <div className="bg-amber-500 h-8 rounded-lg shadow-md flex items-center px-4 justify-between border-b-2 border-amber-700 -translate-x-2">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">PYQs & Solved Papers</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>

                  {/* Open Notebook page mock */}
                  <div className="bg-amber-50 dark:bg-gray-850 p-3 rounded-lg border-2 border-dashed border-amber-200 dark:border-gray-800 w-full mt-6 space-y-1 text-left">
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded w-4/5" />
                  </div>
                  
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium font-mono mt-4">✓ NCERT aligned 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AD SUPPORT INTEGRATIVE WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SupportPoorWidget />
      </section>

      {/* 3. CLASS CARDS SECTION */}
      <section id="class-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
            Select Your Standard / Class
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Choose either Class 10 or Class 9 to view standard-wise syllabus structures, chapter notes, and quiz panels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Class 10 Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 p-4 rounded-2xl font-bold text-lg font-display">
                  C-10
                </div>
                <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" /> Board Exam Prep
                </span>
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">Class 10 CBSE Resources</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                Access highly curated chapter-wise materials aligned with the latest CBSE board curriculum. Designed to secure perfect 100/100 marks.
              </p>
              
              {/* Feature Grid inside card */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { label: "NCERT Notes", value: "6 Subjects" },
                  { label: "Important Questions", value: "250+ Solved" },
                  { label: "Past Year Papers", value: "10 Years" },
                  { label: "Practice Quizzes", value: "50+ MCQs" }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-bold">{item.label}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate("class-10")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Explore Class 10 Resources
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Class 9 Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl font-bold text-lg font-display">
                  C-9
                </div>
                <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
                  Foundation Core
                </span>
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">Class 9 Foundation</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                Build a solid concept foundation for Class 10 boards. Master complicated Science and Mathematics theories easily with simple notes.
              </p>

              {/* Feature Grid inside card */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { label: "Concept Notes", value: "5 Subjects" },
                  { label: "Important Questions", value: "180+ Solved" },
                  { label: "Class Tests", value: "Mock Papers" },
                  { label: "Interactive MCQs", value: "30+ Quizzes" }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-bold">{item.label}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate("class-9")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Explore Class 9 Resources
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SUBJECTS DIRECTORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="text-left">
            <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
              Syllabus Subjects Overview
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Browse chapters, formula sheets, and solved papers by individual subjects.
            </p>
          </div>
          
          {creatorMode && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddSubjectModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Subject
              </button>
              
              <label className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors">
                <Upload className="w-4 h-4" /> Upload Subject JSON
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleUploadSubjectFile}
                />
              </label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
          {SUBJECTS.map((sub) => (
            <div
              key={sub.id}
              onClick={() => onNavigate("class-10")} // Defaults to Class 10's subject page view
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
            >
              {creatorMode && (
                <button
                  onClick={(e) => deleteSubject(sub.id, e)}
                  className="absolute top-3 right-3 p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 rounded-lg transition-colors z-10 cursor-pointer"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${sub.color} text-white flex items-center justify-center mb-4`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {sub.name}
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {sub.description}
              </p>
            </div>
          ))}

          {creatorMode && (
            <div
              onClick={() => setShowAddSubjectModal(true)}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-blue-50/10 transition-all min-h-[180px]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Add New Subject</span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Click to create manually</span>
            </div>
          )}
        </div>
      </section>

      {/* 4. POPULAR CHAPTERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
              Popular Chapters for Revision
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">High-traffic chapters with comprehensive mind maps and full practice question sets.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate("class-10")}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Class 10 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {popularChapters.map((chap) => {
            const subject = SUBJECTS.find(s => s.id === chap.subjectId);
            return (
              <div
                key={chap.id}
                onClick={() => onNavigateToChapter(chap.id, chap.classId, chap.subjectId)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative"
              >
                {creatorMode && (
                  <button
                    onClick={(e) => deleteChapter(chap.id, e)}
                    className="absolute top-3 right-3 p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 rounded-lg transition-colors z-10 cursor-pointer"
                    title="Delete Chapter"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${subject?.color || 'from-blue-500 to-indigo-600'} text-white flex items-center justify-center mb-4`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">
                  {chap.classId.replace("-", " ")} • {subject?.name}
                </span>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {chap.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                  {chap.summary}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
                  <span>Start Reading</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. LATEST UPDATES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-lg">
              Live Updates
            </span>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Recently Updated Chapters
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-left">
            {latestUpdates.map((update, idx) => (
              <div
                key={idx}
                onClick={() => onNavigateToChapter(update.id, update.classId, update.subjectId)}
                className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 flex items-center justify-between hover:border-blue-500/30 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {update.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {update.classId.replace("-", " ")} • {update.subjectId.toUpperCase()} • {update.updateType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {update.isNew && (
                    <span className="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      New
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE US SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 to-blue-950 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block">Trusted Study Companion</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight leading-tight">
                Why Students Trust Lucky Bhaiya Notes
              </h2>
              <p className="text-indigo-200 text-sm leading-relaxed">
                We design learning material focused purely on CBSE examination structures, making revision effortless and mobile-friendly.
              </p>
              <div className="flex gap-4 pt-4 border-t border-indigo-900/60">
                <div>
                  <span className="text-2xl font-bold text-amber-400 block font-mono">100%</span>
                  <span className="text-xs text-indigo-200">NCERT Syllabus Aligned</span>
                </div>
                <div className="w-px bg-indigo-900/60 self-stretch" />
                <div>
                  <span className="text-2xl font-bold text-emerald-400 block font-mono">Free</span>
                  <span className="text-xs text-indigo-200">Study Resources Forever</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Syllabus Aligned", desc: "Every word matches official NCERT Class 9 and 10 textbook guidelines." },
                { title: "Handy Mind Maps", desc: "Quick visual summaries to memorize full chemical groups and formulae." },
                { title: "CBSE Solved PYQs", desc: "Real previous years questions broken down step-wise as awarded by board markers." },
                { title: "Interactive MCQs", desc: "Live-scoring practice tests that provide active recall explanations instantly." },
                { title: "Easy Mobile Layout", desc: "Optimized sizing and spacing so you can read notes comfortably on small phone screens." },
                { title: "Social Impact Included", desc: "Watch high-yield trivia ads to fund direct academic materials for local poor students." }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm text-white font-display">{item.title}</h3>
                    <p className="text-xs text-indigo-100/70 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUBJECT CREATOR MODAL */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddSubjectModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Create Custom Subject
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Add a completely new syllabus subject to the Lucky Bhaiya portal.
              </p>
            </div>

            <form onSubmit={handleAddSubjectSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={newSubName}
                  onChange={(e) => {
                    setNewSubName(e.target.value);
                    if (!newSubId) {
                      setNewSubId(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }
                  }}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject ID / Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. computer-science"
                  value={newSubId}
                  onChange={(e) => setNewSubId(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize what this subject covers..."
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Color Theme</label>
                  <select
                    value={newSubColor}
                    onChange={(e) => setNewSubColor(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none font-bold"
                  >
                    <option value="from-blue-500 to-indigo-600">Blue Gradient</option>
                    <option value="from-emerald-500 to-teal-600">Green Gradient</option>
                    <option value="from-amber-500 to-orange-600">Orange Gradient</option>
                    <option value="from-purple-500 to-pink-600">Purple Gradient</option>
                    <option value="from-rose-500 to-red-600">Rose Gradient</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Primary Icon</label>
                  <select
                    value={newSubIcon}
                    onChange={(e) => setNewSubIcon(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none font-bold"
                  >
                    <option value="BookOpen">Book Icon</option>
                    <option value="Calculator">Calculator Icon</option>
                    <option value="Compass">Compass Icon</option>
                    <option value="Laptop">Computer Icon</option>
                    <option value="Star">Star Icon</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
