import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Language voices mapping for gemini-3.8-flash-lite-tts
const VOICE_MAP: Record<string, string> = {
  de: 'Fenrir', // German clear tone
  en: 'Puck',   // English natural tone
  zh: 'Kore',   // Chinese clear pitch
};

// --- ENDPOINT: Text to Speech (TTS) ---
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language = 'en', style } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key not configured. Using client fallback speech synthesis.',
        fallback: true
      });
    }

    const voiceName = VOICE_MAP[language] || 'Puck';
    const speechStyle = style || (
      language === 'de' ? 'Natural and articulate standard German speaker, clear pronunciation' :
      language === 'zh' ? 'Standard Mandarin Chinese speaker, clear tones and precise pinyin pronunciation' :
      'Natural, engaging standard English speaker with clear enunciation'
    );

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: speechStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(502).json({ error: 'No audio returned from Gemini TTS', fallback: true });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(500).json({
      error: error?.message || 'Error generating TTS audio',
      fallback: true
    });
  }
});

// --- ENDPOINT: Audio & Pronunciation Fluency Evaluation ---
app.post('/api/evaluate-fluency', async (req, res) => {
  try {
    const {
      audioBase64,
      mimeType = 'audio/webm',
      transcript,
      targetPhrase,
      targetLanguage, // 'de', 'en', 'zh'
      isFreeSpeech = false,
      context = ''
    } = req.body;

    if (!transcript && !audioBase64) {
      return res.status(400).json({ error: 'Transcript or audio is required for evaluation' });
    }

    if (!ai) {
      // Offline fallback heuristic evaluator
      const fallbackResult = generateLocalFluencyEvaluation(transcript, targetPhrase, targetLanguage);
      return res.json(fallbackResult);
    }

    const langNames: Record<string, string> = {
      de: 'Alemán (Deutsch)',
      en: 'Inglés (English)',
      zh: 'Chino Mandarín (中文)'
    };
    const langLabel = langNames[targetLanguage] || targetLanguage;

    // Prompt instructions for Gemini
    const systemPrompt = `Eres un evaluador lingüístico y fonético de élite para estudiantes de idiomas (${langLabel}).
Evalúas la fluidez, precisión fonética, entonación, gramática y ritmo.
El usuario es hispanohablante aprendiendo ${langLabel}.
Proporciona retroalimentación pedagógica motivadora y precisa en español con consejos fonéticos exactos (por ejemplo: articulación de consonantes, posición de la lengua, vocales con diéresis/umlauts en alemán, los 4 tonos y pinyin en chino mandarín, o los sonidos TH y linking en inglés).

Devuelve EXCLUSIVAMENTE un objeto JSON válido con este formato:
{
  "recognizedText": "lo que dijo o transcribió",
  "overallScore": 85, // número entero 0 a 100
  "pronunciationScore": 88, // 0 a 100
  "fluencyScore": 82, // 0 a 100
  "accuracyScore": 86, // 0 a 100
  "estimatedCEFR": "A2", // A1, A2, B1, B2, C1, C2
  "words": [
    {
      "word": "palabra",
      "status": "perfect" | "good" | "needs_work" | "missed",
      "pinyinOrIPA": "transcripción fonética o pinyin si aplica",
      "phoneticTip": "consejo breve si status != perfect"
    }
  ],
  "phoneticHighlights": [
    "consejo fonético destacado 1",
    "consejo fonético destacado 2"
  ],
  "strengths": [
    "punto fuerte 1",
    "punto fuerte 2"
  ],
  "areasForImprovement": [
    "área a mejorar 1",
    "área a mejorar 2"
  ],
  "feedbackInSpanish": "Resumen motivador de 2 o 3 frases en español con recomendaciones de práctica."
}`;

    let contentsParts: any[] = [];
    if (audioBase64) {
      contentsParts.push({
        inlineData: {
          mimeType: mimeType.split(';')[0],
          data: audioBase64
        }
      });
    }

    const promptText = `
Idioma objetivo: ${langLabel} (${targetLanguage}).
${targetPhrase ? `Frase objetivo esperada: "${targetPhrase}"` : 'Modo: Discurso Libre / Respuesta espontánea'}
${transcript ? `Transcripción obtenida del reconocimiento de voz del usuario: "${transcript}"` : ''}
${context ? `Contexto o ejercicio: ${context}` : ''}
${isFreeSpeech ? 'Evalúa el contenido, coherencia gramatical, riqueza de vocabulario y fluidez espontánea.' : 'Compara lo dicho con la frase objetivo palabra por palabra y analiza la pronunciación fonética.'}
`;
    contentsParts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contentsParts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      // In case json is wrapped in backticks
      const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(clean);
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Fluency evaluation error:', error);
    // Provide a resilient fallback so the user always receives great UI feedback
    const fallback = generateLocalFluencyEvaluation(req.body.transcript, req.body.targetPhrase, req.body.targetLanguage);
    return res.json(fallback);
  }
});

// --- ENDPOINT: Conversational AI Language Tutor ---
app.post('/api/conversation-tutor', async (req, res) => {
  try {
    const {
      language, // 'de', 'en', 'zh'
      messages, // [{ role: 'user' | 'assistant', content: string }]
      scenario, // { id: string, title: string, role: string, userRole: string, setting: string }
      level = 'A2'
    } = req.body;

    const langNames: Record<string, string> = {
      de: 'Alemán (Deutsch)',
      en: 'Inglés (English)',
      zh: 'Chino Mandarín (中文)'
    };
    const langLabel = langNames[language] || language;

    if (!ai) {
      return res.json({
        replyText: language === 'de' ? 'Das ist sehr interessant! Was möchtest du heute noch machen?' :
                   language === 'zh' ? '太棒了！你今天还想做些什么？ (Tài bàng le! Nǐ jīntiān hái xiǎng zuò xiē shénme?)' :
                   'That sounds really great! What else would you like to discuss today?',
        pinyin: language === 'zh' ? 'Tài bàng le! Nǐ jīntiān hái xiǎng zuò xiē shénme?' : undefined,
        translationSpanish: '¡Eso suena muy bien! ¿Qué más te gustaría hacer/hablar hoy?',
        corrections: [],
        suggestedAnswers: [
          language === 'de' ? 'Ich möchte einen Kaffee trinken.' : language === 'zh' ? '我想喝一杯咖啡。' : 'I would like to have a coffee.',
          language === 'de' ? 'Können wir über Reisen sprechen?' : language === 'zh' ? '我们可以聊聊旅游吗？' : 'Can we talk about traveling?'
        ],
        fluencyTip: 'Buen ritmo. Intenta usar conectores como "außerdem", "moreover" o "另外".'
      });
    }

    const systemInstruction = `Eres un tutor nativo de idiomas amable, paciente y pedagógico para estudiantes de ${langLabel} de nivel ${level}.
Escenario de rol actual:
Título: ${scenario?.title || 'Conversación general'}
Tu rol: ${scenario?.role || 'Amigo nativo / Tutor'}
Rol del estudiante: ${scenario?.userRole || 'Estudiante'}
Contexto: ${scenario?.setting || 'Práctica casual'}

INSTRUCCIONES CLAVE:
1. Responde de forma natural y conversacional en ${langLabel}, adaptado al nivel ${level}.
2. Si el idioma es Chino, incluye Pinyin y traducción en español de tu respuesta.
3. Si el estudiante cometió algún error gramatical o de pronunciación/vocabulario en su último mensaje, señálalo con amabilidad pedagógica en el campo "corrections" con la forma correcta y explicación en español. Si no hubo errores, deja "corrections" vacío.
4. Ofrece 2 o 3 opciones breves de respuestas sugeridas que el estudiante podría decir a continuación para mantener el diálogo activo.
5. Da un consejo rápido de fluidez o expresión idiomática en español.

Devuelve EXCLUSIVAMENTE un JSON con:
{
  "replyText": "tu respuesta en ${langLabel}",
  "pinyin": "pinyin si es chino, de lo contrario vacío",
  "translationSpanish": "traducción al español de tu respuesta",
  "corrections": [
    {
      "original": "lo que dijo el usuario incorrecto",
      "correction": "forma correcta",
      "explanation": "explicación breve en español de la regla"
    }
  ],
  "suggestedAnswers": [
    "opción de respuesta sugerida 1 en ${langLabel}",
    "opción de respuesta sugerida 2 en ${langLabel}"
  ],
  "fluencyTip": "consejo de fluidez en español"
}`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const clean = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(clean);
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Conversation tutor error:', error);
    // Graceful pedagogical fallback so dialogue continues seamlessly
    const lang = req.body.language || 'de';
    return res.json({
      replyText: lang === 'de' ? 'Sehr gut verstanden! Möchtest du noch etwas dazu bestellen oder fragen?' :
                 lang === 'zh' ? '明白！你还要点别的什么吗？ (Míngbai! Nǐ hái yào diǎn bié de shénme ma?)' :
                 'Got it! Would you like to add anything else or ask another question?',
      pinyin: lang === 'zh' ? 'Míngbai! Nǐ hái yào diǎn bié de shénme ma?' : undefined,
      translationSpanish: lang === 'de' ? '¡Entendido perfectamente! ¿Te gustaría pedir o preguntar algo más?' :
                          lang === 'zh' ? '¡Comprendido! ¿Quieres pedir algo más?' :
                          '¡Entendido! ¿Te gustaría agregar algo más o hacer otra pregunta?',
      corrections: [],
      suggestedAnswers: [
        lang === 'de' ? 'Nein danke, das ist alles für heute.' : lang === 'zh' ? '不用了，这就够了。' : "No thanks, that will be all.",
        lang === 'de' ? 'Wie viel kostet das zusammen?' : lang === 'zh' ? '一共多少钱？' : "How much is that in total?"
      ],
      fluencyTip: '¡Muy buena iniciativa! Intenta responder usando frases completas para ganar más soltura.'
    });
  }
});

// --- ENDPOINT: Dynamic Daily Exercises Generation ---
app.post('/api/generate-exercises', async (req, res) => {
  try {
    const { language = 'de', topic = 'daily_life', level = 'A1' } = req.body;
    if (!ai) {
      return res.json({ fallback: true, message: 'Using built-in curated exercise catalog' });
    }

    const prompt = `Genera un set de 5 ejercicios diarios de nivel ${level} para aprender ${language === 'de' ? 'Alemán' : language === 'zh' ? 'Chino Mandarín' : 'Inglés'}.
Tema: ${topic}.
El set debe incluir:
1 ejercicio de Gramática (ordenar palabras o completar hueco)
1 ejercicio de Vocabulario clave con contexto
1 ejercicio de Pronunciación guiada con frase objetivo fonética
1 ejercicio de Comprensión auditiva / elección múltiple
1 ejercicio de Reto conversacional o traducción activa

Devuelve un JSON con:
{
  "exercises": [
    {
      "id": "gen_1",
      "type": "grammar" | "vocabulary" | "pronunciation" | "syntax_order",
      "title": "título corto",
      "instructions": "instrucción en español",
      "targetText": "frase o palabra en idioma meta",
      "pinyin": "pinyin si aplica para chino",
      "translation": "traducción al español",
      "grammarNote": "explicación didáctica",
      "options": ["opción 1", "opción 2", "opción 3", "opción 4"], // si aplica
      "correctAnswer": "respuesta correcta",
      "scrambledWords": ["palabra1", "palabra2"], // para sintaxis
      "phoneticFocus": "puntos fonéticos a vigilar"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating exercises:', error);
    return res.json({ fallback: true });
  }
});

// Helper for local fallback evaluation if offline
function generateLocalFluencyEvaluation(transcript: string = '', targetPhrase: string = '', language: string = 'en') {
  const normUser = (transcript || '').trim().toLowerCase().replace(/[.,!?;:'"¿¡]/g, '');
  const normTarget = (targetPhrase || '').trim().toLowerCase().replace(/[.,!?;:'"¿¡]/g, '');

  const userWords = normUser.split(/\s+/).filter(Boolean);
  const targetWords = normTarget.split(/\s+/).filter(Boolean);

  let matchCount = 0;
  const wordAnalysis = (targetWords.length > 0 ? targetWords : userWords).map((w) => {
    const isMatch = userWords.includes(w);
    if (isMatch) matchCount++;
    return {
      word: w,
      status: isMatch ? 'perfect' : 'needs_work',
      phoneticTip: !isMatch ? (
        language === 'de' ? 'Vigila la colocación de la lengua y los acentos tónicos' :
        language === 'zh' ? 'Presta atención a la altura del tono y la inicial' :
        'Cuida la pronunciación de las vocales cortas y consonantes finales'
      ) : undefined
    };
  });

  const total = targetWords.length || 1;
  const ratio = Math.min(1, Math.max(0.4, matchCount / total));
  const score = Math.round(ratio * 92);

  return {
    recognizedText: transcript || targetPhrase,
    overallScore: score,
    pronunciationScore: Math.round(score * 0.98),
    fluencyScore: Math.round(score * 0.95),
    accuracyScore: score,
    estimatedCEFR: score > 85 ? 'B1' : score > 70 ? 'A2' : 'A1',
    words: wordAnalysis,
    phoneticHighlights: [
      language === 'de' ? 'Buen esfuerzo con las vocales del alemán. Recuerda articular bien los finales de palabra.' :
      language === 'zh' ? 'Excelente intento con los tonos del mandarín. El cuarto tono debe ser firme y descendente.' :
      'Buen ritmo en inglés. Mantén las pausas naturales entre grupos de ideas.'
    ],
    strengths: ['Intención comunicativa clara', 'Ritmo de habla constante'],
    areasForImprovement: ['Articulación de sonidos no nativos', 'Mayor confianza en la proyección vocal'],
    feedbackInSpanish: `Has logrado un desempeño sólido (${score}/100). Sigue practicando las palabras marcadas para pulir la exactitud auditiva.`
  };
}

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PolyglotPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
