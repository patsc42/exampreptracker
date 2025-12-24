
import { GoogleGenAI, Type } from "@google/genai";
import { StudyTask, StudySettings, SubjectType } from "../types";

// Added getStudyMotivation exported member to resolve import error in Dashboard
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
export const getStudyMotivation = async (tasks: StudyTask[]): Promise<string> => {
  if (!apiKey) {
    return "Your journey to 9 A*s starts with today's tasks.";
  }

  const ai = new GoogleGenAI({apiKey});
  const completed = tasks.filter(t => t.isCompleted).length;
  const total = tasks.length;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on my progress (${completed}/${total} tasks done), give me a short (max 15 words) motivational boost for my Cambridge IGCSEs. I want to get 9 A*s.`,
    config: {
      systemInstruction: "You are an encouraging academic mentor for elite students."
    }
  });

  return response.text || "Every minute of study is a step closer to those 9 A*s.";
};

export const generateWeeklyPlan = async (
  input: string | { data: string, mimeType: string },
  settings: StudySettings
): Promise<StudyTask[]> => {
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-pro-preview";
  
  const systemPrompt = `
    You are an expert Cambridge IGCSE Scheduler. 
    Create a highly detailed study plan based on the provided syllabus and user constraints.
    
    CONSTRAINTS:
    - Completion Window: ${settings.completionDays} days.
    - Intensity: ${settings.hoursPerDay} hours/day.
    - Variety: ${settings.subjectsPerDay} subjects/day.
    - Study Days: ${settings.daysPerWeek} days per week.
    - Importance: ${JSON.stringify(settings.subjectImportance)} (higher means more time/focus).
    
    OUTPUT REQUIREMENTS:
    - Return a JSON array of tasks.
    - Each task must have: subject, topic, week (starting from 1), day (0 for Monday, 6 for Sunday), duration (hours), and priority ('low', 'medium', or 'high').
    - Distribute topics logically (basics before advanced).
    - Ensure the total subjects per day does not exceed ${settings.subjectsPerDay}.
    - Subjects allowed: Math, Physics, Chemistry, Economics, Biology, English, Spanish, Computer Science.
  `;

  let contents: any;
  if (typeof input === 'string') {
    contents = { parts: [{ text: input }] };
  } else {
    contents = {
      parts: [
        { text: "Extract and schedule this syllabus based on my settings." },
        { inlineData: input }
      ]
    };
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            week: { type: Type.INTEGER },
            day: { type: Type.INTEGER },
            duration: { type: Type.NUMBER },
            priority: { type: Type.STRING, description: "One of: 'low', 'medium', 'high'" }
          },
          required: ["subject", "topic", "week", "day", "priority"]
        }
      },
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  const rawTasks = JSON.parse(response.text || "[]");
  const startDate = new Date(settings.startDate);

  // Enrichment logic to calculate dueDate based on settings
  return rawTasks.map((t: any, idx: number) => {
    const daysOffset = (t.week - 1) * 7 + t.day;
    const taskDate = new Date(startDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    
    return {
      ...t,
      id: `task-${Date.now()}-${idx}`,
      isCompleted: false,
      dueDate: taskDate.toISOString().split('T')[0]
    };
  });
};
