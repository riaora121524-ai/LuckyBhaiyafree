import React, { useState } from "react";
import { 
  Heart, Send, CheckCircle2, Award, BookOpen, 
  Search, ArrowRight, ShieldCheck, HelpCircle, 
  Mail, MessageSquare, Landmark, Sparkles, AlertCircle 
} from "lucide-react";
import { ALL_CHAPTER_LIST, SUBJECTS } from "../data/chapters";

/* =========================================================================
   1. ABOUT VIEW
   ========================================================================= */
export function AboutView() {
  return (
    <div className="space-y-12 pb-16 text-left">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative max-w-3xl space-y-4">
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase inline-block">
            Our Mission: Education for All
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight leading-tight">
            Lucky Bhaiya CBSE Portal
          </h1>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed font-medium">
            Welcome! I am <strong>Lucky Bhaiya</strong>. My mission is simple: provide the absolute highest quality NCERT chapter-wise summaries, mind maps, important questions, and practice quiz engines for Class 9 and Class 10 CBSE board students completely free, while supporting underprivileged rural students with essential school kits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Support Poor People by Watching Ads
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
            Many talented students in Indian villages cannot afford standard notebook sets, visual books, geometry boxes, or reliable writing pens. Commercialized educational platforms charge high monthly subscription fees, blocking these kids.
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
            On this portal, we show only <strong>high-yield educational flashcard ads</strong> (teaching you active recall, note-taking, and concentration techniques). Every ad watch generates simulated support funds which we use to manufacture and distribute:
          </p>
          <ul className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              <span>Free spiral notebooks for Class 9 & 10 maths practice</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              <span>Full stationery kits (blue/black pens, pencils, geometry scales)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              <span>Local physical coaching camps run by village volunteers</span>
            </li>
          </ul>
        </div>

        {/* Impact illustration box */}
        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-500" /> Community Distribution Drive 2026
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
              <span className="text-[10px] text-emerald-600 font-mono font-bold block">Latest Distribution: June 2026</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                Distributed 450 school kits containing full geometry tools and practice diaries in Alwar, Rajasthan. Funded entirely by our community's flashcard ad interactions!
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
              <span className="text-[10px] text-emerald-600 font-mono font-bold block">Upcoming Camp: August 2026</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                Targeting free distribution of Board preparation textbooks for 600 government school students in rural Uttar Pradesh villages.
              </p>
            </div>
          </div>
          
          <p className="text-[11px] text-slate-400 font-mono text-center font-bold">
            "Education is the most powerful weapon which you can use to change the world."
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. CONTACT VIEW
   ========================================================================= */
export function ContactView() {
  const [formState, setFormState] = useState({ name: "", email: "", studentClass: "Class 10", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.message) {
      alert("Please fill in your Name and Message so Lucky Bhaiya can help you!");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16 text-left">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Contact Lucky Bhaiya</h1>
        <p className="text-slate-500 text-sm font-medium">
          Have doubts, need specific chapter notes, or want to report an equation error? Write directly to me!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="font-bold text-lg font-display">Lucky Bhaiya HQ</h3>
            <p className="text-xs text-blue-100 leading-relaxed font-medium">
              We are constantly working to build notes for more subjects including Social Science civics sections and secondary Hindi literature books.
            </p>
            <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-200" />
                <span>lucky.bhaiya@cbseprep.org</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-200" />
                <span>Response in: 24 Hours</span>
              </div>
            </div>
          </div>

          <div className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-2">Notice for Students</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              We are entirely self-funded and non-profit. If you want to contribute, please simply watch the educational flashcard ads on our homepage daily! That generates the required server and distribution costs.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Thank you, <strong>{formState.name}</strong>. Lucky Bhaiya has received your query and will reply via email shortly. Keep up the high-focus study!
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormState({ name: "", email: "", studentClass: "Class 10", message: "" });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Email Address</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Class</label>
                <select
                  value={formState.studentClass}
                  onChange={(e) => setFormState({ ...formState, studentClass: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none font-bold"
                >
                  <option>Class 10</option>
                  <option>Class 9</option>
                  <option>Other / Teacher</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Message or Notes Request *</label>
                <textarea
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="Describe your doubt, or tell me which subject chapter notes you want me to write next..."
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Submit Message to Lucky Bhaiya
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. PYQS GENERAL DIRECTORY VIEW
   ========================================================================= */
interface PYQsViewProps {
  onNavigateToChapter: (chapterId: string, classId: string, subjectId: string) => void;
}

export function PYQsView({ onNavigateToChapter }: PYQsViewProps) {
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // Collect all pyqs from ALL_CHAPTER_LIST
  const pyqList: Array<{
    chapterId: string;
    classId: string;
    subjectId: string;
    chapterTitle: string;
    id: string;
    year: number;
    question: string;
    marks: number;
  }> = [];

  ALL_CHAPTER_LIST.forEach((chap) => {
    // We fetch full chapter if detailed pyqs exist, or just show list
    const detail = chap.id === "chemical-reactions" || chap.id === "real-numbers" || chap.id === "matter-surroundings" || chap.id === "nationalism-india";
    if (detail) {
      const detailedData = ALL_CHAPTER_LIST.find(c => c.id === chap.id);
      // Hardcoded chapter detail values
      const pyqsArray = chap.id === "chemical-reactions" ? [
        { id: "sci1", year: 2024, question: "Identify the type of reaction and balance: FeSO₄ on heating gives Fe₂O₃, SO₂, and SO₃.", marks: 3 },
        { id: "sci2", year: 2023, question: "What is observed when potassium iodide is added to lead nitrate? State type of reaction and equation.", marks: 3 }
      ] : chap.id === "real-numbers" ? [
        { id: "math1", year: 2024, question: "Prove that 5 - 2√3 is an irrational number, given that √3 is irrational.", marks: 3 }
      ] : chap.id === "matter-surroundings" ? [
        { id: "sci9_1", year: 2023, question: "Convert temperatures to Celsius: (a) 300 K, (b) 573 K.", marks: 2 }
      ] : chap.id === "nationalism-india" ? [
        { id: "sst10_1", year: 2024, question: "Explain the significance of the Poona Pact of September 1932.", marks: 3 }
      ] : [];

      pyqsArray.forEach(p => {
        pyqList.push({
          chapterId: chap.id,
          classId: chap.classId,
          subjectId: chap.subjectId,
          chapterTitle: chap.title,
          ...p
        });
      });
    } else {
      // General mock PYQ listing to populate list
      pyqList.push({
        chapterId: chap.id,
        classId: chap.classId,
        subjectId: chap.subjectId,
        chapterTitle: chap.title,
        id: `${chap.id}-pyq-gen`,
        year: 2024,
        question: `Explain the core physical or textual significance of chapter topics: ${chap.title}.`,
        marks: 3
      });
    }
  });

  const filteredPyqs = pyqList.filter((item) => {
    const matchClass = filterClass === "all" || item.classId === filterClass;
    const matchSub = filterSubject === "all" || item.subjectId === filterSubject;
    return matchClass && matchSub;
  });

  return (
    <div className="space-y-8 pb-16 text-left">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-8 rounded-3xl shadow-md">
        <h1 className="text-3xl font-display font-bold">CBSE Board Solved PYQs Directory</h1>
        <p className="text-sm text-orange-100 mt-1 max-w-xl font-medium">
          Search and review structural answers to board exam questions from past papers (2020-2024). Organized chapter-wise for Class 9 and 10.
        </p>
      </div>

      {/* Filter Header */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Class Filter</label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
          >
            <option value="all">All Classes</option>
            <option value="class-10">Class 10 CBSE</option>
            <option value="class-9">Class 9 Foundation</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Subject Filter</label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
          >
            <option value="all">All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono font-bold text-slate-400 mt-5 ml-auto">
          Showing {filteredPyqs.length} past questions
        </span>
      </div>

      {/* Grid of PYQs */}
      <div className="space-y-4">
        {filteredPyqs.map((pyq, index) => {
          const sub = SUBJECTS.find(s => s.id === pyq.subjectId);
          return (
            <div
              key={index}
              className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-amber-500/20 hover:shadow-md transition-all shadow-sm"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    CBSE {pyq.year} • {pyq.marks}M
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] px-2 py-0.5 rounded uppercase font-bold font-mono">
                    {pyq.classId.replace("-", " ")}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {sub?.name} • {pyq.chapterTitle}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {pyq.question}
                </h3>
              </div>

              <button
                onClick={() => onNavigateToChapter(pyq.chapterId, pyq.classId as any, pyq.subjectId as any)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer text-blue-600 dark:text-blue-400"
              >
                View Solution <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   4. MCQS GENERAL DIRECTORY VIEW
   ========================================================================= */
interface MCQsViewProps {
  onNavigateToChapter: (chapterId: string, classId: string, subjectId: string) => void;
}

export function MCQsView({ onNavigateToChapter }: MCQsViewProps) {
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const mcqList: Array<{
    chapterId: string;
    classId: string;
    subjectId: string;
    chapterTitle: string;
    question: string;
    optionsCount: number;
  }> = [];

  ALL_CHAPTER_LIST.forEach((chap) => {
    // Standard mock list for directories
    const detail = chap.id === "chemical-reactions" || chap.id === "real-numbers" || chap.id === "matter-surroundings" || chap.id === "nationalism-india";
    const count = detail ? 3 : 1;
    for (let i = 0; i < count; i++) {
      mcqList.push({
        chapterId: chap.id,
        classId: chap.classId,
        subjectId: chap.subjectId,
        chapterTitle: chap.title,
        question: i === 0 && chap.id === "chemical-reactions" 
          ? "Which of the following is a displacement reaction?" 
          : i === 1 && chap.id === "chemical-reactions"
          ? "Fatty foods become rancid because of which chemical process?"
          : `High-probability CBSE mock multiple choice problem for: ${chap.title}.`,
        optionsCount: 4
      });
    }
  });

  const filteredMcqs = mcqList.filter((item) => {
    const matchClass = filterClass === "all" || item.classId === filterClass;
    const matchSub = filterSubject === "all" || item.subjectId === filterSubject;
    return matchClass && matchSub;
  });

  return (
    <div className="space-y-8 pb-16 text-left">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-8 rounded-3xl shadow-md">
        <h1 className="text-3xl font-display font-bold">Interactive Revision MCQ Directory</h1>
        <p className="text-sm text-emerald-100 mt-1 max-w-xl font-medium">
          Instantly solve high-probability multiple choice questions to memorize CBSE formulae and core definitions. Supports instant feedback scoring.
        </p>
      </div>

      {/* Filter Header */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Class Filter</label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
          >
            <option value="all">All Classes</option>
            <option value="class-10">Class 10 CBSE</option>
            <option value="class-9">Class 9 Foundation</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Subject Filter</label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="text-xs p-2.5 bg-white dark:bg-gray-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
          >
            <option value="all">All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono font-bold text-slate-400 mt-5 ml-auto">
          Showing {filteredMcqs.length} mock MCQs
        </span>
      </div>

      {/* Grid of MCQs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMcqs.map((mcq, index) => {
          const sub = SUBJECTS.find(s => s.id === mcq.subjectId);
          return (
            <div
              key={index}
              onClick={() => onNavigateToChapter(mcq.chapterId, mcq.classId as any, mcq.subjectId as any)}
              className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500/20 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2.5 py-0.5 rounded font-mono uppercase">
                    Interactive Quiz
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize font-bold">
                    {mcq.classId.replace("-", " ")} • {sub?.name}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-500">
                  Topic: {mcq.chapterTitle}
                </h3>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-bold line-clamp-2">
                  {mcq.question}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-900 flex justify-between items-center text-[10px] font-bold text-slate-400 text-emerald-600 dark:text-emerald-400">
                <span>Solve This Chapter's Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
