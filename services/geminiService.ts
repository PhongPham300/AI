import { GoogleGenAI } from "@google/genai";
import { GeneratedCode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Senior React Frontend Engineer and UI/UX Designer.
Your task is to generate complete, production-ready React components based on user prompts.

RULES:
1.  **Framework**: Use React 18+ with Functional Components and Hooks.
2.  **Styling**: Use Tailwind CSS classes exclusively. Do not write custom CSS objects or styled-components.
3.  **Icons**: You may use 'lucide-react' for icons. Import them like: \`import { Home, User } from 'lucide-react';\`
4.  **Images**: Use 'https://picsum.photos/width/height' for placeholders.
5.  **Structure**: The output MUST be a valid JSON object.
6.  **Component**: The React code must be a single file that exports a default component (e.g., \`export default function App() { ... }\`).
7.  **Completeness**: The code must be self-contained. If you need helper components, define them within the same file/string.
8.  **Language**: If the user asks in Vietnamese, the UI text in the generated app should be Vietnamese, but the code comments and explanation can be brief.
9.  **Animation**: Feel free to use 'framer-motion' if requested, or simple Tailwind transitions.

RESPONSE FORMAT (JSON):
{
  "code": "The full React component code string...",
  "explanation": "A very brief summary of what was built (max 2 sentences)."
}

Do not include markdown code blocks (like \`\`\`json) in the response, just the raw JSON string if possible, or ensuring it is easily parseable.
`;

export const generateAppCode = async (prompt: string, currentCode?: string): Promise<GeneratedCode> => {
  try {
    const model = 'gemini-2.5-flash';
    
    let fullPrompt = prompt;
    if (currentCode) {
      fullPrompt = `Original Request: ${prompt}\n\nCurrent Code:\n${currentCode}\n\nTask: Update the code based on the new request. Maintain existing functionality unless asked to change.`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response from AI");

    const parsed = JSON.parse(responseText);
    return {
      code: parsed.code,
      explanation: parsed.explanation || "App generated successfully."
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate code. Please try again.");
  }
};
