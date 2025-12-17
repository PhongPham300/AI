export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
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
