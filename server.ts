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

  // In-memory cache for fast, quota-friendly lookups
  const phoneticCache = new Map<string, {
    phonetic: string | null;
    suggestedMeaning: string | null;
    meaningFr: string | null;
    meaningEn: string | null;
    example: string | null;
  }>();

  // Pre-seed common words for instant, 0ms latency responses
  const BUILTIN_LEXICON: Record<string, {
    phonetic: string;
    meaningFr?: string;
    meaningEn: string;
    example: string;
  }> = {
    // French
    "bonjour": {
      phonetic: "/bɔ̃.ʒuʁ/",
      meaningFr: "Salutation polie utilisée le matin ou pendant la journée",
      meaningEn: "hello, good morning",
      example: "Bonjour, comment allez-vous aujourd'hui ?"
    },
    "merci": {
      phonetic: "/mɛʁ.si/",
      meaningFr: "Formule de politesse pour exprimer sa gratitude",
      meaningEn: "thank you, thanks",
      example: "Merci beaucoup pour votre aide précieuse."
    },
    "épanouissement": {
      phonetic: "/e.pa.nwi.smɑ̃/",
      meaningFr: "Développement harmonieux des facultés et de la personnalité",
      meaningEn: "fulfillment, flourishing, blossoming",
      example: "L'art et la lecture contribuent à l'épanouissement personnel."
    },
    "démarche": {
      phonetic: "/de.maʁʃ/",
      meaningFr: "Manière de marcher ou méthode adoptée pour agir",
      meaningEn: "approach, process, gait",
      example: "Nous suivons une démarche progressive et structurée."
    },
    "maison": {
      phonetic: "/mɛ.zɔ̃/",
      meaningFr: "Bâtiment destiné au logement des personnes",
      meaningEn: "house, home, dwelling",
      example: "Ils ont acheté une vieille maison au bord de la mer."
    },
    "travail": {
      phonetic: "/tʁa.vaj/",
      meaningFr: "Activité humaine rémunérée ou effort pour réaliser quelque chose",
      meaningEn: "work, labor, job",
      example: "Il aime son travail et ses collègues de bureau."
    },
    "livre": {
      phonetic: "/livʁ/",
      meaningFr: "Ouvrage imprimé relié contenant du texte",
      meaningEn: "book",
      example: "Je lis un livre passionnant avant de dormir."
    },
    "soleil": {
      phonetic: "/sɔ.lɛj/",
      meaningFr: "Étoile centrale de notre système planétaire",
      meaningEn: "sun, sunshine",
      example: "Le soleil brille haut dans le ciel bleu."
    },
    "temps": {
      phonetic: "/tɑ̃/",
      meaningFr: "Durée mesurable ou état de l'atmosphère",
      meaningEn: "time, weather",
      example: "Prendre son temps pour bien apprendre une langue."
    },
    "apprentissage": {
      phonetic: "/a.pʁɑ̃.ti.saʒ/",
      meaningFr: "Action d'acquérir de nouvelles connaissances ou compétences",
      meaningEn: "learning, apprenticeship",
      example: "L'apprentissage régulier mène à la fluidité."
    },
    // English
    "serendipity": {
      phonetic: "/ˌser.ənˈdɪp.ə.t̬i/",
      meaningEn: "fortunate discovery by chance",
      example: "Finding this charming café was pure serendipity."
    },
    "insight": {
      phonetic: "/ˈɪn.saɪt/",
      meaningEn: "deep intuitive understanding",
      example: "The research provides valuable insight into language acquisition."
    },
    "relentless": {
      phonetic: "/rɪˈlent.ləs/",
      meaningEn: "constant, persistent, never stopping",
      example: "Her relentless practice led to remarkable fluency."
    },
    "resilient": {
      phonetic: "/rɪˈzɪl.jənt/",
      meaningEn: "able to recover quickly from difficulties",
      example: "Consistent learners stay resilient through challenges."
    },
    "nuance": {
      phonetic: "/ˈnuː.ɑːns/",
      meaningEn: "subtle difference in meaning or expression",
      example: "Pay attention to the nuance between similar words."
    },
    "perspective": {
      phonetic: "/pɚˈspek.tɪv/",
      meaningEn: "a particular way of viewing things",
      example: "Learning new languages expands your perspective."
    },
    "consistency": {
      phonetic: "/kənˈsɪs.tən.si/",
      meaningEn: "regular, continuous application over time",
      example: "Daily consistency matters more than occasional long sessions."
    }
  };

  // Phonetic & Linguistic Helper Endpoint
  app.post("/api/phonetic", async (req, res) => {
    try {
      const { word, language } = req.body || {};
      if (!word || typeof word !== "string") {
        return res.status(400).json({ error: "Word is required" });
      }

      const langName = language || "English";
      const cleanWord = word.trim();
      const lower = cleanWord.toLowerCase();
      const isFrench =
        langName.toLowerCase().includes("french") ||
        langName.toLowerCase().includes("français") ||
        langName.toLowerCase() === "fr";

      const cacheKey = `${isFrench ? 'fr' : 'en'}:${lower}`;

      // 1. Check in-memory cache
      if (phoneticCache.has(cacheKey)) {
        return res.json(phoneticCache.get(cacheKey));
      }

      // 2. Check built-in lexicon
      if (BUILTIN_LEXICON[lower]) {
        const item = BUILTIN_LEXICON[lower];
        const result = {
          phonetic: item.phonetic,
          suggestedMeaning: isFrench ? item.meaningFr || item.meaningEn : item.meaningEn,
          meaningFr: isFrench ? item.meaningFr || null : null,
          meaningEn: item.meaningEn,
          example: item.example,
        };
        phoneticCache.set(cacheKey, result);
        return res.json(result);
      }

      let prompt = "";
      if (isFrench) {
        prompt = `You are an expert French lexicographer and language teacher.
Given the French word or expression "${cleanWord}":
1. Provide the standard International Phonetic Alphabet (IPA) transcription enclosed in slashes (e.g. /.../).
2. Provide a short definition in French ("meaningFr"): a concise, elegant French definition of 3 to 8 words (e.g. for "épanouissement" -> "développement harmonieux de la personnalité"; for "bonjour" -> "salutation polie pendant la journée").
3. Provide a short meaning in English ("meaningEn"): a crisp English translation or explanation of 2 to 6 words (e.g. for "épanouissement" -> "fulfillment, flourishing"; for "bonjour" -> "hello, good morning").
4. Provide one natural, authentic example sentence in French using this word.

Respond ONLY with valid JSON in this exact structure:
{
  "phonetic": "/.../",
  "meaningFr": "courte définition en français",
  "meaningEn": "crisp short meaning in English",
  "example": "phrase d'exemple en français"
}`;
      } else {
        prompt = `You are an expert English lexicographer and language teacher.
Given the word or expression "${cleanWord}" in ${langName}:
1. Provide the standard International Phonetic Alphabet (IPA) transcription enclosed in slashes (e.g. /.../).
2. Provide a concise, clear short meaning in English ("meaningEn"): a crisp English definition or synonyms of 2 to 6 words (e.g. for "serendipity" -> "pleasant surprise by chance"; for "insight" -> "deep intuitive understanding").
   - IMPORTANT: Only provide the definition in English. Do NOT output any Portuguese or other languages.
3. Provide one natural, authentic example sentence in ${langName} using this word.

Respond ONLY with valid JSON in this exact structure:
{
  "phonetic": "/.../",
  "meaningEn": "crisp short definition in English (2-6 words)",
  "example": "natural example sentence"
}`;
      }

      const ai = getAI();
      let responseText = "";

      // Timeout helper
      const callWithTimeout = async (promise: Promise<any>, ms = 5000) => {
        let timer: any;
        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("Timeout calling AI")), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
      };

      // Model cascade: gemini-3.1-flash-lite (fast & high quota) -> gemini-flash-latest -> gemini-3.8-flash
      const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
      let aiSuccess = false;

      for (const candidateModel of candidateModels) {
        try {
          const response: any = await callWithTimeout(
            ai.models.generateContent({
              model: candidateModel,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                temperature: 0.1,
              },
            }),
            5000
          );
          responseText = response.text?.trim() || "";
          if (responseText && responseText.startsWith("{")) {
            aiSuccess = true;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Model ${candidateModel} error:`, modelErr?.message || modelErr);
          // Try next model in candidateModels
        }
      }

      if (aiSuccess && responseText) {
        const cleanJson = responseText.replace(/^```json\s*|\s*```$/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        let phonetic = parsed.phonetic || "";
        if (phonetic && !phonetic.startsWith("/") && !phonetic.startsWith("[")) {
          phonetic = `/${phonetic}/`;
        }

        const meaningFr = parsed.meaningFr ? String(parsed.meaningFr).trim() : null;
        const meaningEn = parsed.meaningEn
          ? String(parsed.meaningEn).trim()
          : parsed.suggestedMeaning
          ? String(parsed.suggestedMeaning).trim()
          : null;

        const result = {
          phonetic: phonetic || null,
          suggestedMeaning: isFrench ? meaningFr || meaningEn : meaningEn,
          meaningFr: isFrench ? meaningFr : null,
          meaningEn: meaningEn,
          example: parsed.example || null,
        };

        phoneticCache.set(cacheKey, result);
        return res.json(result);
      }

      throw new Error("All AI candidates failed, switching to public dictionaries");
    } catch (err: any) {
      console.warn("AI generation not available, falling back to linguistic dictionary:", err?.message || err);
      
      const { word, language } = req.body || {};
      const cleanWord = String(word || "").trim();
      const langName = language || "English";
      const isFrench =
        langName.toLowerCase().includes("french") ||
        langName.toLowerCase().includes("français") ||
        langName.toLowerCase() === "fr";

      // Fallback 1: English Free Dictionary API (for English words)
      if (!isFrench) {
        try {
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
                  if (def && typeof def === 'string') {
                    def = def.split(';')[0].split('.')[0].trim();
                    if (def.length > 60) {
                      def = def.slice(0, 57).trim() + '...';
                    }
                  }
                  ex = firstDef.example || null;
                }
              }
              if (foundPhonetic || def) {
                return res.json({
                  phonetic: foundPhonetic,
                  suggestedMeaning: def,
                  meaningFr: null,
                  meaningEn: def,
                  example: ex,
                });
              }
            }
          }
        } catch (e) {
          // continue
        }
      }

      // Fallback 2: French Wiktionary API (for French words)
      if (isFrench) {
        try {
          const wikRes = await fetch(
            `https://fr.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(cleanWord.toLowerCase())}&prop=wikitext&format=json`
          );
          if (wikRes.ok) {
            const wikData: any = await wikRes.json();
            const wikitext = wikData.parse?.wikitext?.["*"] || "";
            // Extract French IPA from {{pron|...|fr}}
            const pronMatch = wikitext.match(/\{\{pron\|([^|}]+)\|fr\}\}/i) ||
                             wikitext.match(/\{\{pron\|([^|}]+)\}\}/i);
            let frenchIpa = pronMatch ? `/${pronMatch[1].trim()}/` : null;

            // Extract first definition line starting with #
            const defMatch = wikitext.match(/\n#\s+([^\n#]+)/);
            let defFr = defMatch ? defMatch[1].replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2').replace(/\{\{[^}]+\}\}/g, '').trim() : null;
            if (defFr && defFr.length > 70) {
              defFr = defFr.slice(0, 67).trim() + '...';
            }

            if (frenchIpa || defFr) {
              return res.json({
                phonetic: frenchIpa,
                suggestedMeaning: defFr,
                meaningFr: defFr,
                meaningEn: null,
                example: null,
              });
            }
          }
        } catch (wikErr) {
          console.warn("French Wiktionary lookup failed:", wikErr);
        }
      }

      // Fallback 3: English Wiktionary IPA parser
      try {
        const wikRes = await fetch(
          `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(cleanWord.toLowerCase())}&prop=wikitext&format=json`
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
                meaningFr: null,
                meaningEn: null,
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
        meaningFr: null,
        meaningEn: null,
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
