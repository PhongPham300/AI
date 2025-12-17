import React from 'react';
import { Copy } from 'lucide-react';

interface CodeEditorProps {
  code: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm rounded-md overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <span className="text-xs text-blue-400">App.tsx</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <Copy size={12} />
          Sao chép
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;