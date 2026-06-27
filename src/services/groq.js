// Service to interface with Groq API for Mental Wellness Tracker

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.3-70b-versatile"; // High-power, fast Llama model on Groq

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

// Generate fallback mock analysis if API key is not provided (Demo Mode)
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

  if (lower.includes("physics") || lower.includes("math") || lower.includes("mock") || lower.includes("test")) {
    moodScore = 4;
    stressors = ["Mock Test Results", "Academic Anxiety"];
    burnoutLevel = "high";
    copingStrategies = [
      "Review your test errors objectively without attaching your self-worth to the score.",
      "Take a 15-minute physical walk outside to reset your focus.",
      "Seek peer study support or discuss the difficult topics with a mentor."
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
  } else if (lower.includes("happy") || lower.includes("good") || lower.includes("cracked") || lower.includes("solved")) {
    moodScore = 8;
    stressors = ["Minor Time Management"];
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

export async function analyzeJournal(text, apiKey) {
  if (!apiKey || apiKey === "demo") {
    // Return mock response after a short delay to simulate network latency
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isCrisis: checkCrisisTrigger(text),
          analysis: getMockAnalysis(text)
        });
      }, 1200);
    });
  }

  const isCrisis = checkCrisisTrigger(text);

  const systemPrompt = `You are a professional student wellness AI. Your task is to analyze the student's journal entry and return a structured JSON report regarding their mental well-being, stressors, and personalized advice.
You MUST respond with a valid JSON object ONLY. Do not include any markdown styling, conversational text, or explanation. 

Target structure:
{
  "moodScore": number (1 to 10, where 1 is extremely stressed/depressed and 10 is joyful/focused),
  "primaryStressors": string[] (max 3 main sources of stress identified, e.g., "physics preparation", "lack of sleep", "peer pressure"),
  "burnoutIndicator": string ("low", "medium", or "high"),
  "copingStrategies": string[] (2-3 highly customized, actionable, science-backed student coping strategies),
  "reflections": string[] (1-2 highly empathetic, cognitive-behavioral journaling prompts or reflective questions tailored to their current stressor)
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is my journal entry: "${text}"` }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsed = JSON.parse(resultText);

    return {
      isCrisis,
      analysis: parsed
    };
  } catch (error) {
    console.error("Error analyzing journal with Groq:", error);
    // Fallback to local analysis on error so the app doesn't crash
    return {
      isCrisis,
      analysis: getMockAnalysis(text),
      isError: true,
      errorMessage: error.message
    };
  }
}

export async function getChatResponse(messages, context, apiKey) {
  const isCrisis = checkCrisisTrigger(messages[messages.length - 1]?.content);
  
  if (isCrisis) {
    return {
      isCrisis: true,
      text: "I want you to know that you are not alone, and your life is incredibly valuable. I am here to support you, but as an AI, I cannot provide professional crisis support. Please connect with someone who can help. There are free, confidential resources available right now."
    };
  }

  if (!apiKey || apiKey === "demo") {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
        let reply = "I hear you, and it's completely normal to feel this pressure. Preparing for competitive exams is a marathon. What subject or section is feeling the most overwhelming right now?";
        
        if (lastUserMessage.includes("tired") || lastUserMessage.includes("sleep")) {
          reply = "I understand. Studying while exhausted is like running with weights. Have you considered taking a guilt-free 20-minute power nap right now? Rest is active preparation!";
        } else if (lastUserMessage.includes("fail") || lastUserMessage.includes("scared") || lastUserMessage.includes("worry")) {
          reply = "Fear of failure can be paralyzing, especially when you've invested so much time. Try to separate your mock exam scores from your ultimate potential. What is one topic we can tackle in a small 15-minute study session?";
        } else if (lastUserMessage.includes("parent") || lastUserMessage.includes("family")) {
          reply = "Dealing with parental expectations on top of self-imposed pressure is extremely heavy. Remember that their concern often stems from love, even if it feels like pressure. Try writing down your feelings or speaking with a trusted friend.";
        } else if (lastUserMessage.includes("thank") || lastUserMessage.includes("bye")) {
          reply = "You're very welcome! I'm always here for you. Remember to take care of yourself, breathe, and take it one step at a time. You've got this!";
        }
        
        resolve({
          isCrisis: false,
          text: reply
        });
      }, 1000);
    });
  }

  const { examType, currentMood, activeStressors } = context;
  
  const systemPrompt = `You are "Aura", an empathetic, supportive, and active-listening wellness companion for students preparing for high-stakes competitive exams (e.g. ${examType || "competitive entrance exams"}).
The student's current mood score is ${currentMood || "unspecified"} (out of 10), and their main stressors are: ${activeStressors ? activeStressors.join(", ") : "general exam pressure"}.

Your guidelines:
1. Show deep empathy, active listening, and warmth. Never judge, dismiss, or lecture.
2. Keep your responses relatively short, conversational, and easy to read (max 3-4 sentences). Use bullet points only if offering coping steps.
3. Help the student reframe negative thoughts. Remind them that exams do not define their self-worth.
4. Suggest practical, rapid student-friendly mindfulness techniques (e.g., box breathing, neck rolls, water breaks) where appropriate.
5. If the student displays signs of extreme distress or crisis, immediately trigger crisis guidance. Do not act as a clinical therapist. Always remain warm, grounding, and kind.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-6) // Keep the last 6 messages for context to avoid token bloat
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status: ${response.status}`);
    }

    const data = await response.json();
    return {
      isCrisis: false,
      text: data.choices[0].message.content
    };
  } catch (error) {
    console.error("Error in Aura Chat:", error);
    // Fallback response on error
    return {
      isCrisis: false,
      text: "I'm having a small connection issue, but I'm still here for you in spirit. Remember to take a deep, slow breath, exhale fully, and remind yourself that you are doing the best you can."
    };
  }
}
