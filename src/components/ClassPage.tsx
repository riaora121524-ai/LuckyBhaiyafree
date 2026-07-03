import React, { useState, useEffect } from "react";
import { Beaker, Calculator, Globe, BookOpen, Languages, CheckCircle2, ArrowLeft, ArrowRight, Award, Circle, Sparkles, CheckSquare, ListPlus, Trash2, Plus, Upload, X } from "lucide-react";
import { SUBJECTS, ALL_CHAPTER_LIST, Subject, syncDataFromStorage } from "../data/chapters";
import { getStoredChapters, saveStoredChapters } from "../data/chaptersStore";
import RichTextEditor from "./RichTextEditor";
import { getOrCreateUserId, loadUserPrefs, saveUserPrefs } from "../firebase";

interface ClassPageProps {
  classId: "class-9" | "class-10";
  onNavigateToChapter: (chapterId: string, classId: string, subjectId: string) => void;
  onBack: () => void;
  creatorMode?: boolean;
  onDataChange?: () => void;
}

export default function ClassPage({
  classId,
  onNavigateToChapter,
  onBack,
  creatorMode = false,
  onDataChange
}: ClassPageProps) {
  const [activeSubject, setActiveSubject] = useState<"maths" | "science" | "english" | "sst" | "hindi">("science");
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);

  // Chapter Creator Modal Form State
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [newChapId, setNewChapId] = useState("");
  const [newChapNumber, setNewChapNumber] = useState<number>(1);
  const [newChapTitle, setNewChapTitle] = useState("");
  const [newChapSummary, setNewChapSummary] = useState("");
  const [newChapNotes, setNewChapNotes] = useState("");

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

  const handleAddChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapId || !newChapTitle) {
      alert("Please fill in Chapter ID and Title!");
      return;
    }

    const currentChaps = getStoredChapters();
    if (currentChaps.some(c => c.id.toLowerCase() === newChapId.toLowerCase())) {
      alert("A chapter with this ID already exists!");
      return;
    }

    const newChapter = {
      id: newChapId.toLowerCase().replace(/\s+/g, "-"),
      classId: classId,
      subjectId: activeSubject,
      number: Number(newChapNumber) || 1,
      title: newChapTitle,
      summary: newChapSummary || `Summary of core concepts for ${newChapTitle}.`,
      notes: newChapNotes || `<h3>Notes for ${newChapTitle}</h3><p>Detailed reading content coming soon!</p>`,
      mindMap: ["Core Introduction", "Major Subtopics", "Revision Summary"],
      importantQuestions: [],
      pyqs: [],
      mcqs: [],
      faqs: []
    };

    saveStoredChapters([...currentChaps, newChapter]);
    syncDataFromStorage();
    setShowAddChapterModal(false);

    // Reset Form
    setNewChapId("");
    setNewChapNumber(currentSubjectChapters.length + 2);
    setNewChapTitle("");
    setNewChapSummary("");
    setNewChapNotes("");

    if (onDataChange) onDataChange();
  };

  const handleUploadChapterFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.id && parsed.title) {
          const currentChaps = getStoredChapters();
          if (currentChaps.some(c => c.id.toLowerCase() === parsed.id.toLowerCase())) {
            alert(`A chapter with ID "${parsed.id}" already exists.`);
            return;
          }
          const chapToSave = {
            id: parsed.id,
            classId: classId,
            subjectId: activeSubject,
            number: parsed.number || 1,
            title: parsed.title,
            summary: parsed.summary || "",
            notes: parsed.notes || "",
            mindMap: parsed.mindMap || [],
            importantQuestions: parsed.importantQuestions || [],
            pyqs: parsed.pyqs || [],
            mcqs: parsed.mcqs || [],
            faqs: parsed.faqs || []
          };
          saveStoredChapters([...currentChaps, chapToSave]);
          syncDataFromStorage();
          if (onDataChange) onDataChange();
          alert("Chapter uploaded and imported successfully!");
        } else {
          alert("Invalid file format. Must be a JSON object containing 'id' and 'title' fields.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const label = classId === "class-10" ? "Class 10 CBSE" : "Class 9 Foundation";

  // Load completed chapters for progress tracking from Firestore
  useEffect(() => {
    async function fetchCompleted() {
      const uid = getOrCreateUserId();
      const prefs = await loadUserPrefs(uid);
      if (prefs) {
        if (classId === "class-9") {
          setCompletedChapters(prefs.completedChapters_class9 || []);
        } else {
          setCompletedChapters(prefs.completedChapters_class10 || []);
        }
      }
    }
    fetchCompleted();
  }, [classId]);

  const toggleChapterCompletion = async (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering navigation
    let newCompleted = [...completedChapters];
    if (newCompleted.includes(chapterId)) {
      newCompleted = newCompleted.filter((id) => id !== chapterId);
    } else {
      newCompleted.push(chapterId);
    }
    setCompletedChapters(newCompleted);

    const uid = getOrCreateUserId();
    if (classId === "class-9") {
      await saveUserPrefs(uid, { completedChapters_class9: newCompleted });
    } else {
      await saveUserPrefs(uid, { completedChapters_class10: newCompleted });
    }
  };

  // Filter chapters belonging to this class and active subject
  const currentSubjectChapters = ALL_CHAPTER_LIST.filter(
    (c) => c.classId === classId && c.subjectId === activeSubject
  );

  // Total chapters in this class
  const allClassChapters = ALL_CHAPTER_LIST.filter((c) => c.classId === classId);
  const totalChaptersCount = allClassChapters.length;
  const completedTotalCount = allClassChapters.filter((c) => completedChapters.includes(c.id)).length;
  const progressPercent = totalChaptersCount > 0 ? Math.round((completedTotalCount / totalChaptersCount) * 100) : 0;

  // Render proper subject icons dynamically
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Beaker": return <Beaker className="w-5 h-5" />;
      case "Calculator": return <Calculator className="w-5 h-5" />;
      case "Globe": return <Globe className="w-5 h-5" />;
      case "BookOpen": return <BookOpen className="w-5 h-5" />;
      case "Languages": return <Languages className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 text-left">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
            {label} Learning Portal
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Access chapter notes, board questions, and solve quick mock exams for 2026.
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-72 text-left">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" /> Syllabus Progress
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {completedTotalCount}/{totalChaptersCount} Chapters
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-1">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block font-semibold">
            {progressPercent === 100 ? "🎉 Outstanding! 100% Prepared!" : `${progressPercent}% Syllabus Completed`}
          </span>
        </div>
      </div>

      {/* Subject Selector Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 gap-2">
        {SUBJECTS.map((subject) => {
          const isActive = activeSubject === subject.id;
          const classChaptersCount = ALL_CHAPTER_LIST.filter(
            (c) => c.classId === classId && c.subjectId === subject.id
          ).length;

          return (
            <button
              key={subject.id}
              onClick={() => setActiveSubject(subject.id)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all shadow-sm shrink-0 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/10"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              {getSubjectIcon(subject.icon)}
              <span>{subject.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                {classChaptersCount} chapters
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Subject Overview */}
      {(() => {
        const selectedSubject = SUBJECTS.find((s) => s.id === activeSubject);
        return (
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/30 dark:to-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 font-mono tracking-widest block mb-1">
                Active Focus Area
              </span>
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                {selectedSubject?.name} Notes & Revision Guide
              </h2>
              <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed font-medium">
                {selectedSubject?.description} Double-check standard formula lists and practice writing out answers to score perfectly in final CBSE exams.
              </p>
            </div>
            
            {creatorMode && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setNewChapNumber(currentSubjectChapters.length + 1);
                    setShowAddChapterModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Chapter
                </button>
                <label className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors">
                  <Upload className="w-4 h-4" /> Upload Chapter JSON
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleUploadChapterFile}
                  />
                </label>
              </div>
            )}
          </div>
        );
      })()}

      {/* Chapter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {currentSubjectChapters.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Chapters are being updated daily. Stay tuned!</span>
          </div>
        ) : (
          currentSubjectChapters.map((chap) => {
            const isCompleted = completedChapters.includes(chap.id);
            const hasFullContent = ["chemical-reactions", "real-numbers", "matter-surroundings", "nationalism-india"].includes(chap.id);

            return (
              <div
                key={chap.id}
                onClick={() => onNavigateToChapter(chap.id, chap.classId, chap.subjectId)}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group relative ${
                  isCompleted ? "border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5" : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Completion & Deletion Actions */}
                <div className="absolute top-6 right-6 flex items-center gap-1.5 z-10">
                  {creatorMode && (
                    <button
                      onClick={(e) => deleteChapter(chap.id, e)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => toggleChapterCompletion(chap.id, e)}
                    className="p-1 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    title={isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5.5 h-5.5 text-slate-300 dark:text-slate-700" />
                    )}
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      Ch-{chap.number}
                    </span>
                    {hasFullContent && (
                      <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                        Full Content
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {chap.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium">
                    Study summaries, board questions, previous papers with solved answers, and take self-marking MCQs.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded font-bold">
                      Notes
                    </span>
                    <span className="text-[10px] bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded font-bold">
                      PYQs & MCQs
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
                    Start Learning <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Helpful advice */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/10 dark:to-amber-900/5 border border-amber-200/40 dark:border-amber-900/30 rounded-2xl p-6 text-left flex gap-4 items-start">
        <Sparkles className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300 font-display">Lucky Bhaiya's Exam Success Trick</h4>
          <p className="text-xs text-amber-800/80 dark:text-amber-400 leading-relaxed">
            Completing 100% of the syllabus checklist boosts your board exam confidence. Try to complete at least 2 chapters every week. Read the summarized core theory, hide the answer panel for Important Questions to test yourself, and scoring above 80% on the MCQ quiz module will secure an easy A+!
          </p>
        </div>
      </div>

      {/* CHAPTER CREATOR FORM MODAL */}
      {showAddChapterModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddChapterModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Create Custom Chapter
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Add a new chapter to {label} for the active subject.
              </p>
            </div>

            <form onSubmit={handleAddChapterSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Chapter Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Life Processes"
                    value={newChapTitle}
                    onChange={(e) => {
                      setNewChapTitle(e.target.value);
                      if (!newChapId) {
                        setNewChapId(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                      }
                    }}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Chapter No. *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newChapNumber}
                    onChange={(e) => setNewChapNumber(Number(e.target.value))}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Chapter ID / Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. life-processes"
                  value={newChapId}
                  onChange={(e) => setNewChapId(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">One-line Summary</label>
                <input
                  type="text"
                  placeholder="Brief high-yield summary..."
                  value={newChapSummary}
                  onChange={(e) => setNewChapSummary(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Syllabus Notes (Rich Text Editor)</label>
                  <span className="text-[10px] text-slate-400 font-mono">Format using toolbar buttons</span>
                </div>
                <RichTextEditor
                  value={newChapNotes}
                  onChange={setNewChapNotes}
                  minHeight="150px"
                  placeholder="Enter detailed study summaries..."
                  creatorMode={creatorMode}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChapterModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Create Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
