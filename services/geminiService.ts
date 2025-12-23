
import { GoogleGenAI, Type } from "@google/genai";
import { StudyTask } from "../types";

export const parseStudyPlan = async (input: string | { data: string, mimeType: string }): Promise<Partial<StudyTask>[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const systemPrompt = `
    You are an expert Cambridge IGCSE education consultant. 
    Analyze the provided study plan (text or image) and extract it into a structured JSON list of study tasks.
    Each task must have:
    - subject: The IGCSE subject (e.g., Mathematics, Physics, English Literature)
    - topic: Specific chapter or topic
    - dueDate: Date in YYYY-MM-DD format
    - priority: 'low', 'medium', or 'high'
    
    If no dates are provided, distribute tasks over the next 30 days.
  `;

  let contents: any;
  if (typeof input === 'string') {
    contents = { parts: [{ text: input }] };
  } else {
    contents = {
      parts: [
        { text: "Extract the study plan from this image." },
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
            dueDate: { type: Type.STRING },
            priority: { type: Type.STRING }
          },
          required: ["subject", "topic", "dueDate", "priority"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const getStudyMotivation = async (tasks: StudyTask[]): Promise<string> => {
  if (!process.env.API_KEY) return "Set up your API Key on Vercel to get AI tips!";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const completed = tasks.filter(t => t.isCompleted).length;
    const total = tasks.length;
    
    const prompt = `
      Kyra is preparing for Cambridge IGCSE March 2026.
      Progress: ${completed}/${total} tasks done.
      Give her one short, punchy sentence of motivation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    return response.text || "Every small step counts towards your goal.";
  } catch (e) {
    return "Focus on the progress you've made today, Kyra!";
  }
};
