import React from "react";
import { GraduationCap, Heart, Mail, Github, Compass, ShieldAlert, Sparkles } from "lucide-react";

interface FooterProps {
  onNavigate: (route: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 py-12 px-4 transition-colors text-left print:hidden shadow-inner">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
            <div className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Lucky <span className="text-blue-600 dark:text-blue-400 font-extrabold">Bhaiya</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            High-yield, original chapter summaries, board exam previous year questions, and concept mind maps designed carefully to secure 100/100 marks in Class 9 and 10 CBSE exams.
          </p>
          <div className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-rose-100/50 dark:border-rose-900/10">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>Support rural education by watching ads!</span>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">Study Hub</h4>
          <ul className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li>
              <button onClick={() => onNavigate("class-10")} className="hover:text-blue-600 transition-colors cursor-pointer">
                Class 10 CBSE
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("class-9")} className="hover:text-blue-600 transition-colors cursor-pointer">
                Class 9 Foundation
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("pyqs")} className="hover:text-blue-600 transition-colors cursor-pointer">
                Solved PYQs
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("mcqs")} className="hover:text-blue-600 transition-colors cursor-pointer">
                Practice MCQs
              </button>
            </li>
          </ul>
        </div>

        {/* Company / Info Links */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">About</h4>
          <ul className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li>
              <button onClick={() => onNavigate("about")} className="hover:text-blue-600 transition-colors cursor-pointer">
                Our Mission
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("contact")} className="hover:text-blue-600 transition-colors cursor-pointer">
                Contact Bhaiya
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("admin")} className="hover:text-indigo-600 text-indigo-600 dark:text-indigo-400 transition-colors font-bold cursor-pointer">
                Admin Portal
              </button>
            </li>
            <li>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block">
                ✓ GitHub Pages Ready
              </span>
            </li>
          </ul>
        </div>

        {/* Disclaimer / SEO keywords */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> NCERT Disclaimer
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
            All notes, concepts, and questions provided on this portal are 100% original educational content drafted by Lucky Bhaiya and academic partners. We do not host scanned books or copyrighted textbook material. We strictly adhere to CBSE fair use instructions.
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-mono">
            Optimized for: Class 10 science notes, CBSE board exam preps, Class 9 maths revision sheets, and free solved NCERT worksheets.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          © {currentYear} <strong>Lucky Bhaiya Portal</strong>. Proudly supporting local school-kit donations since 2024.
        </div>
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer" onClick={() => alert("Lucky Bhaiya respects your privacy. No personal trackers or dynamic browser tracking files are saved on this study portal.")}>Privacy Policy</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer" onClick={() => alert("Lucky Bhaiya CBSE Portal is completely open-source, designed for educational fair-use revisions under the CBSE Board.")}>Disclaimer</span>
        </div>
      </div>
    </footer>
  );
}
