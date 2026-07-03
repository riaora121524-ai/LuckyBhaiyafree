import React, { useState, useEffect } from "react";
import { Heart, Play, Trophy, Sparkles, X, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Ad {
  id: number;
  title: string;
  sponsor: string;
  content: string;
  tip: string;
  duration: number; // in seconds
}

const EDUCATIONAL_ADS: Ad[] = [
  {
    id: 1,
    title: "Smarter Revision with Active Recall",
    sponsor: "Lucky Bhaiya Academy",
    content: "Testing yourself on a chapter yields 150% better long-term memory than re-reading notes. Use our MCQ quizzes and flashcards for Class 9 & 10 to practice active recall!",
    tip: "Tip: Cover the answers and try to explain concepts aloud before checking them.",
    duration: 10
  },
  {
    id: 2,
    title: "Unlocking the Pomodoro Technique",
    sponsor: "Study Well India",
    content: "Study for 25 minutes, then take a 5-minute break. This prevents mental fatigue, boosts concentration, and helps you cover complex Science and Maths equations with high focus.",
    tip: "Tip: During the 5-minute break, stand up, stretch, or drink water instead of checking social media.",
    duration: 10
  },
  {
    id: 3,
    title: "CBSE Board Exam Step-Wise Marking",
    sponsor: "Board Success Portal",
    content: "CBSE awards partial marks for writing formulas, drawing neat labelled diagrams, and showing clean steps, even if your final numerical calculations are slightly off. Never leave a question completely blank!",
    tip: "Tip: Highlight final answers with a box and write the exact physical units (e.g. cm³, Joules, Ohms).",
    duration: 10
  },
  {
    id: 4,
    title: "The Power of Sleep & Memory Consolidation",
    sponsor: "Healthy Minds Initiative",
    content: "Your brain moves temporary study facts into permanent storage during deep sleep. Sacrificing sleep before a Class 10 Science or Maths exam can reduce your cognitive speed by up to 30%.",
    tip: "Tip: Aim for 7-8 hours of sound sleep particularly on the nights leading up to your terminal exams.",
    duration: 10
  }
];

export default function SupportPoorWidget() {
  const [adsWatched, setAdsWatched] = useState<number>(0);
  const [revenueGenerated, setRevenueGenerated] = useState<number>(0);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [activeAd, setActiveAd] = useState<Ad | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Load from local storage
  useEffect(() => {
    const savedCount = localStorage.getItem("lucky_ads_count");
    if (savedCount) {
      const count = parseInt(savedCount, 10);
      setAdsWatched(count);
      setRevenueGenerated(count * 2.5); // Each ad watch simulates raising ₹2.50
    }
  }, []);

  const startWatching = () => {
    // Pick a random ad
    const randomAd = EDUCATIONAL_ADS[Math.floor(Math.random() * EDUCATIONAL_ADS.length)];
    setActiveAd(randomAd);
    setTimeLeft(randomAd.duration);
    setIsWatching(true);
  };

  useEffect(() => {
    if (!isWatching || timeLeft <= 0) {
      if (isWatching && timeLeft === 0) {
        completeAd();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isWatching, timeLeft]);

  const completeAd = () => {
    setIsWatching(false);
    const newCount = adsWatched + 1;
    setAdsWatched(newCount);
    setRevenueGenerated(newCount * 2.50);
    localStorage.setItem("lucky_ads_count", newCount.toString());
    
    // Trigger celebration
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setActiveAd(null);
    }, 3500);
  };

  return (
    <div id="support-poor-widget" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute right-0 top-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400 animate-pulse" />
            <span>Support Lucky Bhaiya's Mission</span>
          </div>
          <h3 className="text-2xl font-bold font-display tracking-tight">
            Support poor students by watching short educational ads!
          </h3>
          <p className="text-blue-100 mt-2 text-sm leading-relaxed">
            Every ad you watch is 100% free and teaches you high-yield exam preparation tips. 100% of the simulated ad revenue goes directly toward providing free notebooks, bags, and stationery to underprivileged Class 9 & 10 students in local villages.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs text-blue-200 block">Ads Watched by You</span>
              <span className="text-xl font-bold font-mono text-white flex items-center gap-1">
                <Trophy className="w-4.5 h-4.5 text-amber-400 inline" /> {adsWatched}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/5">
              <span className="text-xs text-blue-200 block">Your Simulated Impact</span>
              <span className="text-xl font-bold font-mono text-emerald-300">
                ₹{revenueGenerated.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center self-center bg-white/5 border border-white/10 rounded-xl p-4 md:w-64 backdrop-blur-sm">
          <span className="text-xs text-blue-200 text-center mb-2 block">10-Sec High-Yield Flashcard Ad</span>
          <button
            onClick={startWatching}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-5 rounded-xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
            Watch Ad to Support
          </button>
          <span className="text-[11px] text-blue-200/80 text-center mt-2.5 block">
            No redirection, no spans, purely educational!
          </span>
        </div>
      </div>

      {/* Interactive Ad Viewer Modal */}
      <AnimatePresence>
        {isWatching && activeAd && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                    Sponsored Ad
                  </span>
                  <span className="text-xs text-slate-500 font-medium">by {activeAd.sponsor}</span>
                </div>
                <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-mono text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="animate-ping rounded-full h-1.5 w-1.5 bg-red-500 inline-block mr-1"></span>
                  {timeLeft}s remaining
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 relative">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${((activeAd.duration - timeLeft) / activeAd.duration) * 100}%` }}
                  transition={{ ease: "linear", duration: 1 }}
                  className="bg-indigo-600 h-full absolute top-0 left-0"
                />
              </div>

              {/* Ad content */}
              <div className="p-6 text-left">
                <h4 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                  {activeAd.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeAd.content}
                </p>

                {/* Study Tip Box */}
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded text-xs text-amber-800 dark:text-amber-300 font-medium">
                  {activeAd.tip}
                </div>
              </div>

              {/* Footer instruction */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  Your support funds local student study kits
                </span>
                <button
                  onClick={() => {
                    if (window.confirm("If you close this, no revenue will be generated for poor students. Close anyway?")) {
                      setIsWatching(false);
                      setActiveAd(null);
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Skip & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Celebration Modal after watching */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center border-2 border-emerald-500"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h4 className="text-xl font-bold font-display">Ad Completed Successfully!</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Thank you! You just simulated raising <strong className="text-emerald-500 font-semibold">₹2.50</strong> for poor students' school kits!
              </p>
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl inline-flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Keep studying & supporting Lucky Bhaiya!</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
