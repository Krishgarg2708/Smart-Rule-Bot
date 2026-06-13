import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize dotenv configuration
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy client setup for Gemini SDK to avoid crashes if GEMINI_API_KEY is not initially specified
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required to process automated AI. Please enter it in the Settings panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, intentInfo } = req.body;

    let client: GoogleGenAI;
    try {
      client = getGeminiClient();
    } catch (err: any) {
      return res.status(403).json({
        error: err.message,
        isConfigError: true
      });
    }

    // Build standard, helpful system instructions
    const systemInstruction = 
      "You are 'SmartRuleBot', an intelligent, polished programming and academic assistant with dual processing brains.\n" +
      "Currently, you are running in AI Co-Processor mode utilizing gemini-3.5-flash for open-ended queries.\n" +
      "The client's rule-based NLP analyzer determined the following intent classification for the current request:\n" +
      JSON.stringify(intentInfo) + "\n\n" +
      "Rules for conversation:\n" +
      "1. Be direct, helpful, and highly professional.\n" +
      "2. When the user asks you to write code, design algorithms, or solve math problems, write actual, fully-working, premium quality code blocks in standard Markdown syntax. Include rich execution examples and explanations.\n" +
      "3. If the local rule analyzer detected a successful pre-defined intent (e.g. core greetings, date, time, standard college info, etc.), feel free to acknowledge or naturally integrate its responses to keep the cohesive identity, but expand it with comprehensive detail.\n" +
      "4. Do not insert any fake backend telemetry or logs ('PORT: 3000' lines, terminal-style system codes) unless requested. Write as a humble, brilliant AI. Use beautiful academic or technical vocabulary.";

    // Assemble conversational history
    // Map of history: { role: "user" | "model", parts: [{ text: "..." }] }
    const contents = history.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Attach latest message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || "I apologize, but I could not compute an answer for this prompt.",
    });
  } catch (error: any) {
    console.error("Gemini API server route error:", error);
    res.status(500).json({
      error: error.message || "An internal error occurred while communicating with the AI service.",
    });
  }
});

async function startServer() {
  // Setup Vite Dev Server (for Hot Middleware Mode) or statically serve bundled HTML in production
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
    console.log(`SmartRuleBot fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start fullstack service:", err);
});
