// Service to interface with Groq API for Mental Wellness Tracker

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY_MODEL = "llama-3.3-70b-versatile"; 
const FALLBACK_MODELS = ["llama-3.1-8b-instant", "llama3-8b-8192", "mixtral-8x7b-32768"];

// Crisis words detection for instant safety trigger (Security parameter)
const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "want to die", "end my life", "self-harm", "self harm", 
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

// Intelligent dynamic chat responses when API fails or offline
function getDynamicChatFallback(lastUserMessage) {
  const lower = lastUserMessage.toLowerCase();
  
  if (lower.includes("physics") || lower.includes("math") || lower.includes("backlog")) {
    return "Handling physics backlogs while balancing new topics can feel overwhelming! Try taking just ONE core numerical problem right now. Solving a single small sub-topic builds momentum faster than stressing over the entire syllabus.";
  } else if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
    return "Hello there! I'm Aura, your study companion. I'm right here with you. What's currently on your mind regarding your preparation today?";
  } else if (lower.includes("test") || lower.includes("mock") || lower.includes("score") || lower.includes("marks")) {
    return "Mock test scores fluctuate constantly during prep season. Try analyzing your test errors categorically—were they conceptual gaps or silly mistakes? That will give you clear action items!";
  } else if (lower.includes("tired") || lower.includes("sleep") || lower.includes("exhausted")) {
    return "Studying while exhausted yields diminishing returns. Please take a guilt-free 20-minute rest or hydration break right now. Your brain needs recovery to retain formulas!";
  } else {
    return "I hear you, and it is completely normal to feel this pressure. Preparing for competitive exams is a marathon. Take a deep breath, exhale slowly, and let's tackle one small topic at a time. What can we focus on next?";
  }
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

  if (!apiKey || apiKey === "demo") {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isCrisis: false,
          text: getDynamicChatFallback(lastMsgText)
        });
      }, 600);
    });
  }

  const { examType, currentMood, activeStressors } = context;
  
  const systemPrompt = `You are "Aura", an empathetic, supportive, and active-listening wellness companion for students preparing for high-stakes competitive exams (e.g. ${examType || "competitive entrance exams"}).
The student's current mood score is ${currentMood || "unspecified"} (out of 10), and their main stressors are: ${activeStressors ? activeStressors.join(", ") : "general exam pressure"}.

Your guidelines:
1. Show deep empathy, active listening, and warmth. Never judge, dismiss, or lecture.
2. Keep your responses relatively short, conversational, and easy to read (max 3-4 sentences). Use bullet points only if offering coping steps.
3. Help the student reframe negative thoughts. Remind them that exams do not define their self-worth.
4. Suggest practical, rapid student-friendly mindfulness techniques (e.g., box breathing, neck rolls, water breaks) where appropriate.`;

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
            ...messages.slice(-6)
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isCrisis: false,
          text: data.choices[0].message.content
        };
      }
    } catch (err) {
      console.warn(`Groq chat model ${modelCandidate} failed, trying next candidate...`, err);
    }
  }

  // Fallback to dynamic empathetic response if API key encounters network issue
  return {
    isCrisis: false,
    text: getDynamicChatFallback(lastMsgText)
  };
}
