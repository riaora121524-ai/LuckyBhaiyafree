import React, { useState, useEffect } from "react";
import { 
  MessageSquare, ThumbsUp, Trash2, Pin, CheckCircle2, 
  HelpCircle, Send, Sparkles, Filter, ChevronDown, User, 
  CornerDownRight, Check, X, Loader2, Award
} from "lucide-react";
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, getDocs, getDoc } from "firebase/firestore";
import { db, getOrCreateUserId, loadUserPrefs } from "../firebase";

export interface CommentReply {
  id: string;
  author: string;
  avatarColor: string;
  timestamp: string;
  text: string;
  isAiResponse?: boolean;
}

export interface ChapterComment {
  id: string;
  author: string;
  avatarColor: string;
  timestamp: string;
  text: string;
  isDoubt: boolean;
  resolved: boolean;
  upvotes: number;
  userUpvoted?: boolean;
  isPinned?: boolean;
  replies: CommentReply[];
}

interface ChapterCommentsProps {
  chapterId: string;
  chapterTitle: string;
  chapterNotes?: string;
  creatorMode?: boolean;
}

// Student nickname ideas for quick-select
const STUDENT_NICKNAMES = [
  "CBSE Topper 2026 🎯",
  "Concept Master 🧠",
  "Backbencher Aman 🎒",
  "Formula Finder 📝",
  "NCERT Warrior ⚔️",
  "Board Aspirant ✨",
  "Science Geek 🔬",
  "Maths Whiz 📐",
  "Active Learner 🌟"
];

// Aesthetic gradients for avatars
const AVATAR_GRADIENTS = [
  "from-pink-500 to-rose-500",
  "from-purple-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-teal-500 to-emerald-500",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-fuchsia-500"
];

export default function ChapterComments({
  chapterId,
  chapterTitle,
  chapterNotes = "",
  creatorMode = false
}: ChapterCommentsProps) {
  const [comments, setComments] = useState<ChapterComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isDoubt, setIsDoubt] = useState(false);
  const [avatarColor, setAvatarColor] = useState(AVATAR_GRADIENTS[1]);
  
  // Filtering & Sorting State
  const [filterType, setFilterType] = useState<"all" | "doubts" | "resolved" | "pinned">("all");
  const [sortBy, setSortBy] = useState<"top" | "newest">("top");

  // Thread reply states
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // AI solving state per comment
  const [aiSolvingCommentId, setAiSolvingCommentId] = useState<string | null>(null);

  // Tracking user's authored comment IDs to allow deleting their own comments
  const [myCommentIds, setMyCommentIds] = useState<string[]>([]);

  // Choose reply mode for creators: manual typing vs automated AI answer
  const [creatorReplyOption, setCreatorReplyOption] = useState<"manual" | "ai">("manual");

  // Initialize and load comments via real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, "comments"), where("chapterId", "==", chapterId));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const commentsList: ChapterComment[] = [];
      querySnapshot.forEach((docSnap) => {
        commentsList.push(docSnap.data() as ChapterComment);
      });

      if (querySnapshot.empty) {
        // Seed nice sample comments matching CBSE syllabus and Chapter Title
        const defaultComments: (ChapterComment & { chapterId: string })[] = [
          {
            id: `seed-1-${chapterId}`,
            chapterId: chapterId,
            author: "NCERT Warrior ⚔️",
            avatarColor: "from-purple-500 to-indigo-500",
            timestamp: "2 hours ago",
            text: `Bhaiya, is the stepwise derivation or the experimental setup question more high-yielding for CBSE Board exams in "${chapterTitle}"? I always lose marks in 5-mark subjective questions.`,
            isDoubt: true,
            resolved: true,
            upvotes: 18,
            isPinned: true,
            replies: [
              {
                id: `seed-reply-1-${chapterId}`,
                author: "Lucky Bhaiya 🌟",
                avatarColor: "from-yellow-500 to-amber-500",
                timestamp: "1 hour ago",
                text: "Chhotu, CBSE boards focus heavily on experiment-based and case-study questions! For 5-mark questions, always make sure to draw neat labeled diagrams and write points in NCERT keywords. I've updated the Revision Notes to highlight active board-scoring questions!",
                isAiResponse: true
              }
            ]
          },
          {
            id: `seed-2-${chapterId}`,
            chapterId: chapterId,
            author: "Concept Master 🧠",
            avatarColor: "from-teal-500 to-emerald-500",
            timestamp: "5 hours ago",
            text: `I made a custom mnemonic list of the sub-definitions of "${chapterTitle}". Sharing with everyone here: keep it super simple and highlight keywords!`,
            isDoubt: false,
            resolved: false,
            upvotes: 12,
            replies: []
          }
        ];
        
        // Push seeded comments to Firestore
        for (const comment of defaultComments) {
          await setDoc(doc(db, "comments", comment.id), comment);
        }
      } else {
        // Sort: pinned first, then highest upvotes, then timestamp/id
        commentsList.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.upvotes - a.upvotes;
        });
        setComments(commentsList);
      }
    });

    // Load my comment ownership list from Firestore
    async function loadMyComments() {
      try {
        const uid = getOrCreateUserId();
        const userRef = doc(db, "user_preferences", `user_${uid}`);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setMyCommentIds(userSnap.data().myCommentIds || []);
        }
      } catch (err) {
        console.error("Error loading user comment list:", err);
      }
    }
    loadMyComments();

    // Set a default funny random nickname
    const randomNick = STUDENT_NICKNAMES[Math.floor(Math.random() * STUDENT_NICKNAMES.length)];
    setAuthorName(randomNick);
    setAvatarColor(AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)]);

    // Reset temporary states
    setNewCommentText("");
    setIsDoubt(false);
    setActiveReplyId(null);
    setReplyText("");
    setAiSolvingCommentId(null);

    return () => unsubscribe();
  }, [chapterId, chapterTitle]);

  // Helper to save current comments list to Firestore
  const saveComments = async (updatedComments: ChapterComment[]) => {
    // Instantly update local state for real-time responsiveness
    setComments(updatedComments);

    try {
      // 1. Write updated comments
      for (const comment of updatedComments) {
        const dataToSave = { ...comment, chapterId };
        await setDoc(doc(db, "comments", comment.id), dataToSave);
      }
      // 2. Identify and delete comments removed from list
      const updatedIds = updatedComments.map(c => c.id);
      const q = query(collection(db, "comments"), where("chapterId", "==", chapterId));
      const qSnapshot = await getDocs(q);
      for (const d of qSnapshot.docs) {
        if (!updatedIds.includes(d.id)) {
          await deleteDoc(doc(db, "comments", d.id));
        }
      }
    } catch (err) {
      console.error("Failed to save comments list to Firestore:", err);
    }
  };

  // Submit main comment to Firestore
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const finalName = authorName.trim() || "Anonymous Aspirant 🎯";
    const commentId = `comment-${Date.now()}`;

    const newComment = {
      id: commentId,
      chapterId: chapterId,
      author: finalName,
      avatarColor: avatarColor,
      timestamp: "Just now",
      text: newCommentText.trim(),
      isDoubt: isDoubt,
      resolved: false,
      upvotes: 0,
      replies: []
    };

    try {
      // Save directly to Firestore
      await setDoc(doc(db, "comments", commentId), newComment);

      // Track user comment ownership in user_preferences
      const newMyIds = [...myCommentIds, commentId];
      setMyCommentIds(newMyIds);

      const uid = getOrCreateUserId();
      await setDoc(doc(db, "user_preferences", `user_${uid}`), { myCommentIds: newMyIds }, { merge: true });
    } catch (err) {
      console.error("Failed to post comment to Firestore:", err);
    }

    setNewCommentText("");
    setIsDoubt(false);
  };

  // Submit threaded reply
  const handleSubmitReply = (commentId: string, customAuthorName?: string) => {
    if (!replyText.trim()) return;

    const isTeacher = customAuthorName === "Lucky Bhaiya 🌟";
    const finalName = customAuthorName || authorName.trim() || "Anonymous Aspirant 🎯";
    
    const newReply: CommentReply = {
      id: `reply-${Date.now()}`,
      author: finalName,
      avatarColor: isTeacher ? "from-yellow-500 to-amber-500" : avatarColor,
      timestamp: "Just now",
      text: replyText.trim(),
      isAiResponse: isTeacher
    };

    const updated = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          resolved: isTeacher ? true : c.resolved, // Auto-resolve if solved by Lucky Bhaiya/Teacher!
          replies: [...c.replies, newReply]
        };
      }
      return c;
    });

    saveComments(updated);
    setReplyText("");
    setActiveReplyId(null);
  };

  // Upvote comment
  const handleUpvote = (commentId: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        const alreadyUpvoted = c.userUpvoted;
        return {
          ...c,
          upvotes: alreadyUpvoted ? c.upvotes - 1 : c.upvotes + 1,
          userUpvoted: !alreadyUpvoted
        };
      }
      return c;
    });
    saveComments(updated);
  };

  // Toggle Pinned status (Creator Mode only)
  const handleTogglePin = (commentId: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, isPinned: !c.isPinned };
      }
      return c;
    });
    saveComments(updated);
  };

  // Toggle Doubt resolved state
  const handleToggleResolved = (commentId: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, resolved: !c.resolved };
      }
      return c;
    });
    saveComments(updated);
  };

  // Delete comment (User owned or Creator Mode)
  const handleDeleteComment = async (commentId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmed) return;

    const updated = comments.filter(c => c.id !== commentId);
    await saveComments(updated);

    // Update owned list in Firestore
    const filteredMyIds = myCommentIds.filter(id => id !== commentId);
    setMyCommentIds(filteredMyIds);
    try {
      const uid = getOrCreateUserId();
      await setDoc(doc(db, "user_preferences", `user_${uid}`), { myCommentIds: filteredMyIds }, { merge: true });
    } catch (e) {
      console.error("Failed to update my comments ownership in Firestore:", e);
    }
  };

  // Delete specific reply
  const handleDeleteReply = (commentId: string, replyId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this reply?");
    if (!confirmed) return;

    const updated = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: c.replies.filter(r => r.id !== replyId)
        };
      }
      return c;
    });
    saveComments(updated);
  };

  // Lucky Bhaiya AI Solving Doubt API trigger
  const handleAiSolveDoubt = async (comment: ChapterComment) => {
    if (aiSolvingCommentId) return; // Prevent multiple requests at once
    setAiSolvingCommentId(comment.id);

    try {
      const promptText = `Solve this CBSE student's question/doubt on the chapter "${chapterTitle}":\n"${comment.text}"`;
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          currentContent: chapterNotes
        })
      });

      if (!response.ok) {
        throw new Error("Lucky Bhaiya AI is busy studying for board prep!");
      }

      const data = await response.json();
      
      // Clean HTML generated text for standard plain-text display in comment lists
      // or we can strip HTML to make it read perfectly
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = data.html;
      const textOnly = tempDiv.textContent || tempDiv.innerText || "Verified NCERT concept.";

      const aiReply: CommentReply = {
        id: `reply-ai-${Date.now()}`,
        author: "Lucky Bhaiya 🌟",
        avatarColor: "from-yellow-500 to-amber-500",
        timestamp: "Just now",
        text: textOnly,
        isAiResponse: true
      };

      const updated = comments.map(c => {
        if (c.id === comment.id) {
          return {
            ...c,
            resolved: true, // Mark it resolved automatically
            replies: [...c.replies, aiReply]
          };
        }
        return c;
      });

      saveComments(updated);
    } catch (err: any) {
      alert(err.message || "Something went wrong, please try again.");
    } finally {
      setAiSolvingCommentId(null);
    }
  };

  // Quick select dynamic author name
  const cycleNickname = () => {
    const idx = STUDENT_NICKNAMES.indexOf(authorName);
    const nextIdx = (idx + 1) % STUDENT_NICKNAMES.length;
    setAuthorName(STUDENT_NICKNAMES[nextIdx]);
    setAvatarColor(AVATAR_GRADIENTS[nextIdx % AVATAR_GRADIENTS.length]);
  };

  // Filtering Logic
  const filteredComments = comments.filter(c => {
    if (filterType === "doubts") return c.isDoubt && !c.resolved;
    if (filterType === "resolved") return c.isDoubt && c.resolved;
    if (filterType === "pinned") return c.isPinned;
    return true;
  });

  // Sorting Logic
  const sortedComments = [...filteredComments].sort((a, b) => {
    // Pinned comments always go on top
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === "top") {
      return b.upvotes - a.upvotes;
    } else {
      // Newest first - handle seed timestamps gracefully
      return b.id.localeCompare(a.id);
    }
  });

  return (
    <div id="chapter-comments-board" className="mt-12 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 text-left transition-all">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>Syllabus Doubts & Discussion</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ask questions, help schoolmates solve concepts, or query Lucky Bhaiya AI directly!
          </p>
        </div>

        {/* Filters and sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort dropdown */}
          <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "top" | "newest")}
              className="bg-transparent border-none focus:outline-none cursor-pointer pr-1"
            >
              <option value="top" className="dark:bg-slate-950">Top Upvoted</option>
              <option value="newest" className="dark:bg-slate-950">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
            filterType === "all"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100"
              : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          }`}
        >
          All Discussion ({comments.length})
        </button>
        <button
          onClick={() => setFilterType("doubts")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            filterType === "doubts"
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-white dark:bg-slate-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40 hover:bg-amber-50"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Active Doubts ({comments.filter(c => c.isDoubt && !c.resolved).length})</span>
        </button>
        <button
          onClick={() => setFilterType("resolved")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            filterType === "resolved"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-50"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Resolved ({comments.filter(c => c.isDoubt && c.resolved).length})</span>
        </button>
        <button
          onClick={() => setFilterType("pinned")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            filterType === "pinned"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-50"
          }`}
        >
          <Pin className="w-3.5 h-3.5" />
          <span>Pinned Posts</span>
        </button>
      </div>

      {/* Post a Comment Form */}
      <form onSubmit={handleSubmitComment} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar color indicators */}
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm`}>
              {authorName.substring(0, 1).toUpperCase()}
            </div>
            <div className="space-y-0.5 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Your Nickname</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="E.g., Formula Finder"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="bg-transparent font-bold text-xs text-slate-800 dark:text-slate-100 focus:outline-none border-b border-slate-200 dark:border-slate-800 py-0.5 w-40"
                />
                <button
                  type="button"
                  onClick={cycleNickname}
                  className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline cursor-pointer"
                  title="Cycle Nicknames"
                >
                  🎲 Shuffle Name
                </button>
              </div>
            </div>
          </div>

          {/* Doubt selection indicator */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 px-3.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
            <input
              type="checkbox"
              id="is-doubt-checkbox"
              checked={isDoubt}
              onChange={(e) => setIsDoubt(e.target.checked)}
              className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="is-doubt-checkbox" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1">
              🙋 Mark as Doubt/Question
            </label>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            required
            rows={3}
            maxLength={1000}
            placeholder={isDoubt ? "Type your syllabus question here... Try to be detailed so Lucky Bhaiya or schoolmates can answer!" : "Share comments, practice Mnemonics or study suggestions..."}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium resize-none"
          />
          <div className="absolute bottom-2.5 right-3 text-[9px] text-slate-400 font-semibold font-mono">
            {newCommentText.length}/1000 characters
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-600/10"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit {isDoubt ? "Doubt" : "Comment"}</span>
          </button>
        </div>
      </form>

      {/* Comments List Container */}
      <div className="space-y-4">
        {sortedComments.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col items-center justify-center p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active discussions fit this filter</p>
            <p className="text-[10px] text-slate-400">Be the first to post a query or study tip for this chapter!</p>
          </div>
        ) : (
          sortedComments.map((comment) => {
            const isUserOwned = myCommentIds.includes(comment.id);
            const isDoubtType = comment.isDoubt;
            const isResolved = comment.resolved;

            return (
              <div
                key={comment.id}
                className={`group relative p-5 bg-white dark:bg-slate-950 rounded-2xl border transition-all ${
                  comment.isPinned 
                    ? "border-indigo-400 dark:border-indigo-500 shadow-sm" 
                    : isDoubtType 
                      ? isResolved 
                        ? "border-emerald-200 dark:border-emerald-900/30" 
                        : "border-amber-200 dark:border-amber-900/40 bg-amber-500/5"
                      : "border-slate-200 dark:border-slate-850"
                }`}
              >
                
                {/* Pin status icon */}
                {comment.isPinned && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900/40">
                    <Pin className="w-3 h-3 fill-indigo-500" />
                    <span>PINNED BY TEACHER</span>
                  </div>
                )}

                {/* Main comment block */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar representation */}
                    <div className={`w-7.5 h-7.5 rounded-full bg-gradient-to-br ${comment.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">{comment.author}</span>
                        {isDoubtType && (
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            isResolved 
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 animate-pulse"
                          }`}>
                            {isResolved ? "✅ DOUBT SOLVED" : "🙋 ACTIVE DOUBT"}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{comment.timestamp}</span>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <div className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-medium pl-1 break-words">
                    {comment.text}
                  </div>

                  {/* Actions buttons panel */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-slate-400 font-bold border-t border-slate-50 dark:border-slate-900">
                    
                    {/* Upvote button */}
                    <button
                      onClick={() => handleUpvote(comment.id)}
                      className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        comment.userUpvoted
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30"
                          : "bg-slate-50 dark:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-200 border-transparent hover:bg-slate-100"
                      }`}
                      title="Upvote this comment"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${comment.userUpvoted ? "fill-current" : ""}`} />
                      <span>{comment.upvotes}</span>
                    </button>

                    {/* Reply trigger button */}
                    <button
                      onClick={() => {
                        setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                        setReplyText("");
                      }}
                      className="text-[11px] px-2.5 py-1 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-all cursor-pointer border border-transparent"
                    >
                      Reply ({comment.replies.length})
                    </button>

                    {/* Solve doubt with AI trigger (visible on active doubts) */}
                    {isDoubtType && !isResolved && (
                      <button
                        onClick={() => handleAiSolveDoubt(comment)}
                        disabled={!!aiSolvingCommentId}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-950 rounded-lg transition-all cursor-pointer border border-indigo-150"
                        title="Get Lucky Bhaiya AI verified scoring explanation"
                      >
                        {aiSolvingCommentId === comment.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                            <span>Lucky Bhaiya is writing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                            <span>Ask Lucky Bhaiya AI</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Creator Mode / Teacher controls */}
                    {creatorMode && (
                      <>
                        {/* Toggle resolved */}
                        {isDoubtType && (
                          <button
                            onClick={() => handleToggleResolved(comment.id)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                              isResolved
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200"
                                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200"
                            }`}
                          >
                            {isResolved ? "Reopen Doubt" : "Mark Solved"}
                          </button>
                        )}

                        {/* Toggle Pin */}
                        <button
                          onClick={() => handleTogglePin(comment.id)}
                          className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                            comment.isPinned
                              ? "bg-slate-200 dark:bg-slate-800 text-slate-700 border-slate-300"
                              : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border-indigo-200"
                          }`}
                        >
                          <Pin className="w-3 h-3" />
                          <span>{comment.isPinned ? "Unpin" : "Pin"}</span>
                        </button>
                      </>
                    )}

                    {/* Delete button (owner or teacher/creator mode) */}
                    {(isUserOwned || creatorMode) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-[11px] text-red-600 hover:text-red-700 dark:text-red-400 p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/60 rounded-lg cursor-pointer transition-all ml-auto"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Threaded replies block */}
                {comment.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-slate-150 dark:border-slate-800 space-y-3.5">
                    {comment.replies.map((reply) => {
                      const isAi = reply.isAiResponse;
                      return (
                        <div key={reply.id} className="relative space-y-1.5 pt-1 text-left">
                          <div className="flex items-center gap-2">
                            <div className={`w-5.5 h-5.5 rounded-full bg-gradient-to-br ${reply.avatarColor} flex items-center justify-center text-white text-[9px] font-extrabold shadow-sm`}>
                              {reply.author.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                                {reply.author}
                                {isAi && (
                                  <span className="bg-yellow-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-amber-200 dark:border-amber-900/40">
                                    <Sparkles className="w-2.5 h-2.5 fill-current" /> VERIFIED TEACHER / AI
                                  </span>
                                )}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">{reply.timestamp}</span>
                            </div>

                            {/* Delete reply option (only for creatorMode or user's ownership of thread reply) */}
                            {creatorMode && (
                              <button
                                onClick={() => handleDeleteReply(comment.id, reply.id)}
                                className="p-1 text-red-400 hover:text-red-500 rounded cursor-pointer transition-all ml-auto opacity-0 group-hover:opacity-100"
                                title="Delete reply"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-[11.5px] text-slate-700 dark:text-slate-350 leading-relaxed font-medium pl-1 bg-slate-50/50 dark:bg-slate-900/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/50 break-words">
                            {reply.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Embedded Thread reply form */}
                {activeReplyId === comment.id && (
                  <div className="mt-4 pl-4 border-l-2 border-indigo-500 space-y-4 animate-fade-in bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    
                    {/* Toggle Selector for Creator Mode (Only shown if creatorMode is active and it's a doubt/question) */}
                    {creatorMode && isDoubtType && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                          🎓 Teacher Tools: Choose Reply Type
                        </span>
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setCreatorReplyOption("manual")}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                              creatorReplyOption === "manual"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                          >
                            <User className="w-3 h-3" />
                            <span>Manual Reply</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreatorReplyOption("ai")}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                              creatorReplyOption === "ai"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                          >
                            <Sparkles className="w-3 h-3 fill-indigo-500 text-indigo-500 animate-pulse" />
                            <span>AI Solve</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Render corresponding form based on selected option */}
                    {(!creatorMode || !isDoubtType || creatorReplyOption === "manual") ? (
                      /* MANUAL REPLY BOX */
                      <div className="flex items-center gap-2">
                        <div className="text-slate-300 dark:text-slate-700">
                          <CornerDownRight className="w-4 h-4 shrink-0" />
                        </div>
                        <input
                          type="text"
                          placeholder={creatorMode ? "Type teacher's manual response (will post as Lucky Bhaiya 🌟)..." : "Add a reply to this post..."}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSubmitReply(comment.id, creatorMode ? "Lucky Bhaiya 🌟" : authorName);
                            }
                          }}
                          className="flex-1 text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
                        />
                        <button
                          onClick={() => handleSubmitReply(comment.id, creatorMode ? "Lucky Bhaiya 🌟" : authorName)}
                          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-md shadow-indigo-600/10"
                          title="Submit response"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* AI GENERATION MODE WITH PREVIEW & EDIT CAPABILITY */
                      <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10 p-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900/50 space-y-3.5 relative">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Lucky Bhaiya AI Autopilot</span>
                          </div>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/30">
                            Verified CBSE Solver
                          </span>
                        </div>

                        {aiSolvingCommentId === comment.id ? (
                          <div className="py-6 flex flex-col items-center justify-center space-y-2 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-150 dark:border-slate-850">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 animate-pulse">Drafting CBSE-compliant explanation...</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              Leverage Gemini to instantly construct a structured CBSE-scoring explanation citing NCERT guidelines.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleAiSolveDoubt(comment)}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 fill-white" />
                              <span>Generate & Post AI Solution</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
