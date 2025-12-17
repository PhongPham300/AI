import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage, GenerationStatus } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  status: GenerationStatus;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, status }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status.isGenerating) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
            <div className="p-4 bg-gray-800 rounded-full bg-opacity-50">
                <Sparkles size={32} className="text-purple-400" />
            </div>
            <div>
                <h3 className="text-lg font-medium text-white mb-2">GenWeb AI</h3>
                <p className="text-sm max-w-[250px]">
                  Describe an app or website component to build it instantly.
                  <br/><span className="text-xs opacity-60">Try: "Landing page for a coffee shop" or "Một trang đăng nhập hiện đại màu xanh"</span>
                </p>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <UserIcon size={16} className="text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {status.isGenerating && (
           <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-gray-800 text-gray-300 rounded-2xl rounded-bl-none px-4 py-3 text-sm border border-gray-700 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-400" />
                <span>{status.step === 'thinking' ? 'Designing...' : 'Coding component...'}</span>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your app..."
            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={status.isGenerating}
          />
          <button
            type="submit"
            disabled={!input.trim() || status.isGenerating}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status.isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
