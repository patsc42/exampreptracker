
import { GoogleGenAI, Type } from "@google/genai";
import { StudyTask } from "../types";

export const parseStudyPlan = async (input: string | { data: string, mimeType: string }): Promise<Partial<StudyTask>[]> => {
  // Always create a new instance right before the call to ensure up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = "gemini-3-flash-preview";
  
  const systemPrompt = `
    You are an expert Cambridge IGCSE education consultant. 
    Analyze the provided study plan (text or image) and extract it into a structured JSON list of study tasks.
    Each task must have:
    - subject: The IGCSE subject (e.g., Mathematics, Physics, English Literature)
    - topic: Specific chapter or topic
    - dueDate: Estimated or provided date in YYYY-MM-DD format
    - priority: Based on context, assign 'low', 'medium', or 'high'
    
    If no dates are provided, distribute the tasks starting from today over the next 30 days.
  `;

  let contents: any;
  if (typeof input === 'string') {
    contents = input;
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = "gemini-3-flash-preview";
  const completed = tasks.filter(t => t.isCompleted).length;
  const total = tasks.length;
  
  const prompt = `
    The student's name is Kyra.
    Current Progress: ${completed}/${total} tasks completed for Cambridge Grade 9 exams.
    Provide a short, 2-sentence highly motivational tip or encouraging message.
    Keep it modern, friendly, and specific to the stress of IGCSE preparation.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return response.text || "Keep pushing! Your hard work is paving the way to success.";
};
