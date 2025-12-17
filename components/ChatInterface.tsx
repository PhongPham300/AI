import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { ChatMessage, GenerationStatus, Attachment } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, attachments: Attachment[]) => void;
  status: GenerationStatus;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, status }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = (event.target.result as string).split(',')[1];
          setAttachments(prev => [...prev, {
            mimeType: file.type,
            data: base64String
          }]);
        }
      };
      
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || status.isGenerating) return;
    onSendMessage(input, attachments);
    setInput('');
    setAttachments([]);
  };

  return (
    <div className="flex flex-col h-full bg-[#131313] border-r border-gray-800">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 opacity-60">
            <p className="text-sm">Start by describing your app or attaching a design.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === 'model' ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gray-700'
            }`}>
              {msg.role === 'model' ? <Bot size={18} className="text-white" /> : <UserIcon size={18} className="text-gray-300" />}
            </div>
            
            <div className={`max-w-[85%] space-y-2`}>
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 justify-end">
                   {msg.attachments.map((att, i) => (
                     <img 
                       key={i}
                       src={`data:${att.mimeType};base64,${att.data}`} 
                       alt="attachment" 
                       className="h-32 rounded-lg border border-gray-700 object-cover"
                     />
                   ))}
                </div>
              )}
              {msg.content && (
                <div className={`rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-[#2b2d31] text-gray-100 border border-gray-700' 
                    : 'text-gray-300'
                }`}>
                  {msg.content}
                </div>
              )}
            </div>
          </div>
        ))}

        {status.isGenerating && (
           <div className="flex gap-4">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot size={18} className="text-white" />
              </div>
              <div className="text-gray-400 text-sm flex items-center gap-2 py-2">
                <Loader2 size={14} className="animate-spin text-blue-400" />
                <span>{status.step === 'thinking' ? 'Analyzing requirements...' : 'Writing code...'}</span>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#131313] border-t border-gray-800">
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative group">
                <img 
                  src={`data:${att.mimeType};base64,${att.data}`} 
                  alt="preview" 
                  className="h-16 w-16 object-cover rounded-md border border-gray-700"
                />
                <button 
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 border border-gray-600 text-gray-400 hover:text-red-400"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative bg-[#1e1e1e] rounded-xl border border-gray-700 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe your app or ask for changes..."
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm p-3 max-h-32 min-h-[50px] focus:outline-none resize-none"
            rows={1}
            disabled={status.isGenerating}
          />
          <div className="flex items-center justify-between px-2 pb-2">
             <button
               type="button"
               onClick={() => fileInputRef.current?.click()}
               className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
               title="Attach Image"
             >
               <ImageIcon size={18} />
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*"
               onChange={handleFileSelect}
             />

             <button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || status.isGenerating}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status.isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </form>
        <p className="text-[10px] text-gray-500 mt-2 text-center">
          GenWeb AI Studio • Gemini 2.5 Flash / 3.0 Pro
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
