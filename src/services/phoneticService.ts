/**
 * Service to automatically fetch or generate phonetic transcription (IPA)
 * and optional context for words across multiple languages.
 */

export interface PhoneticResult {
  phonetic: string | null;
  suggestedMeaning?: string | null;
  meaningFr?: string | null;
  meaningEn?: string | null;
  example?: string | null;
}

export async function fetchPhonetic(
  word: string,
  languageName: string
): Promise<PhoneticResult> {
  const cleanWord = word.trim();
  if (!cleanWord) {
    return { phonetic: null, suggestedMeaning: null, meaningFr: null, meaningEn: null };
  }

  // 1. Primary: Server-side Gemini endpoint supporting English & French
  try {
    const res = await fetch('/api/phonetic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: cleanWord,
        language: languageName,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.phonetic || data.suggestedMeaning || data.meaningFr || data.meaningEn)) {
        return {
          phonetic: data.phonetic || null,
          suggestedMeaning: data.suggestedMeaning || null,
          meaningFr: data.meaningFr || null,
          meaningEn: data.meaningEn || null,
          example: data.example || null,
        };
      }
    }
  } catch (err) {
    console.warn('Backend phonetic generation not reachable, trying public dictionary fallback:', err);
  }

  // 2. Fallback: Free Dictionary API (especially great for English)
  try {
    const dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
    );
    if (dictRes.ok) {
      const data = await dictRes.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        let foundPhonetic = item.phonetic || null;
        if (!foundPhonetic && Array.isArray(item.phonetics)) {
          const valid = item.phonetics.find((p: any) => p.text && p.text.trim());
          if (valid) foundPhonetic = valid.text;
        }

        let meaning = null;
        let example = null;
        if (item.meanings && item.meanings.length > 0) {
          const firstDef = item.meanings[0]?.definitions?.[0];
          if (firstDef) {
            meaning = firstDef.definition || null;
            if (meaning && typeof meaning === 'string') {
              meaning = meaning.split(';')[0].split('.')[0].trim();
              if (meaning.length > 60) {
                meaning = meaning.slice(0, 57).trim() + '...';
              }
            }
            example = firstDef.example || null;
          }
        }

        if (foundPhonetic || meaning) {
          return {
            phonetic: foundPhonetic,
            suggestedMeaning: meaning,
            example,
          };
        }
      }
    }
  } catch (dictErr) {
    console.warn('Public dictionary fallback failed:', dictErr);
  }

  return { phonetic: null, suggestedMeaning: null };
}
