import { GoogleGenAI } from "@google/genai";
import { GeneratedCode, ModelConfig, Attachment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CORE_SYSTEM_INSTRUCTION = `
You are an expert Senior React Frontend Engineer and UI/UX Designer.
Your task is to generate complete, production-ready React components.

TECHNICAL RULES (IMMUTABLE):
1.  **Framework**: React 18+ with Functional Components and Hooks.
2.  **Styling**: Tailwind CSS classes exclusively.
3.  **Icons**: Use 'lucide-react'. Import: \`import { Home } from 'lucide-react';\`
4.  **Images**: Use 'https://picsum.photos/width/height'.
5.  **Output**: Valid JSON object.
6.  **File**: Single file, export default component.
7.  **No Markdown**: Return raw JSON.
8.  **Language**: Use Vietnamese for all UI text and comments unless strictly specified otherwise by the user.

RESPONSE FORMAT:
{
  "code": "string",
  "explanation": "string"
}
`;

export const generateAppCode = async (
  prompt: string,
  config: ModelConfig,
  attachments: Attachment[] = [],
  currentCode?: string
): Promise<GeneratedCode> => {
  try {
    // Construct the prompt with context
    let fullPrompt = prompt;
    if (currentCode) {
      fullPrompt = `Original Request: ${prompt}\n\nCurrent Code:\n${currentCode}\n\nTask: Update the code based on the new request. Maintain existing functionality unless asked to change.`;
    }

    // Combine Core Rules with User's System Instruction
    const finalSystemInstruction = `${CORE_SYSTEM_INSTRUCTION}\n\nUSER INSTRUCTIONS:\n${config.systemInstruction}`;

    // Prepare content parts (Text + Images)
    const parts: any[] = [{ text: fullPrompt }];
    
    // Add images if present
    attachments.forEach(att => {
      parts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data
        }
      });
    });

    const response = await ai.models.generateContent({
      model: config.model,
      contents: { parts },
      config: {
        systemInstruction: finalSystemInstruction,
        responseMimeType: "application/json",
        temperature: config.temperature,
        topP: config.topP,
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response from AI");

    const parsed = JSON.parse(responseText);
    return {
      code: parsed.code,
      explanation: parsed.explanation || "Đã tạo ứng dụng thành công."
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Không thể tạo mã nguồn. Vui lòng thử lại.");
  }
};