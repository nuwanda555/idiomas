import {
  LanguageCode,
  LanguageInfo,
  DailyExercise,
  TutorScenario,
  VocabularyCard,
  PronunciationExercise
} from '../types';

export const LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  de: {
    id: 'de',
    name: 'Alemán',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    accentColor: 'from-amber-500 to-rose-600',
    voiceLang: 'de-DE',
    greeting: 'Guten Tag! Willkommen!',
    description: 'Domina los casos (Akkusativ/Dativ), géneros der/die/das y las vocales con Umlaut (ä, ö, ü).',
    phoneticHighlights: [
      'Umlauts (ä, ö, ü): redondear labios con firmeza',
      'Sonido "ch": ich-Laut suave vs. ach-Laut gutural',
      'La "r" uvular alemana vibrada suavemente',
      'Desonorización final: la "d" suena similar a "t" al final de palabra'
    ]
  },
  en: {
    id: 'en',
    name: 'Inglés',
    nativeName: 'English',
    flag: '🇬🇧',
    accentColor: 'from-blue-600 to-indigo-600',
    voiceLang: 'en-US',
    greeting: 'Hello there! Welcome!',
    description: 'Perfecciona phrasal verbs, el ritmo acentual, el sonido schwa /ə/ y los sonidos "TH".',
    phoneticHighlights: [
      'Sonidos "TH": /θ/ sordo (think) y /ð/ sonoro (this) con lengua entre dientes',
      'La vocal schwa /ə/ en sílabas átonas',
      'Connected speech: enlazar consonante final con vocal siguiente',
      'Terminaciones regulares -ed (/t/, /d/, /ɪd/)'
    ]
  },
  zh: {
    id: 'zh',
    name: 'Chino Mandarín',
    nativeName: '中文 (Zhōngwén)',
    flag: '🇨🇳',
    accentColor: 'from-red-600 to-amber-500',
    voiceLang: 'zh-CN',
    greeting: '你好！欢迎来到中文世界！',
    description: 'Aprende los 4 tonos melódicos, el sistema Pinyin y la estructura directa de oraciones en caracteres Hanzi.',
    phoneticHighlights: [
      '1er tono (ā): Alto y plano como sostener una nota',
      '2do tono (á): Ascendente como si hicieras una pregunta',
      '3er tono (ǎ): Desciende y vuelve a subir ligeramente',
      '4to tono (à): Cortante y descendente con energía',
      'Consonantes retroflejas: zh, ch, sh, r con lengua curvada hacia arriba'
    ]
  }
};

// --- DAILY EXERCISES FOR EACH LANGUAGE ---
export const DAILY_EXERCISES: Record<LanguageCode, DailyExercise[]> = {
  de: [
    {
      id: 'de_ex_1',
      language: 'de',
      level: 'A1',
      type: 'vocabulary',
      title: 'Géneros y Artículos: El Café',
      instruction: 'Selecciona el artículo y palabra correcta para "el café caliente":',
      targetText: 'der heiße Kaffee',
      translation: 'el café caliente',
      gender: 'der',
      options: ['der heiße Kaffee', 'die heiße Kaffee', 'das heiße Kaffee', 'den heiße Kaffee'],
      correctAnswer: 'der heiße Kaffee',
      exampleSentence: 'Ich trinke jeden Morgen der heiße Kaffee.',
      exampleTranslation: 'Bebo el café caliente cada mañana.',
      grammarNote: 'En alemán, "Kaffee" es de género masculino: siempre lleva "der" en nominativo.'
    },
    {
      id: 'de_ex_2',
      language: 'de',
      level: 'A1',
      type: 'grammar_syntax',
      title: 'Regla del Verbo en Segunda Posición (V2)',
      instruction: 'Ordena las palabras para formar una frase gramaticalmente correcta en alemán:',
      targetText: 'Heute trinke ich einen Apfelsaft.',
      translation: 'Hoy bebo un zumo de manzana.',
      scrambledWords: ['einen', 'ich', 'Heute', 'Apfelsaft.', 'trinke'],
      correctOrder: ['Heute', 'trinke', 'ich', 'einen', 'Apfelsaft.'],
      grammarNote: '¡Regla de oro alemana! Si la oración comienza con un adverbio temporal ("Heute"), el verbo conjugado ("trinke") DEBE ocupar el segundo puesto.'
    },
    {
      id: 'de_ex_3',
      language: 'de',
      level: 'A1',
      type: 'pronunciation',
      category: 'daily',
      difficulty: 'medium',
      title: 'Práctica Fonética: Umlaut Ö y Sonido CH',
      instruction: 'Presiona el micrófono y pronuncia la siguiente frase con claridad:',
      targetText: 'Ich möchte bitte ein Brötchen.',
      translation: 'Me gustaría un panecillo, por favor.',
      phoneticFocus: 'Presta atención a "möchte" (redondea los labios como una "o" pero di "e") e "Ich" (ich-Laut suave sin carraspear).'
    },
    {
      id: 'de_ex_4',
      language: 'de',
      level: 'A2',
      type: 'grammar_fill',
      title: 'Preposiciones con Acusativo y Dativo',
      instruction: 'Completa el espacio con la opción gramatical correcta:',
      sentenceWithBlank: 'Ich gehe ___ Supermarkt.',
      targetText: 'in den',
      translation: 'Voy al supermercado (dirección/movimiento = acusativo).',
      options: ['in den', 'in dem', 'in der', 'nach den'],
      correctAnswer: 'in den',
      grammarNote: 'Al indicar movimiento o dirección hacia un lugar masculino ("der Supermarkt"), la preposición "in" rige Acusativo: in + den = in den.'
    },
    {
      id: 'de_ex_5',
      language: 'de',
      level: 'A2',
      type: 'listening_quiz',
      title: 'Comprensión Auditiva: Planes de Fin de Semana',
      instruction: 'Escucha el audio y responde a la pregunta:',
      audioPrompt: 'Am Wochenende fahre ich mit dem Zug nach Berlin, um meine Freunde zu besuchen.',
      question: '¿Cómo viajará a Berlín?',
      options: ['En tren (mit dem Zug)', 'En coche (mit dem Auto)', 'En avión (mit dem Flugzeug)', 'En bicicleta (mit dem Fahrrad)'],
      correctAnswer: 'En tren (mit dem Zug)',
      targetText: 'Am Wochenende fahre ich mit dem Zug nach Berlin.',
      translation: 'El fin de semana viajo en tren a Berlín.'
    }
  ],
  en: [
    {
      id: 'en_ex_1',
      language: 'en',
      level: 'A2',
      type: 'vocabulary',
      title: 'Phrasal Verbs Comunes',
      instruction: 'Selecciona la opción correcta para completar la expresión idiomática:',
      targetText: 'looking forward to',
      translation: 'estar deseando / esperar con ilusión',
      options: ['looking forward to', 'looking forward for', 'looking after to', 'looking ahead with'],
      correctAnswer: 'looking forward to',
      exampleSentence: 'I am really looking forward to meeting you soon!',
      exampleTranslation: '¡Tengo muchas ganas de conocerte pronto!',
      grammarNote: 'Recuerda que tras "look forward to", si viene un verbo este lleva terminación -ing: "looking forward to seeing you".'
    },
    {
      id: 'en_ex_2',
      language: 'en',
      level: 'B1',
      type: 'grammar_syntax',
      title: 'Present Perfect vs Past Simple',
      instruction: 'Ordena los bloques de palabras para formar una oración correcta en Present Perfect:',
      targetText: 'Have you ever been to New York before?',
      translation: '¿Alguna vez has estado en Nueva York antes?',
      scrambledWords: ['ever', 'to', 'Have', 'New York', 'you', 'been', 'before?'],
      correctOrder: ['Have', 'you', 'ever', 'been', 'to', 'New York', 'before?'],
      grammarNote: 'Se usa "ever" entre el sujeto y el participio en preguntas sobre experiencias vitales.'
    },
    {
      id: 'en_ex_3',
      language: 'en',
      level: 'A2',
      type: 'pronunciation',
      category: 'daily',
      difficulty: 'medium',
      title: 'Práctica Fonética: El Sonido "TH" y Enlace',
      instruction: 'Habla al micrófono e imita el sonido /θ/ en "think" y /ð/ en "these":',
      targetText: 'I think that these three things are important.',
      translation: 'Creo que estas tres cosas son importantes.',
      phoneticFocus: 'Coloca la punta de la lengua suavemente entre los dientes incisivos superiores e inferiores. No lo sustituyas por "s" o "f".'
    },
    {
      id: 'en_ex_4',
      language: 'en',
      level: 'B1',
      type: 'grammar_fill',
      title: 'Segundo Condicional (Situaciones Hipotéticas)',
      instruction: 'Elige la forma verbal adecuada:',
      sentenceWithBlank: 'If I ___ more time, I would learn Chinese and German simultaneously.',
      targetText: 'had',
      translation: 'Si tuviera más tiempo, aprendería chino y alemán simultáneamente.',
      options: ['had', 'have', 'would have', 'having'],
      correctAnswer: 'had',
      grammarNote: 'En el Second Conditional usamos: If + Past Simple, would + verbo en infinitivo.'
    },
    {
      id: 'en_ex_5',
      language: 'en',
      level: 'A2',
      type: 'listening_quiz',
      title: 'Comprensión Auditiva: Conversación en Aeropuerto',
      instruction: 'Escucha con atención y responde a la pregunta:',
      audioPrompt: 'Attention passengers on flight BA 249 to London Heathrow, please proceed immediately to Gate 14.',
      question: '¿A qué puerta deben dirigirse los pasajeros del vuelo a Londres?',
      options: ['Puerta 14', 'Puerta 40', 'Puerta 24', 'Puerta 4'],
      correctAnswer: 'Puerta 14',
      targetText: 'Please proceed immediately to Gate 14.',
      translation: 'Por favor diríjase de inmediato a la puerta 14.'
    }
  ],
  zh: [
    {
      id: 'zh_ex_1',
      language: 'zh',
      level: 'A1',
      type: 'vocabulary',
      title: 'Saludos y Cortesía en Chino Mandarín',
      instruction: 'Selecciona la traducción correcta para "Encantado de conocerte":',
      targetText: '很高兴认识你',
      pinyin: 'Hěn gāoxìng rènshí nǐ',
      translation: 'Encantado de conocerte',
      options: ['很高兴认识你', '对不起没关系', '请问你贵姓', '祝你一路平安'],
      correctAnswer: '很高兴认识你',
      exampleSentence: '认识你我也很高兴！ (Rènshí nǐ wǒ yě hěn gāoxìng!)',
      exampleTranslation: '¡Conocerte a ti también me alegra mucho!',
      grammarNote: 'En chino, los adjetivos predicativos suelen ir precedidos por 很 (hěn), que funciona como conector natural además de significar "muy".'
    },
    {
      id: 'zh_ex_2',
      language: 'zh',
      level: 'A1',
      type: 'grammar_syntax',
      title: 'Estructura Básica: Tiempo + Sujeto + Verbo + Objeto',
      instruction: 'Ordena los caracteres chinos en el orden gramatical estándar:',
      targetText: '我今天下午喝茶。',
      pinyin: 'Wǒ jīntiān xiàwǔ hē chá.',
      translation: 'Yo hoy por la tarde bebo té.',
      scrambledWords: ['喝茶。', '我', '下午', '今天'],
      correctOrder: ['我', '今天', '下午', '喝茶。'],
      grammarNote: 'En chino mandarín las palabras temporales (hoy, por la tarde) siempre se colocan ANTES del verbo, nunca al final de la oración.'
    },
    {
      id: 'zh_ex_3',
      language: 'zh',
      level: 'A1',
      type: 'pronunciation',
      category: 'daily',
      difficulty: 'medium',
      title: 'Práctica Fonética: Los 4 Tonos y Saludo',
      instruction: 'Pronuncia con claridad respetando los tonos del Pinyin:',
      targetText: '你好，我想喝一杯中国茶。',
      pinyin: 'Nǐ hǎo, wǒ xiǎng hē yì bēi Zhōngguó chá.',
      translation: 'Hola, me gustaría beber una taza de té chino.',
      phoneticFocus: 'Regla del 3er tono: cuando dos terceros tonos van juntos (Nǐ hǎo), el primero se convierte en segundo tono (Ní hǎo).'
    },
    {
      id: 'zh_ex_4',
      language: 'zh',
      level: 'A2',
      type: 'grammar_fill',
      title: 'Clasificadores / Palabras de Medida (量词)',
      instruction: 'Selecciona el clasificador adecuado para objetos planos como libros:',
      sentenceWithBlank: '我想买一___中文书。',
      targetText: '本',
      pinyin: 'Wǒ xiǎng mǎi yì běn Zhōngwén shū.',
      translation: 'Quiero comprar un libro de chino.',
      options: ['本 (běn)', '个 (gè)', '只 (zhī)', '张 (zhāng)'],
      correctAnswer: '本 (běn)',
      grammarNote: 'En chino no se dice "un libro" directamente; siempre es indispensable usar el clasificador específico: 一本书 (yì běn shū).'
    },
    {
      id: 'zh_ex_5',
      language: 'zh',
      level: 'A1',
      type: 'listening_quiz',
      title: 'Comprensión Auditiva: Hora y Reunión',
      instruction: 'Escucha el audio y elige a qué hora es la cita:',
      audioPrompt: '我们明天上午九点半在咖啡馆见。',
      pinyin: 'Wǒmen míngtiān shàngwǔ jiǔ diǎn bàn zài kāfēiguǎn jiàn.',
      question: '¿A qué hora se reunirán mañana?',
      options: ['9:30 AM (九点半)', '8:00 AM (八点)', '10:15 AM (十点一刻)', '2:30 PM (下午两点半)'],
      correctAnswer: '9:30 AM (九点半)',
      targetText: '九点半 (jiǔ diǎn bàn)',
      translation: 'A las 9:30 de la mañana en el café.'
    }
  ]
};

// --- PRONUNCIATION LAB CATALOG ---
export const PRONUNCIATION_DRILLS: Record<LanguageCode, PronunciationExercise[]> = {
  de: [
    {
      id: 'de_p_1',
      language: 'de',
      level: 'A1',
      type: 'pronunciation',
      category: 'daily',
      difficulty: 'easy',
      title: 'Saludos y Cortesía',
      targetText: 'Guten Morgen, wie geht es Ihnen heute?',
      translation: 'Buenos días, ¿cómo se encuentra usted hoy?',
      instruction: 'Entrena la melodía de pregunta y el sonido suave de la "g" y "h".',
      phoneticFocus: 'La "h" en "Ihnen" alarga la "I" previa sin sonar como "j".'
    },
    {
      id: 'de_p_2',
      language: 'de',
      level: 'A2',
      type: 'pronunciation',
      category: 'travel',
      difficulty: 'medium',
      title: 'Pidiendo en el Restaurante',
      targetText: 'Entschuldigung, könnten wir bitte die Speisekarte haben?',
      translation: 'Disculpe, ¿podríamos tener el menú por favor?',
      instruction: 'Articula claramente "Entschuldigung" y el Umlaut "ö" en "könnten".',
      phoneticFocus: 'En "Speisekarte", la "sp" suena como "shp".'
    },
    {
      id: 'de_p_3',
      language: 'de',
      level: 'B1',
      type: 'pronunciation',
      category: 'business',
      difficulty: 'medium',
      title: 'Reunión de Trabajo',
      targetText: 'Ich bin der Meinung, dass wir dieses Projekt erfolgreich abschließen werden.',
      translation: 'Soy de la opinión de que concluiremos este proyecto con éxito.',
      instruction: 'Mantén un ritmo fluido sin perder la precisión de los diptongos "ei" e "ie".',
      phoneticFocus: 'En "Meinung", la terminación "-ung" es nasal velar, sin pronunciar una "g" dura.'
    },
    {
      id: 'de_p_4',
      language: 'de',
      level: 'B2',
      type: 'pronunciation',
      category: 'tongue_twister',
      difficulty: 'hard',
      title: 'Trabalenguas: Fischers Fritze',
      targetText: 'Fischers Fritze fischt frische Fische, frische Fische fischt Fischers Fritze.',
      translation: 'Fritz, el hijo del pescador, pesca pescados frescos...',
      instruction: 'El reto supremo de articulación germánica entre "f", "r" y "sch".',
      phoneticFocus: 'Diferencia estricta entre la "s" sibilante y el grupo "sch" /ʃ/.'
    }
  ],
  en: [
    {
      id: 'en_p_1',
      language: 'en',
      level: 'A1',
      type: 'pronunciation',
      category: 'daily',
      difficulty: 'easy',
      title: 'Daily Introduction',
      targetText: 'Hi, my name is Alex and it is a pleasure to meet you.',
      translation: 'Hola, mi nombre es Alex y es un placer conocerte.',
      instruction: 'Enlaza "it is a" como si fuera una sola palabra /ɪtɪzə/.',
      phoneticFocus: 'Sonido suave de la "z" en "is" y "pleasure" /ʒ/.'
    },
    {
      id: 'en_p_2',
      language: 'en',
      level: 'A2',
      type: 'pronunciation',
      category: 'travel',
      difficulty: 'medium',
      title: 'Ordering Coffee in London',
      targetText: 'Could I please get an iced oat latte with an extra shot of espresso?',
      translation: '¿Podría pedir un latte helado de avena con un shot extra de expreso?',
      instruction: 'Practica la entonación cortés ascendente al final.',
      phoneticFocus: 'La "l" en "could" es muda. No digas "culd", di /kʊd/.'
    },
    {
      id: 'en_p_3',
      language: 'en',
      level: 'B1',
      type: 'pronunciation',
      category: 'business',
      difficulty: 'medium',
      title: 'Professional Presentation',
      targetText: 'Our primary objective is to enhance international communication and fluency.',
      translation: 'Nuestro objetivo principal es mejorar la comunicación internacional y la fluidez.',
      instruction: 'Acentúa las sílabas tónicas: ob-JEC-tive, com-mu-ni-CA-tion, FLU-en-cy.',
      phoneticFocus: 'Sonido de la vocal reducida schwa /ə/ en "objective" /əbˈdʒektɪv/.'
    },
    {
      id: 'en_p_4',
      language: 'en',
      level: 'B2',
      type: 'pronunciation',
      category: 'tongue_twister',
      difficulty: 'hard',
      title: 'Tongue Twister: Betty Botter',
      targetText: 'Betty Botter bought some butter, but she said the butter is bitter.',
      translation: 'Betty Botter compró algo de mantequilla, pero dijo que la mantequilla es amarga.',
      instruction: 'Controla el sonido flapping "t" en el inglés americano o la oclusión clara británica.',
      phoneticFocus: 'Diferenciación de la vocal corta /ʌ/ en "butter" vs. /ɪ/ en "bitter".'
    }
  ],
  zh: [
    {
      id: 'zh_p_1',
      language: 'zh',
      level: 'A1',
      type: 'pronunciation',
      category: 'daily',
      difficulty: 'easy',
      title: 'Saludos y Agradecimientos',
      targetText: '非常感谢你的帮助，明天见！',
      pinyin: 'Fēicháng gǎnxiè nǐ de bāngzhù, míngtiān jiàn!',
      translation: 'Muchas gracias por tu ayuda, ¡hasta mañana!',
      instruction: 'Pronuncia "fēi" en primer tono (plano y sostenido) y "jiàn" con energía en cuarto tono.',
      phoneticFocus: '1er tono en fēi y bāng, 4to tono en jiàn y xiè.'
    },
    {
      id: 'zh_p_2',
      language: 'zh',
      level: 'A2',
      type: 'pronunciation',
      category: 'travel',
      difficulty: 'medium',
      title: 'En el Restaurante Chino',
      targetText: '服务员，我们要两碗牛肉面，少放辣椒。',
      pinyin: 'Fúwùyuán, wǒmen yào liǎng wǎn niúròu miàn, shǎo fàng làjiāo.',
      translation: 'Camarero, queremos dos boles de fideos con ternera, con poco picante.',
      instruction: 'Domina el sonido retroflejo "shǎo" y los tonos consecutivos.',
      phoneticFocus: 'El cambio de tono de 两碗 (liǎng wǎn: dos 3ros tonos juntos).'
    },
    {
      id: 'zh_p_3',
      language: 'zh',
      level: 'B1',
      type: 'pronunciation',
      category: 'business',
      difficulty: 'medium',
      title: 'Cooperación Comercial',
      targetText: '很高兴能与贵公司建立长期的合作关系。',
      pinyin: 'Hěn gāoxìng néng yǔ guì gōngsī jiànlì chángqī de hézuò guānxì.',
      translation: 'Es un placer establecer una relación de cooperación a largo plazo con su empresa.',
      instruction: 'Ritmo formal en bloques de palabras (Hěn gāoxìng / néng yǔ guì gōngsī / jiànlì chángqī...).',
      phoneticFocus: 'Tono plano y claro en "gōngsī" (1er tono doble).'
    },
    {
      id: 'zh_p_4',
      language: 'zh',
      level: 'B2',
      type: 'pronunciation',
      category: 'tongue_twister',
      difficulty: 'hard',
      title: 'Trabalenguas Legendario: Cuatro y Diez',
      targetText: '四是四，十是十，十四是十四，四十是四十。',
      pinyin: 'Sì shì sì, shí shì shí, shí sì shì shí sì, sì shí shì sì shí.',
      translation: 'Cuatro es cuatro, diez es diez, catorce es catorce, cuarenta es cuarenta.',
      instruction: 'El trabalenguas chino por excelencia para dominar "s" (dental) vs. "sh" (retrofleja) y 4to tono vs. 2do tono.',
      phoneticFocus: 'Sì (4to tono, s plana) vs. Shí (2do tono ascendente, lengua curvada).'
    }
  ]
};

// --- TUTOR CONVERSATION SCENARIOS ---
export const TUTOR_SCENARIOS: Record<LanguageCode, TutorScenario[]> = {
  de: [
    {
      id: 'de_sc_cafe',
      title: 'Café en Berlín Mitte',
      role: 'Camarero berlinés amable',
      userRole: 'Cliente en la cafetería',
      setting: 'Una acogedora cafetería en el centro de Berlín.',
      icon: 'Coffee',
      initialMessage: 'Hallo! Willkommen im Café Morgenstern. Was darf ich Ihnen heute Schönes bringen?',
      initialTranslation: '¡Hola! Bienvenido al Café Morgenstern. ¿Qué le puedo traer hoy de rico?'
    },
    {
      id: 'de_sc_interview',
      title: 'Entrevista de Trabajo en Alemania',
      role: 'Reclutador de recursos humanos',
      userRole: 'Candidato a un puesto',
      setting: 'Oficina moderna en Múnich.',
      icon: 'Briefcase',
      initialMessage: 'Guten Tag! Schön, dass Sie hier sind. Können Sie sich bitte kurz vorstellen und von Ihren Erfahrungen erzählen?',
      initialTranslation: '¡Buenos días! Qué bueno que esté aquí. ¿Podría presentarse brevemente y hablar de su experiencia?'
    },
    {
      id: 'de_sc_train',
      title: 'En la Estación Central (Hauptbahnhof)',
      role: 'Agente de información de Deutsche Bahn',
      userRole: 'Viajero preguntando por su tren',
      setting: 'Ventanilla de billetes de tren en Frankfurt.',
      icon: 'Train',
      initialMessage: 'Guten Tag. Wie kann ich Ihnen bei Ihrer Reiseauskunft helfen?',
      initialTranslation: 'Buenos días. ¿Cómo puedo ayudarle con la información de su viaje?'
    }
  ],
  en: [
    {
      id: 'en_sc_cafe',
      title: 'Coffee Shop in Soho, London',
      role: 'Barista',
      userRole: 'Customer ordering breakfast',
      setting: 'A bustling coffee shop in London.',
      icon: 'Coffee',
      initialMessage: 'Hi there! Welcome in. What can I get started for you today?',
      initialTranslation: '¡Hola! Bienvenido. ¿Qué te puedo ir preparando hoy?'
    },
    {
      id: 'en_sc_interview',
      title: 'Tech Job Interview',
      role: 'Hiring Manager',
      userRole: 'Software / Project candidate',
      setting: 'A video call interview for an international company.',
      icon: 'Briefcase',
      initialMessage: 'Great to meet you! To start off, could you walk me through your background and what motivated you to apply?',
      initialTranslation: '¡Encantado de conocerte! Para empezar, ¿podrías resumirme tu trayectoria y qué te motivó a postular?'
    },
    {
      id: 'en_sc_travel',
      title: 'Hotel Check-in in New York',
      role: 'Front Desk Receptionist',
      userRole: 'Guest checking in',
      setting: 'Hotel reception in Manhattan.',
      icon: 'Hotel',
      initialMessage: 'Good evening! Welcome to the Grand Central Hotel. Do you have a reservation with us tonight?',
      initialTranslation: '¡Buenas noches! Bienvenido al Hotel Grand Central. ¿Tiene una reserva con nosotros esta noche?'
    }
  ],
  zh: [
    {
      id: 'zh_sc_restaurant',
      title: 'Restaurante en Pekín (北京餐馆)',
      role: 'Camarero atento en Pekín',
      userRole: 'Comensal pidiendo cena',
      setting: 'Restaurante tradicional cerca del Templo del Cielo.',
      icon: 'Utensils',
      initialMessage: '您好！欢迎光临！请问几位？想吃点什么特色菜？',
      initialPinyin: 'Nín hǎo! Huānyíng guānglín! Qǐngwèn jǐ wèi? Xiǎng chī diǎn shénme tèsè cài?',
      initialTranslation: '¡Hola! ¡Bienvenido! ¿Cuántas personas son? ¿Qué platos típicos les gustaría probar?'
    },
    {
      id: 'zh_sc_market',
      title: 'Mercado de la Seda (丝绸市场)',
      role: 'Vendedor entusiasta en el mercado',
      userRole: 'Comprador regateando precio',
      setting: 'Un animado puesto de recuerdos y artesanías en Shanghái.',
      icon: 'ShoppingBag',
      initialMessage: '帅哥/美女，来看一看！正宗的中国茶具和真丝围巾，喜欢的话可以给你打折！',
      initialPinyin: 'Shuàigē / Měinǚ, lái kàn yí kàn! Zhèngzōng de Zhōngguó chájù hé zhēnsī wéijīn, xǐhuan de huà kěyǐ gěi nǐ dǎzhé!',
      initialTranslation: '¡Hola amigo/amiga, ven a echar un vistazo! Auténticos juegos de té chino y bufandas de seda pura. ¡Si te gusta te hago un descuento!'
    },
    {
      id: 'zh_sc_friends',
      title: 'Conociendo Nuevos Amigos (结交新朋友)',
      role: 'Estudiante universitario nativo',
      userRole: 'Estudiante internacional',
      setting: 'Cafetería de la universidad en Hangzhou.',
      icon: 'Smile',
      initialMessage: '你好！你是新来的留学生吧？你的中文说得真棒！你学中文多久了？',
      initialPinyin: 'Nǐ hǎo! Nǐ shì xīn lái de liúxuéshēng ba? Nǐ de Zhōngwén shuō de zhēn bàng! Nǐ xué Zhōngwén duōjiǔ le?',
      initialTranslation: '¡Hola! Eres un estudiante de intercambio nuevo, ¿verdad? ¡Tu chino es genial! ¿Cuánto tiempo llevas aprendiendo chino?'
    }
  ]
};

// --- VOCABULARY SRS DECKS ---
export const VOCABULARY_DECKS: Record<LanguageCode, VocabularyCard[]> = {
  de: [
    {
      id: 'v_de_1',
      language: 'de',
      word: 'das Buch',
      gender: 'das',
      translation: 'el libro',
      category: 'Objetos y Educación',
      ipa: '/buːx/',
      example: 'Ich lese jeden Abend ein spannendes Buch.',
      exampleTranslation: 'Leo un libro apasionante cada noche.',
      level: 'A1'
    },
    {
      id: 'v_de_2',
      language: 'de',
      word: 'die Freiheit',
      gender: 'die',
      translation: 'la libertad',
      category: 'Conceptos y Sociedad',
      ipa: '/ˈfʁaɪ̯haɪ̯t/',
      example: 'Die persönliche Freiheit ist ein hohes Gut.',
      exampleTranslation: 'La libertad personal es un bien muy valioso.',
      level: 'B1'
    },
    {
      id: 'v_de_3',
      language: 'de',
      word: 'der Schlüssel',
      gender: 'der',
      translation: 'la llave',
      category: 'Casa y Cotidiano',
      ipa: '/ˈʃlʏsl̩/',
      example: 'Hast du meinen Schlüssel für die Wohnung gesehen?',
      exampleTranslation: '¿Has visto mi llave para el apartamento?',
      level: 'A1'
    },
    {
      id: 'v_de_4',
      language: 'de',
      word: 'das Geheimnis',
      gender: 'das',
      translation: 'el secreto / misterio',
      category: 'Emociones y Relaciones',
      ipa: '/ɡəˈhaɪ̯mnɪs/',
      example: 'Kannst du ein wichtiges Geheimnis für dich behalten?',
      exampleTranslation: '¿Puedes guardarte un secreto importante?',
      level: 'A2'
    },
    {
      id: 'v_de_5',
      language: 'de',
      word: 'die Erfahrung',
      gender: 'die',
      translation: 'la experiencia',
      category: 'Trabajo y Vida',
      ipa: '/ɛɐ̯ˈfaːʁʊŋ/',
      example: 'Diese Reise war eine unvergessliche Erfahrung.',
      exampleTranslation: 'Este viaje fue una experiencia inolvidable.',
      level: 'A2'
    }
  ],
  en: [
    {
      id: 'v_en_1',
      language: 'en',
      word: 'resilience',
      translation: 'resiliencia / capacidad de superación',
      category: 'Personalidad y Mentalidad',
      ipa: '/rɪˈzɪliəns/',
      example: 'She showed great resilience in overcoming the challenges.',
      exampleTranslation: 'Ella demostró gran resiliencia al superar los desafíos.',
      level: 'B2'
    },
    {
      id: 'v_en_2',
      language: 'en',
      word: 'serendipity',
      translation: 'serendipia / hallazgo afortunado',
      category: 'Vocabulario Avanzado',
      ipa: '/ˌserənˈdɪpəti/',
      example: 'Meeting my co-founder in that coffee shop was pure serendipity.',
      exampleTranslation: 'Conocer a mi cofundador en esa cafetería fue pura serendipia.',
      level: 'C1'
    },
    {
      id: 'v_en_3',
      language: 'en',
      word: 'breakthrough',
      translation: 'avance decisivo / descubrimiento clave',
      category: 'Ciencia e Innovación',
      ipa: '/ˈbreɪkθruː/',
      example: 'Scientists made a major breakthrough in renewable energy.',
      exampleTranslation: 'Los científicos lograron un gran avance en energía renovable.',
      level: 'B1'
    },
    {
      id: 'v_en_4',
      language: 'en',
      word: 'effortless',
      translation: 'sin esfuerzo / natural / fluido',
      category: 'Habilidades',
      ipa: '/ˈefərtləs/',
      example: 'With daily practice, speaking fluently will feel effortless.',
      exampleTranslation: 'Con práctica diaria, hablar con fluidez se sentirá natural y sin esfuerzo.',
      level: 'B1'
    }
  ],
  zh: [
    {
      id: 'v_zh_1',
      language: 'zh',
      word: '朋友',
      pinyin: 'péngyou',
      translation: 'amigo / amigos',
      category: 'Relaciones',
      tones: [2, 5],
      example: '有朋自远方来，不亦乐乎？',
      exampleTranslation: 'Tener amigos que vienen de lejos, ¿no es una gran alegría? (Confucio)',
      level: 'A1'
    },
    {
      id: 'v_zh_2',
      language: 'zh',
      word: '努力',
      pinyin: 'nǔlì',
      translation: 'esforzarse / trabajador',
      category: 'Mentalidad y Estudio',
      tones: [3, 4],
      example: '只要努力学习，你的汉语一定会越来越流利。',
      exampleTranslation: 'Siempre que estudies con esfuerzo, tu chino será cada vez más fluido.',
      level: 'A2'
    },
    {
      id: 'v_zh_3',
      language: 'zh',
      word: '希望',
      pinyin: 'xīwàng',
      translation: 'esperanza / desear',
      category: 'Emociones y Metas',
      tones: [1, 4],
      example: '我希望今年能去中国旅游。',
      exampleTranslation: 'Espero poder viajar a China este año.',
      level: 'A2'
    },
    {
      id: 'v_zh_4',
      language: 'zh',
      word: '时间',
      pinyin: 'shíjiān',
      translation: 'tiempo (duración / momento)',
      category: 'Tiempo y Rutina',
      tones: [2, 1],
      example: '时间过得真快，我们已经学了很多新单词。',
      exampleTranslation: 'El tiempo pasa volando, ya hemos aprendido muchas palabras nuevas.',
      level: 'A1'
    }
  ]
};

// --- SPONTANEOUS FREE SPEECH TOPICS ---
export const FREE_SPEECH_PROMPTS: Record<LanguageCode, { id: string; prompt: string; translation: string; suggestedKeywords: string[] }[]> = {
  de: [
    {
      id: 'de_fs_1',
      prompt: 'Beschreibe deinen perfekten Tag von morgens bis abends.',
      translation: 'Describe tu día perfecto de la mañana a la noche.',
      suggestedKeywords: ['aufstehen', 'Kaffee trinken', 'spazieren gehen', 'Freunde treffen', 'gemütlich']
    },
    {
      id: 'de_fs_2',
      prompt: 'Warum möchtest du Deutsch lernen und welche Ziele hast du?',
      translation: '¿Por qué quieres aprender alemán y qué metas tienes?',
      suggestedKeywords: ['Karriere', 'Reisen', 'Kultur', 'Sprachkenntnisse', 'Zukunft']
    }
  ],
  en: [
    {
      id: 'en_fs_1',
      prompt: 'Describe your favorite movie or book and explain why you love it.',
      translation: 'Describe tu película o libro favorito y explica por qué te encanta.',
      suggestedKeywords: ['plot', 'characters', 'inspiring', 'unforgettable', 'masterpiece']
    },
    {
      id: 'en_fs_2',
      prompt: 'Talk about an important lesson or challenge you overcame recently.',
      translation: 'Habla sobre una lección importante o un desafío que superaste recientemente.',
      suggestedKeywords: ['challenge', 'perseverance', 'growth', 'outcome', 'valuable']
    }
  ],
  zh: [
    {
      id: 'zh_fs_1',
      prompt: '介绍一下你最喜欢的中国食物，或者你平时的饮食习惯。',
      translation: 'Presenta tu comida china favorita o tus hábitos alimentarios habituales.',
      suggestedKeywords: ['包子 (bāozi)', '火锅 (huǒguō)', '美味 (měiwèi)', '健康 (jiànkāng)', '喜欢 (xǐhuan)']
    },
    {
      id: 'zh_fs_2',
      prompt: '谈谈你学习中文的经历：你觉得最有趣和最有挑战的是什么？',
      translation: 'Habla sobre tu experiencia aprendiendo chino: ¿qué te parece lo más divertido y desafiante?',
      suggestedKeywords: ['声调 (shēngdiào)', '汉字 (hànzì)', '发音 (fāyīn)', '进步 (jìnbù)', '流利 (liúlì)']
    }
  ]
};
