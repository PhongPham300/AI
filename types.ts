export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  mimeType: string;
  data: string; // base64 string
}

export interface GeneratedCode {
  code: string;
  explanation: string;
}

export enum ViewMode {
  CODE = 'CODE',
  PREVIEW = 'PREVIEW',
  SPLIT = 'SPLIT'
}

export interface GenerationStatus {
  isGenerating: boolean;
  step?: 'thinking' | 'coding' | 'rendering';
}

export interface ModelConfig {
  model: string;
  temperature: number;
  topP: number;
  systemInstruction: string;
}
