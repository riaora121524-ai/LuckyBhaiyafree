import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client on the server
// We only initialize if the API key is present, otherwise we fail gracefully on request
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Lucky Bhaiya AI assistant
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, currentContent } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getGeminiClient();

      let contextPrompt = `User instruction: "${prompt}"`;
      if (currentContent) {
        contextPrompt += `\n\nContext of existing content in the editor to work with:\n"""\n${currentContent}\n"""`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contextPrompt,
        config: {
          systemInstruction: 
            "You are Lucky Bhaiya, an expert CBSE Board study tutor and content creator for Class 9 and 10 students. " +
            "The user wants you to generate, summarize, rewrite, or format study notes or answers. " +
            "Generate ONLY beautifully-formatted HTML suitable to be directly inserted into a contentEditable DIV inside a WYSIWYG rich text editor. " +
            "You MUST use clean, semantic tags like <h2>, <h3>, <p>, <strong>, <ul>, <ol>, <li>, and <u>. " +
            "Do NOT include any external <html>, <head>, or <body> wrapping tags. " +
            "Do NOT wrap the response in markdown code blocks like ```html ... ```. " +
            "Make sure the explanations are simple, easy to memorize, high-scoring for CBSE exams, and follow the exact NCERT syllabus. " +
            "Keep the tone extremely helpful, friendly, and motivating like an elder brother ('Lucky Bhaiya')."
        }
      });

      let responseText = response.text || "";
      
      // Strip any markdown code blocks if the model accidentally included them
      if (responseText.includes("```html")) {
        responseText = responseText.split("```html")[1].split("```")[0];
      } else if (responseText.includes("```")) {
        responseText = responseText.split("```")[1].split("```")[0];
      }
      responseText = responseText.trim();

      res.json({ html: responseText });
    } catch (error: any) {
      console.error("Gemini AI API Error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate content from Lucky Bhaiya AI" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
