import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Scope JSON parser to /api to prevent interfering with Vite middleware stream
  app.use('/api', express.json());

  // Lazy Gemini initialization
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Phonetic & Linguistic Helper Endpoint
  app.post("/api/phonetic", async (req, res) => {
    try {
      const { word, language } = req.body || {};
      if (!word || typeof word !== "string") {
        return res.status(400).json({ error: "Word is required" });
      }

      const langName = language || "English";
      const cleanWord = word.trim();

      const prompt = `You are a linguistic phonology expert.
Given the word "${cleanWord}" in the language "${langName}", provide the standard International Phonetic Alphabet (IPA) pronunciation.
Also provide a short translation/meaning in Portuguese (or English if Portuguese is the target language) and a simple practical example sentence.

Respond ONLY with valid JSON in this exact structure:
{
  "phonetic": "/.../",
  "suggestedMeaning": "brief meaning",
  "example": "example sentence using the word"
}`;

      const ai = getAI();
      let responseText = "";

      // Timeout helper
      const callWithTimeout = async (promise: Promise<any>, ms = 7000) => {
        let timer: any;
        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("Timeout calling AI")), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
      };

      try {
        const response: any = await callWithTimeout(
          ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
          7000
        );
        responseText = response.text?.trim() || "{}";
      } catch (firstErr: any) {
        console.warn("Primary model error, attempting fallback:", firstErr?.message);
        try {
          const fallbackResponse: any = await callWithTimeout(
            ai.models.generateContent({
              model: "gemini-3.8-flash",
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                temperature: 0.1,
              },
            }),
            7000
          );
          responseText = fallbackResponse.text?.trim() || "{}";
        } catch (secErr) {
          throw firstErr;
        }
      }
      const cleanJson = responseText.replace(/^```json\s*|\s*```$/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      let phonetic = parsed.phonetic || "";
      if (phonetic && !phonetic.startsWith("/") && !phonetic.startsWith("[")) {
        phonetic = `/${phonetic}/`;
      }

      return res.json({
        phonetic: phonetic || null,
        suggestedMeaning: parsed.suggestedMeaning || null,
        example: parsed.example || null,
      });
    } catch (err: any) {
      console.warn("AI generation not available, falling back to linguistic dictionary:", err?.message || err);
      
      // Fallback 1: English Free Dictionary API
      try {
        const { word } = req.body || {};
        const cleanWord = String(word).trim();
        const dictRes = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
        );
        if (dictRes.ok) {
          const dictData: any = await dictRes.json();
          if (Array.isArray(dictData) && dictData.length > 0) {
            const entry = dictData[0];
            let foundPhonetic = entry.phonetic || null;
            if (!foundPhonetic && Array.isArray(entry.phonetics)) {
              const valid = entry.phonetics.find((p: any) => p.text && p.text.trim());
              if (valid) foundPhonetic = valid.text;
            }
            let def = null;
            let ex = null;
            if (entry.meanings && entry.meanings.length > 0) {
              const firstDef = entry.meanings[0]?.definitions?.[0];
              if (firstDef) {
                def = firstDef.definition || null;
                ex = firstDef.example || null;
              }
            }
            if (foundPhonetic) {
              return res.json({
                phonetic: foundPhonetic,
                suggestedMeaning: def,
                example: ex,
              });
            }
          }
        }
      } catch (e) {
        // continue to Wiktionary
      }

      // Fallback 2: Wiktionary International Phonetic Alphabet (any language)
      try {
        const { word } = req.body || {};
        const cleanWord = String(word).trim().toLowerCase();
        const wikRes = await fetch(
          `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(cleanWord)}&prop=wikitext&format=json`
        );
        if (wikRes.ok) {
          const wikData: any = await wikRes.json();
          const wikitext = wikData.parse?.wikitext?.["*"] || "";
          const match = wikitext.match(/\{\{IPA\|[^|]+\|([^}|]+)/);
          if (match) {
            let ipa = match[1]
              .replace(/^\[|\]$/g, "")
              .replace(/^\/|\/$/g, "")
              .trim();
            if (ipa) {
              return res.json({
                phonetic: `/${ipa}/`,
                suggestedMeaning: null,
                example: null,
              });
            }
          }
        }
      } catch (wikErr) {
        console.warn("Wiktionary lookup failed:", wikErr);
      }

      return res.json({
        phonetic: null,
        suggestedMeaning: null,
        example: null,
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
