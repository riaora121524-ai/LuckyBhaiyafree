import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, ArrowRight, Bookmark, Printer, HelpCircle, 
  BookOpen, Brain, MessageSquare, Award, CheckCircle2, 
  XCircle, RotateCcw, Share2, Info, ChevronDown, ChevronUp, Download, Eye, EyeOff,
  Trash2, Plus
} from "lucide-react";
import { Chapter, MCQ, getChapter, ALL_CHAPTER_LIST, SUBJECTS, syncDataFromStorage } from "../data/chapters";
import { getStoredChapters, saveStoredChapters } from "../data/chaptersStore";
import RichTextEditor from "./RichTextEditor";
import ChapterComments from "./ChapterComments";

interface ChapterPageProps {
  chapterId: string;
  classId: "class-9" | "class-10";
  subjectId: "maths" | "science" | "english" | "sst" | "hindi";
  onBackToClass: () => void;
  onNavigateToChapter: (chapterId: string, classId: string, subjectId: string) => void;
  bookmarks: string[];
  toggleBookmark: (chapterId: string) => void;
  creatorMode?: boolean;
  onDataChange?: () => void;
}

type ActiveTab = "notes" | "questions" | "pyqs" | "mcqs" | "mindmap" | "faqs";

export default function ChapterPage({
  chapterId,
  classId,
  subjectId,
  onBackToClass,
  onNavigateToChapter,
  bookmarks,
  toggleBookmark,
  creatorMode = false,
  onDataChange
}: ChapterPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("notes");
  
  // MCQ state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [mcqChecked, setMcqChecked] = useState<Record<string, boolean>>({});
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Hidden/Shown answers states
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [revealedPyqs, setRevealedPyqs] = useState<Record<string, boolean>>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showDownloadToast, setShowDownloadToast] = useState(false);

  // Load Chapter Data (or fallback)
  const chapter = getChapter(classId, subjectId, chapterId);
  const subject = SUBJECTS.find(s => s.id === subjectId);

  const [editedNotes, setEditedNotes] = useState(chapter ? chapter.notes || "" : "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Sync edited notes when chapter changes
  useEffect(() => {
    if (chapter) {
      setEditedNotes(chapter.notes || "");
    }
  }, [chapterId]);

  const saveChapterState = (updatedChapter: Chapter) => {
    const currentChaps = getStoredChapters();
    const nextChaps = currentChaps.map(c => c.id === chapterId ? updatedChapter : c);
    saveStoredChapters(nextChaps);
    syncDataFromStorage();
    if (onDataChange) onDataChange();
  };

  // --- Handlers for Notes ---
  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    const updated = { ...chapter, notes: editedNotes };
    saveChapterState(updated);
    setTimeout(() => {
      setIsSavingNotes(false);
      alert("Notes saved successfully!");
    }, 400);
  };

  // --- Handlers for Important Questions ---
  const [newQText, setNewQText] = useState("");
  const [newQAns, setNewQAns] = useState("");
  
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText || !newQAns) return;
    const newQ = {
      id: `${chapterId}-q-${Date.now()}`,
      question: newQText,
      answer: newQAns,
      marks: 3
    };
    const updated = {
      ...chapter,
      importantQuestions: [...(chapter.importantQuestions || []), newQ]
    };
    saveChapterState(updated);
    setNewQText("");
    setNewQAns("");
  };

  const handleDeleteQuestion = (index: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this question?");
    if (!confirmed) return;
    const filtered = (chapter.importantQuestions || []).filter((_, i) => i !== index);
    const updated = { ...chapter, importantQuestions: filtered };
    saveChapterState(updated);
  };

  // --- Handlers for PYQs ---
  const [newPyqYear, setNewPyqYear] = useState("");
  const [newPyqQ, setNewPyqQ] = useState("");
  const [newPyqAns, setNewPyqAns] = useState("");

  const handleAddPyq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPyqQ || !newPyqAns) return;
    const newPyq = {
      id: `${chapterId}-pyq-${Date.now()}`,
      year: newPyqYear || "CBSE Board",
      question: newPyqQ,
      solution: newPyqAns,
      marks: 3
    };
    const updated = {
      ...chapter,
      pyqs: [...(chapter.pyqs || []), newPyq]
    };
    saveChapterState(updated);
    setNewPyqYear("");
    setNewPyqQ("");
    setNewPyqAns("");
  };

  const handleDeletePyq = (index: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this PYQ?");
    if (!confirmed) return;
    const filtered = (chapter.pyqs || []).filter((_, i) => i !== index);
    const updated = { ...chapter, pyqs: filtered };
    saveChapterState(updated);
  };

  // --- Handlers for MCQs ---
  const [newMcqQ, setNewMcqQ] = useState("");
  const [newMcqOptA, setNewMcqOptA] = useState("");
  const [newMcqOptB, setNewMcqOptB] = useState("");
  const [newMcqOptC, setNewMcqOptC] = useState("");
  const [newMcqOptD, setNewMcqOptD] = useState("");
  const [newMcqCorrect, setNewMcqCorrect] = useState<number>(0);
  const [newMcqExp, setNewMcqExp] = useState("");

  const handleAddMcq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMcqQ || !newMcqOptA || !newMcqOptB) return;
    const newMcqObj: MCQ = {
      id: `${chapterId}-mcq-${Date.now()}`,
      question: newMcqQ,
      options: [newMcqOptA, newMcqOptB, newMcqOptC || "N/A", newMcqOptD || "N/A"],
      correctAnswer: Number(newMcqCorrect),
      explanation: newMcqExp || "Correct answer has been verified by syllabus markers."
    };
    const updated = {
      ...chapter,
      mcqs: [...(chapter.mcqs || []), newMcqObj]
    };
    saveChapterState(updated);
    // Reset Form
    setNewMcqQ("");
    setNewMcqOptA("");
    setNewMcqOptB("");
    setNewMcqOptC("");
    setNewMcqOptD("");
    setNewMcqCorrect(0);
    setNewMcqExp("");
  };

  const handleDeleteMcq = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this MCQ?");
    if (!confirmed) return;
    const filtered = (chapter.mcqs || []).filter((_, i) => i !== index);
    const updated = { ...chapter, mcqs: filtered };
    saveChapterState(updated);
  };

  // --- Handlers for FAQs ---
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqAns, setNewFaqAns] = useState("");

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ || !newFaqAns) return;
    const newFaq = {
      question: newFaqQ,
      answer: newFaqAns
    };
    const updated = {
      ...chapter,
      faqs: [...(chapter.faqs || []), newFaq]
    };
    saveChapterState(updated);
    setNewFaqQ("");
    setNewFaqAns("");
  };

  const handleDeleteFaq = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this FAQ?");
    if (!confirmed) return;
    const filtered = (chapter.faqs || []).filter((_, i) => i !== index);
    const updated = { ...chapter, faqs: filtered };
    saveChapterState(updated);
  };

  // --- Handlers for Mind Map nodes ---
  const [newMindmapNode, setNewMindmapNode] = useState("");

  const handleAddMindmapNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMindmapNode) return;
    const updated = {
      ...chapter,
      mindMap: [...(chapter.mindMap || []), newMindmapNode]
    };
    saveChapterState(updated);
    setNewMindmapNode("");
  };

  const handleDeleteMindmapNode = (index: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this topic from the mind map?");
    if (!confirmed) return;
    const filtered = (chapter.mindMap || []).filter((_, i) => i !== index);
    const updated = { ...chapter, mindMap: filtered };
    saveChapterState(updated);
  };

  // Reset states when chapter changes
  useEffect(() => {
    setActiveTab("notes");
    setSelectedAnswers({});
    setMcqChecked({});
    setQuizScore(0);
    setQuizFinished(false);
    setRevealedAnswers({});
    setRevealedPyqs({});
    setActiveFaq(null);
    
    // Scroll to top of chapter page
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Set dynamic document metadata for SEO
    if (chapter) {
      document.title = `${chapter.title} - NCERT Notes, MCQs & PYQs | Lucky Bhaiya`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", chapter.summary);
      }
    }
  }, [chapterId, classId, subjectId]);

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <span className="text-sm text-gray-500">Chapter not found.</span>
        <button onClick={onBackToClass} className="text-blue-500 underline ml-2">Go back</button>
      </div>
    );
  }

  // Bookmarking status
  const isBookmarked = bookmarks.includes(chapter.id);

  // Find next and previous chapters in current subject
  const subjectChapters = ALL_CHAPTER_LIST.filter(c => c.classId === classId && c.subjectId === subjectId)
    .sort((a, b) => a.number - b.number);
  const currentIndex = subjectChapters.findIndex(c => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? subjectChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < subjectChapters.length - 1 ? subjectChapters[currentIndex + 1] : null;

  // Handle MCQ click
  const handleMcqClick = (mcqId: string, optionIdx: number, correctIdx: number) => {
    if (mcqChecked[mcqId]) return; // Already answered

    const isCorrect = optionIdx === correctIdx;
    setSelectedAnswers(prev => ({ ...prev, [mcqId]: optionIdx }));
    setMcqChecked(prev => ({ ...prev, [mcqId]: true }));
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }

    // Check if all MCQs are answered
    const nextChecked = { ...mcqChecked, [mcqId]: true };
    if (Object.keys(nextChecked).length === chapter.mcqs.length) {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setMcqChecked({});
    setQuizScore(0);
    setQuizFinished(false);
  };

  // Toggle answer reveal
  const toggleAnswer = (qId: string) => {
    setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const togglePyq = (pId: string) => {
    setRevealedPyqs(prev => ({ ...prev, [pId]: !prev[pId] }));
  };

  // PDF Download / Print trigger
  const handlePrint = () => {
    const classLabel = classId === "class-10" ? "Class 10" : "Class 9";
    const subjectName = subject?.name || "Subject";
    const printableHtml = generatePrintableHtml(chapter, subjectName, classLabel);

    try {
      // 1. Attempt to open a clean new window/tab
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printableHtml);
        printWindow.document.close();
      } else {
        throw new Error("Popup blocked or not supported");
      }
    } catch (e) {
      // 2. Fallback: Download a beautifully formatted standalone .html file
      const blob = new Blob([printableHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${chapter.title.replace(/\s+/g, "_")}_Notes_Lucky_Bhaiya.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show toast
      setShowDownloadToast(true);
      setTimeout(() => {
        setShowDownloadToast(false);
      }, 8500);
    }
  };

  const shareChapter = () => {
    if (navigator.share) {
      navigator.share({
        title: `${chapter.title} Notes - Lucky Bhaiya`,
        text: chapter.summary,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Chapter link copied to clipboard! Share it with your school friends 💖");
    }
  };

  return (
    <div className="space-y-8 pb-16 print:p-0">
      {/* 1. Breadcrumbs, Bookmark, Share and PDF trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden text-left">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button onClick={onBackToClass} className="hover:text-blue-600 transition-colors cursor-pointer font-bold">
            {classId === "class-10" ? "Class 10" : "Class 9"} {subject?.name}
          </button>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-300 font-bold truncate max-w-[200px] sm:max-w-xs">
            Ch-{chapter.number}: {chapter.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmark(chapter.id)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isBookmarked
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={shareChapter}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Print / PDF Generator */}
          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/10"
            title="Download Notes as PDF / Print Sheet"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Cover Header (only visible on print medium) */}
      <div className="hidden print:block text-center border-b-2 border-slate-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold font-display text-slate-900">Lucky Bhaiya CBSE Portal</h1>
        <p className="text-xs font-mono text-slate-500 uppercase mt-1">100% NCERT Verified Curriculum Study Notes</p>
        <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-bold text-slate-700">
          <div>Class: {classId === "class-10" ? "Class 10" : "Class 9"}</div>
          <div>Subject: {subject?.name}</div>
          <div>Chapter Number: {chapter.number}</div>
        </div>
        <h2 className="text-2xl font-bold mt-4 text-slate-800 font-display">Ch-{chapter.number}: {chapter.title}</h2>
      </div>

      {/* 2. Chapter Title and Summary Box */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-900/40 dark:to-slate-950 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-left relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-24 h-24 bg-white/40 dark:bg-slate-850/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono">
              NCERT Chapter {chapter.number}
            </span>
            <span className="text-xs text-slate-400 capitalize font-medium">
              {classId.replace("-", " ")} • {subject?.name} Notes
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
            {chapter.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl font-medium">
            {chapter.summary}
          </p>
        </div>
      </div>

      {/* 3. Tab-style Navigation Panel (Print-friendly) */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-px gap-1 scrollbar-hide print:hidden">
        {[
          { id: "notes", label: "Revision Notes", icon: <BookOpen className="w-4 h-4" /> },
          { id: "questions", label: "Imp Questions", icon: <HelpCircle className="w-4 h-4" /> },
          { id: "pyqs", label: "CBSE PYQs", icon: <Award className="w-4 h-4" /> },
          { id: "mcqs", label: "MCQ Practice Quiz", icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: "mindmap", label: "Concept Map", icon: <Brain className="w-4 h-4" /> },
          { id: "faqs", label: "FAQs", icon: <MessageSquare className="w-4 h-4" /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-3.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Panel */}
      <div className="bg-white dark:bg-slate-950 p-1 md:p-4 rounded-3xl transition-colors">
        
        {/* A. NOTES TAB */}
        {(activeTab === "notes" || window.matchMedia("print").matches) && (
          <div className={`${activeTab === "notes" ? "block" : "hidden print:block"} text-left prose max-w-none space-y-4`}>
            {creatorMode && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-3 print:hidden">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 font-display flex items-center gap-1.5 m-0">
                  <BookOpen className="w-4 h-4" /> Edit Core Syllabus Notes
                </h4>
                <RichTextEditor
                  value={editedNotes}
                  onChange={setEditedNotes}
                  placeholder="Type normal text and format it (Bold, Headings, Bullet points) using simple UI buttons at the top..."
                  creatorMode={creatorMode}
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  {isSavingNotes ? "Saving Notes..." : "Save Notes"}
                </button>
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: chapter.notes || "<p>Notes are being curated. Stay tuned!</p>" }} />
          </div>
        )}

        {/* B. IMPORTANT QUESTIONS TAB */}
        {(activeTab === "questions" || window.matchMedia("print").matches) && (
          <div className={`${activeTab === "questions" ? "block" : "hidden print:block"} text-left space-y-6`}>
            <div className="flex items-center gap-2 mb-2 print:hidden bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
              <Info className="w-5 h-5 text-indigo-500 shrink-0" />
              <p className="text-xs text-indigo-800 dark:text-indigo-300 font-bold leading-relaxed">
                <strong>Active Recall Trick:</strong> Try to formulate the solution in your mind or notebook before clicking the <strong className="text-blue-600 dark:text-blue-400">"Show Answer"</strong> button. Step-wise scoring is strictly awarded in final exams.
              </p>
            </div>

            {creatorMode && (
              <form onSubmit={handleAddQuestion} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 print:hidden">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display flex items-center gap-1">
                  <Plus className="w-4 h-4 text-blue-600" /> Add Custom Board Practice Question
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Enter board-level question..."
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter ideal stepwise score answers..."
                    value={newQAns}
                    onChange={(e) => setNewQAns(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Add Question
                </button>
              </form>
            )}

            <div className="space-y-4">
              {(chapter.importantQuestions || []).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No questions added yet.</div>
              ) : (
                chapter.importantQuestions.map((q, idx) => {
                  const isRevealed = revealedAnswers[q.id || `q-${idx}`];
                  const qKey = q.id || `q-${idx}`;
                  return (
                    <div
                      key={qKey}
                      className="p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 rounded-2xl relative transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase font-mono">
                          Question {idx + 1} ({q.marks || 3} Marks)
                        </span>
                        
                        {creatorMode && (
                          <button
                            onClick={() => handleDeleteQuestion(idx)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 rounded-lg cursor-pointer transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                        {q.question}
                      </h3>

                      {/* Reveal answer button */}
                      <button
                        onClick={() => toggleAnswer(qKey)}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer print:hidden"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hide Answer
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Show Answer & Steps
                          </>
                        )}
                      </button>

                      {/* Answer Block */}
                      {(isRevealed || window.matchMedia("print").matches) && (
                        <div className="mt-4 p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border-l-4 border-emerald-500 rounded-r-xl transition-all">
                          <strong className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block mb-2 font-mono font-bold">
                            Lucky Bhaiya Recommended Answer Solution:
                          </strong>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                            {q.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* C. PYQs TAB */}
        {(activeTab === "pyqs" || window.matchMedia("print").matches) && (
          <div className={`${activeTab === "pyqs" ? "block" : "hidden print:block"} text-left space-y-6`}>
            <div className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/15 dark:to-slate-950 p-4 rounded-2xl border border-amber-200/40 dark:border-amber-900/30 flex gap-3 mb-2 print:hidden">
              <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 font-display">Previous Years CBSE Questions</h4>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400 mt-0.5 font-semibold">
                  These questions were asked in official CBSE board exams. Markers use specific step rubrics to grade your answer sheets. Review the structural layout of the solved solution keys.
                </p>
              </div>
            </div>

            {creatorMode && (
              <form onSubmit={handleAddPyq} className="bg-amber-50/10 dark:bg-amber-950/5 p-4 rounded-2xl border border-amber-200/40 dark:border-amber-900/20 space-y-3 print:hidden">
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 font-display flex items-center gap-1">
                  <Plus className="w-4 h-4 text-amber-500" /> Add Previous Year Board Question (PYQ)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Board Year (e.g. 2024, 2023)"
                    value={newPyqYear}
                    onChange={(e) => setNewPyqYear(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-amber-200/30 rounded-xl focus:outline-none font-medium"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Enter board question..."
                    value={newPyqQ}
                    onChange={(e) => setNewPyqQ(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-amber-200/30 rounded-xl focus:outline-none sm:col-span-2 font-medium"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter official mark solution guidelines..."
                  value={newPyqAns}
                  onChange={(e) => setNewPyqAns(e.target.value)}
                  className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-amber-200/30 rounded-xl focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Add PYQ
                </button>
              </form>
            )}

            <div className="space-y-4">
              {(!chapter.pyqs || chapter.pyqs.length === 0) ? (
                <div className="text-center py-6 text-xs text-slate-400 font-semibold">Additional PYQs are loaded for main board topics. Practice our MCQs!</div>
              ) : (
                chapter.pyqs.map((pyq, idx) => {
                  const isRevealed = revealedPyqs[pyq.id || `pyq-${idx}`];
                  const pyqKey = pyq.id || `pyq-${idx}`;
                  return (
                    <div
                      key={pyqKey}
                      className="p-5 border border-amber-200/60 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-950/10 rounded-2xl relative transition-all"
                    >
                      <div className="flex justify-between items-center gap-2 mb-3">
                        <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded font-mono">
                          CBSE Board Exam {pyq.year || "Board"} • {pyq.marks || 3} Marks
                        </span>

                        {creatorMode && (
                          <button
                            onClick={() => handleDeletePyq(idx)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 rounded-lg cursor-pointer transition-colors"
                            title="Delete PYQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        {pyq.question}
                      </h3>

                      {/* Reveal answer button */}
                      <button
                        onClick={() => togglePyq(pyqKey)}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer print:hidden"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hide Solution
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Reveal Board Answer Scheme
                          </>
                        )}
                      </button>

                      {/* Solution Block */}
                      {(isRevealed || window.matchMedia("print").matches) && (
                        <div className="mt-4 p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border-l-4 border-emerald-500 rounded-r-xl transition-all">
                          <strong className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block mb-2 font-mono font-bold">
                            CBSE Official Answer Scheme Steps:
                          </strong>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                            {pyq.solution}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* D. MCQ PRACTICE QUIZ TAB */}
        {activeTab === "mcqs" && (
          <div className="text-left space-y-6 print:hidden">
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Chapter Revision Mock Quiz</h4>
                <p className="text-[11px] text-slate-500 font-medium">Instant-feedback active recall questions designed for Class 9 & 10 boards.</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                Score: {quizScore} / {(chapter.mcqs || []).length}
              </span>
            </div>

            {creatorMode && (
              <form onSubmit={handleAddMcq} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 print:hidden">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display flex items-center gap-1">
                  <Plus className="w-4 h-4 text-blue-600" /> Add Custom MCQ Question
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Enter MCQ question stem..."
                    value={newMcqQ}
                    onChange={(e) => setNewMcqQ(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-medium"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Option A"
                      value={newMcqOptA}
                      onChange={(e) => setNewMcqOptA(e.target.value)}
                      className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-semibold"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Option B"
                      value={newMcqOptB}
                      onChange={(e) => setNewMcqOptB(e.target.value)}
                      className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="Option C (Optional)"
                      value={newMcqOptC}
                      onChange={(e) => setNewMcqOptC(e.target.value)}
                      className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="Option D (Optional)"
                      value={newMcqOptD}
                      onChange={(e) => setNewMcqOptD(e.target.value)}
                      className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Correct Option Index (0 = A, 1 = B, etc.)</label>
                      <select
                        value={newMcqCorrect}
                        onChange={(e) => setNewMcqCorrect(Number(e.target.value))}
                        className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-bold"
                      >
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        <option value={2}>Option C</option>
                        <option value={3}>Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Explanation</label>
                      <input
                        type="text"
                        placeholder="Why is this option correct?"
                        value={newMcqExp}
                        onChange={(e) => setNewMcqExp(e.target.value)}
                        className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Add MCQ
                </button>
              </form>
            )}

            <div className="space-y-6">
              {(!chapter.mcqs || chapter.mcqs.length === 0) ? (
                <div className="text-center py-8 text-xs text-slate-400">No MCQ questions created yet.</div>
              ) : (
                chapter.mcqs.map((mcq, idx) => {
                  const isChecked = mcqChecked[mcq.id];
                  const selectedOption = selectedAnswers[mcq.id];
                  const isCorrect = selectedOption === mcq.correctAnswer;

                  return (
                    <div
                      key={mcq.id}
                      className="p-6 border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 rounded-2xl space-y-4 relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                          MCQ Question {idx + 1}
                        </span>

                        {creatorMode && (
                          <button
                            onClick={(e) => handleDeleteMcq(idx, e)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 rounded-lg cursor-pointer transition-colors"
                            title="Delete MCQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {mcq.question}
                      </h3>

                      {/* Options list */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {mcq.options.map((option, optIdx) => {
                          let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200";
                          let indicator = null;

                          if (isChecked) {
                            if (optIdx === mcq.correctAnswer) {
                              btnStyle = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
                              indicator = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
                            } else if (optIdx === selectedOption) {
                              btnStyle = "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-700 dark:text-red-400 font-bold";
                              indicator = <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
                            } else {
                              btnStyle = "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleMcqClick(mcq.id, optIdx, mcq.correctAnswer)}
                              disabled={isChecked}
                              className={`w-full text-left p-3.5 border rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer font-bold ${btnStyle}`}
                            >
                              <span>{option}</span>
                              {indicator}
                            </button>
                          );
                        })}
                      </div>

                      {/* Live Explanation reveal */}
                      {isChecked && (
                        <div className="mt-4 p-4 bg-blue-50/30 dark:bg-blue-950/10 border-l-4 border-blue-500 rounded-r-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          <strong className="text-blue-700 dark:text-blue-400 block mb-1 font-bold">
                            {isCorrect ? "🎉 Correct! Nice Work!" : "❌ Incorrect. Explanation:"}
                          </strong>
                          {mcq.explanation}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quiz Results completion banner */}
            {quizFinished && (
              <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
                <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-display">Mock Quiz Complete!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  You scored <strong className="font-bold">{quizScore} out of {(chapter.mcqs || []).length}</strong> questions correctly!
                </p>
                <button
                  onClick={resetQuiz}
                  className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* E. MIND MAP TAB */}
        {(activeTab === "mindmap" || window.matchMedia("print").matches) && (
          <div className={`${activeTab === "mindmap" ? "block" : "hidden print:block"} text-left space-y-6`}>
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-3 print:hidden">
              <Brain className="w-5 h-5 text-blue-500 shrink-0 m-0" />
              <div>
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 font-display">Quick-Recall Concept Mind Map</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Excellent tool for 5 minutes prior to entering the exam hall. Review these conceptual nodes sequentially.
                </p>
              </div>
            </div>

            {creatorMode && (
              <form onSubmit={handleAddMindmapNode} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 print:hidden">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display flex items-center gap-1">
                  <Plus className="w-4 h-4 text-blue-600" /> Add Concept Map Step
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter brief key high-yield concept summary step..."
                    value={newMindmapNode}
                    onChange={(e) => setNewMindmapNode(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-semibold"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm shrink-0"
                  >
                    Add Node
                  </button>
                </div>
              </form>
            )}

            {/* Render Map Nodes */}
            <div className="relative pl-6 border-l-2 border-blue-100 dark:border-blue-900 space-y-6 py-2">
              {(!chapter.mindMap || chapter.mindMap.length === 0) ? (
                <div className="text-center py-6 text-xs text-slate-400">No Mindmap steps added yet.</div>
              ) : (
                chapter.mindMap.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Glowing Node Dot */}
                    <span className="absolute -left-[31px] top-1.5 w-4 h-4 bg-blue-600 dark:bg-blue-400 border-4 border-white dark:border-slate-950 rounded-full shadow-md" />
                    
                    <div className="bg-slate-50/40 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-start gap-4">
                      <div>
                        <strong className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block font-mono mb-1">
                          Concept Node {idx + 1}
                        </strong>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                          {step}
                        </p>
                      </div>

                      {creatorMode && (
                        <button
                          onClick={() => handleDeleteMindmapNode(idx)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 rounded-lg cursor-pointer transition-colors shrink-0"
                          title="Delete Node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* F. FAQs TAB */}
        {(activeTab === "faqs" || window.matchMedia("print").matches) && (
          <div className={`${activeTab === "faqs" ? "block" : "hidden print:block"} text-left space-y-4`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white m-0">Frequently Asked Questions</h3>
            </div>

            {creatorMode && (
              <form onSubmit={handleAddFaq} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 print:hidden">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display flex items-center gap-1">
                  <Plus className="w-4 h-4 text-blue-600" /> Add Custom FAQ
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Enter standard student query FAQ..."
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-semibold"
                  />
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter clear, helpful answer..."
                    value={newFaqAns}
                    onChange={(e) => setNewFaqAns(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Add FAQ
                </button>
              </form>
            )}
            
            <div className="space-y-3">
              {(!chapter.faqs || chapter.faqs.length === 0) ? (
                <div className="text-center py-6 text-xs text-slate-400">No FAQs added yet.</div>
              ) : (
                chapter.faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                    >
                      <div className="w-full flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-900/10 text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer print:hidden">
                        <button
                          onClick={() => setActiveFaq(isOpen ? null : idx)}
                          className="flex-1 text-left font-bold"
                        >
                          <span>{faq.question}</span>
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          {creatorMode && (
                            <button
                              onClick={(e) => handleDeleteFaq(idx, e)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 text-red-600 rounded-lg cursor-pointer transition-colors"
                              title="Delete FAQ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setActiveFaq(isOpen ? null : idx)}
                            className="p-1"
                          >
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      {/* For print layout, expand FAQ directly */}
                      <div className="hidden print:block p-4 border-b">
                        <strong className="text-xs text-slate-800 block mb-1">Q: {faq.question}</strong>
                        <p className="text-xs text-slate-600 font-medium">A: {faq.answer}</p>
                      </div>

                      {isOpen && (
                        <div className="p-4 bg-white dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 font-medium">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* Chapter Discussion doubts and comments board */}
      <ChapterComments 
        chapterId={chapter.id} 
        chapterTitle={chapter.title} 
        chapterNotes={chapter.notes} 
        creatorMode={creatorMode} 
      />

      {/* 5. Previous and Next chapter navigation */}
      <div className="flex justify-between items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 print:hidden text-left">
        {prevChapter ? (
          <button
            onClick={() => onNavigateToChapter(prevChapter.id, classId, subjectId)}
            className="flex-1 max-w-[240px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl hover:border-blue-500/30 text-left cursor-pointer transition-all group"
          >
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Previous Chapter
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              Ch-{prevChapter.number}: {prevChapter.title}
            </span>
          </button>
        ) : (
          <div className="flex-1 max-w-[240px] bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400 font-bold">
            Start of Subject Syllabus
          </div>
        )}

        {nextChapter ? (
          <button
            onClick={() => onNavigateToChapter(nextChapter.id, classId, subjectId)}
            className="flex-1 max-w-[240px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl hover:border-blue-500/30 text-right cursor-pointer transition-all group"
          >
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mb-1 justify-end">
              Next Chapter <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              Ch-{nextChapter.number}: {nextChapter.title}
            </span>
          </button>
        ) : (
          <div className="flex-1 max-w-[240px] bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400 font-bold">
            Subject Syllabus Complete
          </div>
        )}
      </div>

      {/* Related chapters in sidebar/bottom */}
      <div className="bg-slate-50/50 dark:bg-slate-900/20 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 print:hidden text-left">
        <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-3">All Syllabus Chapters for {subject?.name}</h3>
        <div className="flex flex-wrap gap-2">
          {subjectChapters.map((chap) => {
            const isActive = chap.id === chapterId;
            return (
              <button
                key={chap.id}
                onClick={() => onNavigateToChapter(chap.id, classId, subjectId)}
                className={`text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 font-bold"
                    : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                Ch-{chap.number}: {chap.title.split(":")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating fallback print toast */}
      {showDownloadToast && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-2xl z-50 flex gap-3 text-left animate-bounce print:hidden">
          <div className="bg-blue-500/15 text-blue-400 p-2 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Study Sheet Downloaded!
            </h4>
            <p className="text-xs text-slate-400 leading-normal">
              Due to browser iframe restrictions, we downloaded a beautiful offline printable file:
              <strong className="text-white block mt-1 font-mono text-[10px] truncate">
                {chapter.title.replace(/\s+/g, "_")}_Notes_Lucky_Bhaiya.html
              </strong>
              Open the file and press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono">Ctrl + P</kbd> (or Cmd + P) to print/save as PDF instantly!
            </p>
            <button 
              onClick={() => setShowDownloadToast(false)}
              className="text-[10px] text-blue-400 hover:underline font-bold pt-1 block cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Beautiful formatted printable HTML template generator
const generatePrintableHtml = (chapter: Chapter, subjectName: string, classLabel: string): string => {
  const notesHtml = chapter.notes || "<p>Notes are being curated. Stay tuned!</p>";
  
  const questionsHtml = (chapter.importantQuestions || []).map((q, idx) => `
    <div class="item">
      <span class="badge">Question ${idx + 1} (${q.marks || 3} Marks)</span>
      <div class="question">${q.question}</div>
      <div class="answer">
        <strong>Lucky Bhaiya Recommended Answer:</strong>
        <p style="margin: 6px 0 0 0; white-space: pre-wrap;">${q.answer}</p>
      </div>
    </div>
  `).join("");

  const pyqsHtml = (chapter.pyqs || []).map((pyq, idx) => `
    <div class="item">
      <span class="badge" style="background-color: #fffbeb; color: #b45309;">CBSE Board ${pyq.year} (${pyq.marks || 3} Marks)</span>
      <div class="question">${pyq.question}</div>
      <div class="answer" style="background-color: #fffbeb; border-left-color: #f59e0b;">
        <strong>Board Marking Scheme Answer:</strong>
        <p style="margin: 6px 0 0 0; white-space: pre-wrap;">${pyq.solution}</p>
      </div>
    </div>
  `).join("");

  const mcqsHtml = (chapter.mcqs || []).map((mcq, idx) => `
    <div class="item">
      <span class="badge" style="background-color: #f0fdfa; color: #0f766e;">Practice MCQ ${idx + 1}</span>
      <div class="question">${mcq.question}</div>
      <div style="margin-top: 10px; font-weight: 600; font-size: 13px;">
        Options:
        <ul style="list-style-type: disc; padding-left: 20px; margin: 4px 0 8px 0; font-weight: 500;">
          ${mcq.options.map((opt, oIdx) => `<li style="${oIdx === mcq.correctAnswer ? 'color: #0f766e; font-weight: bold;' : 'color: #475569;'}">${opt} ${oIdx === mcq.correctAnswer ? '✓ (Correct)' : ''}</li>`).join("")}
        </ul>
      </div>
      <div class="answer" style="background-color: #f0fdfa; border-left-color: #14b8a6; font-size: 13px;">
        <strong>Explanation:</strong> ${mcq.explanation}
      </div>
    </div>
  `).join("");

  const mindmapHtml = (chapter.mindMap || []).map((step, idx) => `
    <div style="position: relative; padding-left: 24px; margin-bottom: 16px;">
      <div style="position: absolute; left: 0; top: 6px; width: 8px; height: 8px; background-color: #2563eb; border-radius: 50%;"></div>
      <div style="font-weight: bold; font-size: 12px; color: #2563eb; text-transform: uppercase;">Concept Node ${idx + 1}</div>
      <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 500; color: #334155;">${step}</p>
    </div>
  `).join("");

  const faqsHtml = (chapter.faqs || []).map((faq, idx) => `
    <div style="margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
      <div style="font-weight: 700; font-size: 14px; color: #0f172a;">Q: ${faq.question}</div>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; font-weight: 500;">A: ${faq.answer}</p>
    </div>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${chapter.title} - NCERT Notes & Study Sheet</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.6;
      max-width: 850px;
      margin: 40px auto;
      padding: 0 24px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 24px;
      margin-bottom: 40px;
    }
    .portal-logo {
      font-size: 24px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.025em;
    }
    .portal-tag {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 4px;
    }
    .title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin: 16px 0 6px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-cols: repeat(3, 1fr);
      gap: 12px;
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      margin-top: 16px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    .summary-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 32px;
    }
    .summary-title {
      font-size: 12px;
      font-weight: 800;
      color: #2563eb;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .summary-text {
      font-size: 14px;
      color: #334155;
      margin: 0;
      font-weight: 500;
    }
    .section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: #1e3a8a;
      border-bottom: 2px solid #bfdbfe;
      padding-bottom: 6px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }
    .item {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      background-color: #eff6ff;
      color: #1d4ed8;
      padding: 4px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .question {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .answer {
      background-color: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      font-size: 14px;
      color: #334155;
    }
    .print-btn-container {
      text-align: center;
      margin-bottom: 30px;
    }
    .print-btn {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    }
    .print-btn:hover {
      background-color: #1d4ed8;
    }
    @media print {
      body {
        margin: 20px auto;
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="print-btn-container no-print">
    <button class="print-btn" onclick="window.print()">Print or Save as PDF</button>
    <p style="font-size: 12px; color: #64748b; margin-top: 8px;">If the browser print dialog didn't open automatically, click the button above.</p>
  </div>

  <div class="header">
    <div class="portal-logo">Lucky Bhaiya CBSE Study Portal</div>
    <div class="portal-tag">100% NCERT Syllabus Verified study materials</div>
    <div class="title">Ch-${chapter.number}: ${chapter.title}</div>
    <div class="meta-grid">
      <div>Class: ${classLabel}</div>
      <div>Subject: ${subjectName}</div>
      <div>Chapter Number: Ch-${chapter.number}</div>
    </div>
  </div>

  <div class="summary-box">
    <div class="summary-title">Chapter Overview</div>
    <p class="summary-text">${chapter.summary}</p>
  </div>

  <div class="section">
    <div class="section-title">I. Core Revision Notes</div>
    <div style="font-size: 14px; color: #334155;">
      ${notesHtml}
    </div>
  </div>

  ${questionsHtml ? `
  <div class="section" style="page-break-before: always;">
    <div class="section-title">II. High-Yield Practice Questions</div>
    <div>${questionsHtml}</div>
  </div>
  ` : ''}

  ${pyqsHtml ? `
  <div class="section" style="page-break-before: always;">
    <div class="section-title">III. Previous Years Board Questions (PYQs)</div>
    <div>${pyqsHtml}</div>
  </div>
  ` : ''}

  ${mcqsHtml ? `
  <div class="section" style="page-break-before: always;">
    <div class="section-title">IV. Multiple Choice Questions (MCQs)</div>
    <div>${mcqsHtml}</div>
  </div>
  ` : ''}

  ${mindmapHtml ? `
  <div class="section" style="page-break-before: always;">
    <div class="section-title">V. Concept Mind Map</div>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; page-break-inside: avoid;">
      ${mindmapHtml}
    </div>
  </div>
  ` : ''}

  ${faqsHtml ? `
  <div class="section" style="page-break-before: always;">
    <div class="section-title">VI. Frequently Asked Questions (FAQs)</div>
    <div class="item">${faqsHtml}</div>
  </div>
  ` : ''}

  <div style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 80px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
    Lucky Bhaiya CBSE Learning Portal • Generated on ${new Date().toLocaleDateString('en-IN')}
  </div>

  <script>
    // Trigger print automatically when page loads
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;
};
