// Service to interface with Groq API for Mental Wellness Tracker

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY_MODEL = "llama-3.3-70b-versatile"; 
const FALLBACK_MODELS = ["llama-3.1-8b-instant"];

// Crisis words detection for instant safety trigger (Security parameter)
const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "want to die", "end my life", "self-harm", "self harm", 
  "cutting myself", "hopeless", "better off dead", "don't want to live"
];

export function checkCrisisTrigger(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lower.includes(keyword));
}

// Generate fallback mock analysis if API key is not provided or offline
function getMockAnalysis(text) {
  const lower = text.toLowerCase();
  let moodScore = 6;
  let stressors = ["Exam pressure"];
  let burnoutLevel = "medium";
  let copingStrategies = [
    "Practice Box Breathing (4 seconds inhale, 4 hold, 4 exhale, 4 hold) for 3 cycles.",
    "Divide your syllabus into micro-tasks of 25 minutes (Pomodoro technique)."
  ];
  let reflections = [
    "What is one small win you achieved today, even if it feels minor?"
  ];

  if (lower.includes("physics") || lower.includes("math") || lower.includes("mock") || lower.includes("test") || lower.includes("backlog")) {
    moodScore = 4;
    stressors = ["Mock Test Results", "Academic Backlog", "Exam Anxiety"];
    burnoutLevel = "high";
    copingStrategies = [
      "Break your backlog into 30-minute digestible topic blocks instead of looking at the full chapter.",
      "Review your test errors objectively without attaching your self-worth to the score.",
      "Take a 15-minute physical walk outside to reset your brain focus."
    ];
    reflections = [
      "Remember that a mock test is a diagnostic tool, not your final result. What is one specific topic you can review tomorrow?"
    ];
  } else if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted")) {
    moodScore = 5;
    stressors = ["Sleep Deprivation", "Physical Fatigue"];
    burnoutLevel = "high";
    copingStrategies = [
      "Set a hard cut-off for studying at least 1 hour before sleep.",
      "Avoid screens (phone/laptop) for 30 minutes before bed.",
      "Keep a fixed sleep schedule even on weekends."
    ];
    reflections = [
      "How did your energy levels affect your focus today? Would sleeping 1 hour more actually make you more productive?"
    ];
  } else if (lower.includes("parent") || lower.includes("mom") || lower.includes("dad") || lower.includes("family")) {
    moodScore = 5;
    stressors = ["Family Expectations", "External Pressure"];
    burnoutLevel = "medium";
    copingStrategies = [
      "Have an honest conversation with your parents about your effort levels and anxiety.",
      "Create boundaries for study hours where you can focus undisturbed.",
      "Remind yourself that your worth is independent of others' expectations."
    ];
    reflections = [
      "Can you list two things you are proud of doing today that had nothing to do with external approval?"
    ];
  } else if (lower.includes("happy") || lower.includes("good") || lower.includes("cracked") || lower.includes("solved") || lower.includes("hi") || lower.includes("hello")) {
    moodScore = 8;
    stressors = ["General Study Focus"];
    burnoutLevel = "low";
    copingStrategies = [
      "Celebrate today's success by doing something you enjoy for 30 minutes.",
      "Write down what worked well today so you can repeat it tomorrow."
    ];
    reflections = [
      "What did you do differently today that made it go so well?"
    ];
  }

  return {
    moodScore,
    primaryStressors: stressors,
    burnoutIndicator: burnoutLevel,
    copingStrategies,
    reflections
  };
}

function getDynamicChatFallback(lastUserMessage) {
  const lower = lastUserMessage.toLowerCase().trim();

  // 1. Programming & Technology Questions
  if (lower.includes("java")) {
    return `Java is one of the most popular and powerful programming languages in the world! It is widely used to build Android apps, web applications, and large enterprise systems.\n\nKey things to know about Java:\n• **Object-Oriented**: Helps developers write clean, reusable modular code.\n• **Platform Independent**: "Write Once, Run Anywhere" (WORA)—Java runs on Windows, Mac, Linux, or mobile via JVM.\n• **Easy to Learn**: Has a clear, structured syntax.\n\nAre you studying Java for your exams or building a project? Let me know if you need help with a specific concept!`;
  }
  
  if (lower.includes("python")) {
    return `Python is a super friendly and versatile programming language known for its ultra-clean, easy-to-read syntax!\n\nWhy students love Python:\n• **Simple Syntax**: Reads almost like normal English.\n• **Huge Capabilities**: Used for AI, Data Science, Web Development, and Automation.\n• **Great for Beginners**: Perfect first language to learn programming fundamentals.`;
  }

  if (lower.includes("coding") || lower.includes("programming") || lower.includes("code") || lower.includes("c++")) {
    return `Coding is simply giving step-by-step instructions to a computer to solve problems!\n\nTips for learning programming:\n• Start with one language (like Python or Java) and focus on logic.\n• Practice writing small programs daily rather than just reading theory.\n• Don't fear errors—debugging is where real learning happens!`;
  }

  // 2. Physics & Core Science Questions
  if (lower.includes("physics") || lower.includes("newton") || lower.includes("mechanics")) {
    return `Physics is all about understanding how the universe works through formulas and logic!\n\nQuick tips for Physics problems:\n• Always write down the **Given variables** and **Units** first.\n• Draw a rough diagram if applicable (e.g. Free Body Diagrams in mechanics).\n• Pick the core formula before substituting values to avoid algebraic mistakes.`;
  }

  if (lower.includes("chemistry") || lower.includes("organic") || lower.includes("reaction")) {
    return `Chemistry blends theory with problem-solving! For Organic Chemistry, focus on mechanism patterns and functional groups. For Physical Chemistry, treat it like Math by practicing numerical formulas daily.`;
  }

  if (lower.includes("math") || lower.includes("calculus") || lower.includes("equation")) {
    return `Mathematics improves with active problem-solving consistency! Don't just memorize formulas—understand how they are derived and practice 5-10 problems per topic daily.`;
  }

  // 3. Platform & MindEase Questions
  if (lower.includes("mindease") || lower.includes("platform") || lower.includes("app") || lower.includes("tool")) {
    return `MindEase is your 24/7 digital student wellness companion designed specifically to help you manage exam stress and achieve focused success!\n\nHere is what you can do on MindEase:\n• **Daily Journaling**: Write down your thoughts and get live AI emotional analysis & coping strategies.\n• **Mindfulness Hub**: Practice Box Breathing and 4-7-8 relaxation exercises to calm pre-exam anxiety.\n• **Wellness Analytics**: Track your mood trends and stress factors over time.\n• **Chat Companion**: Talk with me anytime you need guidance or study encouragement!`;
  }

  // 4. Greetings
  if (lower === "hi" || lower === "hello" || lower === "hey" || lower.startsWith("hi ") || lower.startsWith("hello ")) {
    return `Hey there! I'm MindEase, your study companion and mentor. I'm right here with you. What subject are you working on or what's on your mind today?`;
  }

  // 5. Exam Pressure, Mock Tests, Burnout & Motivation
  if (lower.includes("test") || lower.includes("mock") || lower.includes("score") || lower.includes("marks")) {
    return `It is completely normal for mock test marks to fluctuate during exam preparation!\n\nRemember:\n• Mock tests are diagnostics to find your weak spots, not a final judgment of your ability.\n• Analyze your incorrect questions: were they silly calculation mistakes or conceptual gaps?\n• Focus on steady 1% daily improvement!`;
  }

  if (lower.includes("tired") || lower.includes("sleep") || lower.includes("exhausted") || lower.includes("burnout")) {
    return `Studying when your brain is exhausted yields very low retention. Please take a guilt-free 20-minute rest or hydration break right now.\n\nYour mind needs recovery cycles just like muscles do to store memory effectively!`;
  }

  // 6. Default Dynamic Intelligent Response for Any Other Question
  return `That's a great question regarding "${lastUserMessage}"!\n\nAs your AI study companion, I'm here to support your learning journey every step of the way. Whether you are revising core concepts, organizing your study schedule, or managing exam pressure, remember to take things one step at a time.\n\nWould you like me to break down this topic further or offer a quick study strategy for it?`;
}

export async function analyzeJournal(text, apiKey) {
  if (!apiKey || apiKey === "demo") {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isCrisis: checkCrisisTrigger(text),
          analysis: getMockAnalysis(text)
        });
      }, 800);
    });
  }

  const isCrisis = checkCrisisTrigger(text);

  const systemPrompt = `You are a professional student wellness AI. Your task is to analyze the student's journal entry and return a structured JSON report regarding their mental well-being, stressors, and personalized advice.
You MUST respond with a valid JSON object ONLY. Do not include any markdown styling, conversational text, or explanation. 

Target structure:
{
  "moodScore": number (1 to 10),
  "primaryStressors": string[],
  "burnoutIndicator": string ("low", "medium", or "high"),
  "copingStrategies": string[],
  "reflections": string[]
}`;

  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];

  for (const modelCandidate of modelsToTry) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelCandidate,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Here is my journal entry: "${text}"` }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        return { isCrisis, analysis: parsed };
      }
    } catch (err) {
      console.warn(`Groq model ${modelCandidate} failed, trying next candidate...`, err);
    }
  }

  // If all API attempts fail, return smart structured analysis fallback
  return {
    isCrisis,
    analysis: getMockAnalysis(text)
  };
}

export async function getChatResponse(messages, context, apiKey) {
  const lastMsgText = messages[messages.length - 1]?.content || "";
  const isCrisis = checkCrisisTrigger(lastMsgText);
  
  if (isCrisis) {
    return {
      isCrisis: true,
      text: "I want you to know that you are not alone, and your life is incredibly valuable. I am here to support you, but as an AI, I cannot provide professional crisis support. Please connect with someone who can help. There are free, confidential resources available right now."
    };
  }

  const { examType, currentMood, activeStressors } = context || {};
  
  const systemPrompt = `You are "MindEase", a brilliant, warm, friendly AI mentor for students.

You know EVERYTHING â€” all school and college subjects (Physics, Math, Chemistry, Biology, History, Geography, Economics), all programming languages (Java, Python, JavaScript, C++, HTML, SQL, etc.), science, world affairs, sports, arts, current events, and much more.

Rules you MUST follow:
â€¢ Answer ANY question the student asks with accurate, real, helpful information.
â€¢ NEVER say "I cannot answer that" for normal academic or general knowledge questions.
â€¢ Use simple, easy, everyday English â€” like a smart friend talking, not a textbook.
â€¢ Keep it conversational and warm. Add encouragement when the student seems stressed.
â€¢ Format answers with short paragraphs and bullet points (â€¢) for clarity.
â€¢ Student context: Exam = ${examType || "Board / JEE / NEET"}, Mood = ${currentMood || "studying"}, Stress = ${activeStressors?.join(", ") || "general exam pressure"}.

Always give a real, correct, helpful answer. Never give a vague or template response.`;

  const cleanMessages = messages.slice(-8).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: String(m.content || '')
  }));

  // Attempt 1: Call Express backend server proxy (/api/chat)
  try {
    const backendRes = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: cleanMessages,
        systemPrompt
      })
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.text) {
        console.log(`[MindEase AI] ✅ Live AI response via backend proxy (${data.model})`);
        return { isCrisis: false, text: data.text };
      }
    }
  } catch (backendErr) {
    console.warn("[MindEase AI] Backend chat proxy unavailable, trying direct Groq API...", backendErr.message);
  }

  // Attempt 2: Direct / Proxy call to Groq API
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || apiKey;
  const ENDPOINTS = ["/groq-api/openai/v1/chat/completions", GROQ_API_URL];
  const MODELS = [PRIMARY_MODEL, ...FALLBACK_MODELS];

  if (GROQ_KEY) {
    for (const endpoint of ENDPOINTS) {
      for (const model of MODELS) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${GROQ_KEY}`
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                ...cleanMessages
              ],
              temperature: 0.75,
              max_tokens: 700
            })
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              const data = await response.json();
              const text = data.choices?.[0]?.message?.content?.trim();
              if (text) {
                console.log(`[MindEase AI] ✅ Live AI response from ${model}`);
                return { isCrisis: false, text };
              }
            }
          }
        } catch (err) {
          console.debug("[MindEase AI] Endpoint attempt failed:", err?.message || err);
        }
      }
    }
  }

  // Final offline fallback
  console.warn("[MindEase AI] All models failed — using local fallback.");
  return {
    isCrisis: false,
    text: getDynamicChatFallback(lastMsgText)
  };
}
