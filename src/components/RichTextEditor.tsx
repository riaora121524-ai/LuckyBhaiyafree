import React, { useEffect, useRef, useState } from "react";
import { 
  Bold, Italic, Underline, Heading2, Heading3, 
  List, ListOrdered, AlignLeft, AlignCenter, 
  AlignRight, Eraser, Code, Eye, Sparkles,
  ChevronDown, Palette, Highlighter, Info,
  AlertTriangle, CheckCircle2, CornerDownLeft, Loader2,
  X
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  creatorMode?: boolean;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  minHeight = "280px",
  creatorMode = false
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value);

  // Tool dropdown states
  const [activeDropdown, setActiveDropdown] = useState<"fontSize" | "fontFamily" | "textColor" | "highlightColor" | "callout" | null>(null);

  // AI Assistant Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  // Initialize and sync content with the editor ref when value or HTML mode toggles
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    setHtmlValue(value);
  }, [value, isHtmlMode]);

  // Document formatting helper
  const execCommand = (command: string, arg: string = "") => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleContentChange();
    setActiveDropdown(null);
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      setHtmlValue(currentHtml);
      onChange(currentHtml);
    }
  };

  const handleHtmlAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlValue(val);
    onChange(val);
  };

  const formatBlock = (tag: string) => {
    execCommand("formatBlock", `<${tag}>`);
  };

  // Custom Callout Box Insertion
  const insertCallout = (type: "info" | "warning" | "success") => {
    let calloutHtml = "";
    if (type === "info") {
      calloutHtml = `
        <div class="callout callout-info" style="margin: 16px 0; padding: 16px 20px; border-left: 4px solid #3b82f6; background-color: rgba(59, 130, 246, 0.08); border-radius: 0 12px 12px 0; color: inherit;">
          <strong style="color: #3b82f6; display: block; margin-bottom: 4px; font-weight: bold; font-size: 14px;">💡 Key Indicator / Fact:</strong>
          <p style="margin: 0; font-size: 13px; line-height: 1.5;">Type important key information here...</p>
        </div><p><br></p>
      `;
    } else if (type === "warning") {
      calloutHtml = `
        <div class="callout callout-warning" style="margin: 16px 0; padding: 16px 20px; border-left: 4px solid #eab308; background-color: rgba(234, 179, 8, 0.08); border-radius: 0 12px 12px 0; color: inherit;">
          <strong style="color: #eab308; display: block; margin-bottom: 4px; font-weight: bold; font-size: 14px;">⚠️ Caution / Concept Alert:</strong>
          <p style="margin: 0; font-size: 13px; line-height: 1.5;">Type warning, exceptions, or exam caution notes here...</p>
        </div><p><br></p>
      `;
    } else if (type === "success") {
      calloutHtml = `
        <div class="callout callout-success" style="margin: 16px 0; padding: 16px 20px; border-left: 4px solid #10b981; background-color: rgba(16, 185, 129, 0.08); border-radius: 0 12px 12px 0; color: inherit;">
          <strong style="color: #10b981; display: block; margin-bottom: 4px; font-weight: bold; font-size: 14px;">✅ Lucky Bhaiya Exam Tip:</strong>
          <p style="margin: 0; font-size: 13px; line-height: 1.5;">Type high-yielding practice tips or tricks here...</p>
        </div><p><br></p>
      `;
    }
    insertHtmlAtCursor(calloutHtml);
    setActiveDropdown(null);
  };

  // Robust HTML cursor insertion
  const insertHtmlAtCursor = (html: string) => {
    if (isHtmlMode) {
      setHtmlValue((prev) => prev + html);
      onChange(htmlValue + html);
    } else {
      editorRef.current?.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement("div");
        el.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node;
        let lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        if (editorRef.current) {
          editorRef.current.innerHTML += html;
        }
      }
      handleContentChange();
    }
  };

  // Color options
  const basicColors = [
    { name: "Default Text", value: "#0f172a" },
    { name: "Default Highlight", value: "transparent" },
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#22c55e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Yellow", value: "#eab308" },
  ];

  const premiumColors = [
    { name: "Sleek Indigo", value: "#818cf8" },
    { name: "Soft Emerald", value: "#34d399" },
    { name: "Soft Amber", value: "#fbbf24" },
    { name: "Rose Gold", value: "#fda4af" },
    { name: "Deep Violet", value: "#c084fc" },
    { name: "Deep Cyan", value: "#22d3ee" },
    { name: "Sunset Orange", value: "#fb923c" },
    { name: "Orchid Pink", value: "#f472b6" },
    { name: "Teal-Aqua", value: "#2dd4bf" },
    { name: "Soft Sky Blue", value: "#38bdf8" },
  ];

  // Font options
  const fontSizes = [
    { name: "Small", value: "2" },
    { name: "Normal", value: "3" },
    { name: "Large", value: "5" },
    { name: "Huge", value: "7" }
  ];

  const fontFamilies = [
    { name: "System Sans", value: "Inter, sans-serif" },
    { name: "Elegant Serif", value: "Playfair Display, Georgia, serif" },
    { name: "Space Grotesk (Tech)", value: "Space Grotesk, sans-serif" },
    { name: "JetBrains Mono (Code)", value: "JetBrains Mono, monospace" },
    { name: "Comic Neue (Playful)", value: "Comic Neue, cursive" }
  ];

  // AI Generation Trigger
  const handleAskLuckyBhaiyaAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiError("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentContent: htmlValue
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate content");
      }

      const data = await response.json();
      insertHtmlAtCursor(data.html);
      
      // Reset prompt and modal
      setAiPrompt("");
      setShowAiModal(false);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Predefined AI suggestions
  const aiSuggestions = [
    "Write notes on Displacement Reaction with chemical equations",
    "Summarize this section into high-yield exam bullets",
    "Explain Neutralization Reaction with real-life examples",
    "List the 5 key differences between Acids and Bases"
  ];

  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm transition-all focus-within:ring-1 focus-within:ring-blue-500 relative">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 print:hidden select-none relative z-10">
        
        {/* Paragraph & Headings */}
        <button
          type="button"
          onClick={() => formatBlock("p")}
          className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Paragraph Text"
        >
          Normal
        </button>
        <button
          type="button"
          onClick={() => formatBlock("h2")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock("h3")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Font Family Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "fontFamily" ? null : "fontFamily")}
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Font Family"
          >
            <span>Font</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {activeDropdown === "fontFamily" && (
            <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 p-1">
              {fontFamilies.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => execCommand("fontName", font.value)}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium cursor-pointer"
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "fontSize" ? null : "fontSize")}
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Font Size"
          >
            <span>Size</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {activeDropdown === "fontSize" && (
            <div className="absolute left-0 mt-1.5 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 p-1">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => execCommand("fontSize", size.value)}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium cursor-pointer"
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Text style formatting */}
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Text Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "textColor" ? null : "textColor")}
            className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-0.5"
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>
          {activeDropdown === "textColor" && (
            <div className="absolute left-0 mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 p-3">
              <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Basic Colors</h5>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {basicColors.map((color) => (
                  <button
                    key={`text-${color.value}`}
                    type="button"
                    onClick={() => execCommand("foreColor", color.value)}
                    className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-transform hover:scale-110 flex items-center justify-center text-[9px]"
                    style={{ backgroundColor: color.value === "transparent" ? "#fff" : color.value }}
                    title={color.name}
                  >
                    {color.value === "transparent" && "❌"}
                  </button>
                ))}
              </div>
              
              {creatorMode && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                  <h5 className="text-[10px] font-bold uppercase text-indigo-500 flex items-center gap-1 mb-2">
                    <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> Creator Palette
                  </h5>
                  <div className="grid grid-cols-5 gap-1.5">
                    {premiumColors.map((color) => (
                      <button
                        key={`text-prem-${color.value}`}
                        type="button"
                        onClick={() => execCommand("foreColor", color.value)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-transform hover:scale-110"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Highlight Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "highlightColor" ? null : "highlightColor")}
            className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-0.5"
            title="Highlight Color"
          >
            <Highlighter className="w-4 h-4" />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>
          {activeDropdown === "highlightColor" && (
            <div className="absolute left-0 mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 p-3">
              <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Basic Highlights</h5>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {basicColors.map((color) => (
                  <button
                    key={`bg-${color.value}`}
                    type="button"
                    onClick={() => execCommand("backColor", color.value)}
                    className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-transform hover:scale-110 flex items-center justify-center text-[9px]"
                    style={{ backgroundColor: color.value === "transparent" ? "#fff" : color.value }}
                    title={color.name}
                  >
                    {color.value === "transparent" && "❌"}
                  </button>
                ))}
              </div>

              {creatorMode && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                  <h5 className="text-[10px] font-bold uppercase text-indigo-500 flex items-center gap-1 mb-2">
                    <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> Creator Palette
                  </h5>
                  <div className="grid grid-cols-5 gap-1.5">
                    {premiumColors.map((color) => (
                      <button
                        key={`bg-prem-${color.value}`}
                        type="button"
                        onClick={() => execCommand("backColor", color.value)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-transform hover:scale-110"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Custom Callouts Box */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "callout" ? null : "callout")}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
            title="Insert Callout/Alert Box"
          >
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Callout Box</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {activeDropdown === "callout" && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 p-2 space-y-1">
              <button
                type="button"
                onClick={() => insertCallout("info")}
                className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all"
              >
                <div className="w-2.5 h-6 bg-blue-500 rounded-full" />
                <div>
                  <h4 className="text-xs font-bold text-blue-600">Info / Key Indicators</h4>
                  <p className="text-[10px] text-slate-400">Blue border, highlighting core facts.</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => insertCallout("warning")}
                className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all"
              >
                <div className="w-2.5 h-6 bg-amber-500 rounded-full" />
                <div>
                  <h4 className="text-xs font-bold text-amber-600">Warning / Caution Alert</h4>
                  <p className="text-[10px] text-slate-400">Orange/Yellow border, syllabus warnings.</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => insertCallout("success")}
                className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all"
              >
                <div className="w-2.5 h-6 bg-emerald-500 rounded-full" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-600">Exam success Tip</h4>
                  <p className="text-[10px] text-slate-400">Green border, teacher secret guidelines.</p>
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        {/* Alignment */}
        <button
          type="button"
          onClick={() => execCommand("justifyLeft")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyRight")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => execCommand("removeFormat")}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Clear Formatting"
        >
          <Eraser className="w-4 h-4" />
        </button>

        {/* Ask Lucky Bhaiya AI (Only available in Creator Mode) */}
        {creatorMode && (
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer border border-transparent animate-pulse hover:animate-none transition-all"
            title="Ask Lucky Bhaiya AI Writer Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
            <span>Ask Lucky Bhaiya AI</span>
          </button>
        )}

        {/* Toggle HTML source */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className={`p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold ${
              isHtmlMode ? "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" : "text-slate-500"
            }`}
            title="Toggle Raw HTML Source"
          >
            {isHtmlMode ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            <span className="text-[10px] uppercase font-mono hidden sm:inline">{isHtmlMode ? "WYSIWYG Mode" : "HTML Source"}</span>
          </button>
        </div>
      </div>

      {/* Close active dropdowns when clicking editor area */}
      <div 
        className="relative bg-white dark:bg-slate-950" 
        onClick={() => setActiveDropdown(null)}
      >
        {isHtmlMode ? (
          <textarea
            value={htmlValue}
            onChange={handleHtmlAreaChange}
            className="w-full text-xs p-4 bg-slate-50 dark:bg-slate-900 border-none focus:outline-none font-mono text-slate-800 dark:text-slate-100 resize-y"
            style={{ minHeight }}
            placeholder="Edit Raw HTML here..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            className="w-full text-xs md:text-sm p-4 md:p-6 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto scrollbar-thin 
                       [&_h2]:text-xl md:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:font-display [&_h2]:tracking-tight
                       [&_h3]:text-base md:[&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-800 dark:[&_h3]:text-slate-200 [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-display
                       [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-slate-600 dark:[&_p]:text-slate-300 [&_p]:font-medium
                       [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:space-y-1 [&_ul_li]:text-slate-600 dark:[&_ul_li]:text-slate-300 [&_ul_li]:font-medium
                       [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:space-y-1 [&_ol_li]:text-slate-600 dark:[&_ol_li]:text-slate-300 [&_ol_li]:font-medium
                       [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white
                       [&_u]:underline"
            style={{ minHeight }}
            placeholder={placeholder}
          />
        )}
      </div>

      {/* Ask Lucky Bhaiya AI Dialog Modal */}
      {showAiModal && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-500/15 text-indigo-500 p-2 rounded-xl animate-pulse">
                  <Sparkles className="w-5 h-5 fill-indigo-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">Ask Lucky Bhaiya AI</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Your personal board prep learning content assistant</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setAiError("");
                }}
                className="p-1.5 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex-grow space-y-4 max-h-[380px] overflow-y-auto scrollbar-thin">
              {aiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-normal font-medium">{aiError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">What study material can I cook for you today?</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Write detailed board notes on Displacement Reaction with chemical equations..."
                  rows={3}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium resize-none"
                  disabled={isGenerating}
                />
              </div>

              {/* Suggestions */}
              {!isGenerating && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Prompts</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setAiPrompt(sug)}
                        className="text-left text-[10.5px] p-2 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl font-semibold border border-slate-100 dark:border-slate-850 transition-all cursor-pointer truncate"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isGenerating && (
                <div className="py-6 flex flex-col items-center justify-center space-y-3">
                  <div className="relative">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <Sparkles className="w-4 h-4 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">Lucky Bhaiya AI is writing high-scoring notes...</p>
                    <p className="text-[10px] text-slate-400">Comparing with 100% NCERT Syllabus guidelines</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setAiError("");
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 cursor-pointer"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAskLuckyBhaiyaAI}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer"
                disabled={isGenerating || !aiPrompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    <span>Generate & Insert</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
