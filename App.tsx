import React, { useState, useCallback } from 'react';
import { Layout, Code, Play, Smartphone, Monitor } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import PreviewFrame from './components/PreviewFrame';
import CodeEditor from './components/CodeEditor';
import { generateAppCode } from './services/geminiService';
import { ChatMessage, GenerationStatus, ViewMode } from './types';

// Initial placeholder code
const INITIAL_CODE = `import React from 'react';
import { Sparkles } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ready to Build</h1>
        <p className="text-slate-600 mb-6">
          Describe what you want to create in the chat on the left.
        </p>
        <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
          Try: "A login page for a travel app" or "Một trang dashboard quản lý bán hàng"
        </div>
      </div>
    </div>
  );
}`;

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentCode, setCurrentCode] = useState<string>(INITIAL_CODE);
  const [status, setStatus] = useState<GenerationStatus>({ isGenerating: false });
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop');

  const handleSendMessage = useCallback(async (content: string) => {
    const newUserMsg: ChatMessage = { role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMsg]);
    
    setStatus({ isGenerating: true, step: 'thinking' });

    try {
      // Small delay to show "thinking" state
      await new Promise(r => setTimeout(r, 600));
      setStatus({ isGenerating: true, step: 'coding' });

      // Call Gemini API
      const result = await generateAppCode(content, currentCode !== INITIAL_CODE ? currentCode : undefined);
      
      setCurrentCode(result.code);
      setRefreshTrigger(prev => prev + 1); // Force preview reload

      const newBotMsg: ChatMessage = { 
        role: 'model', 
        content: result.explanation, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, newBotMsg]);

    } catch (error) {
      const errorMsg: ChatMessage = { 
        role: 'model', 
        content: "Sorry, I encountered an error while generating the code. Please try again.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setStatus({ isGenerating: false });
    }
  }, [currentCode]);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-950 text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Layout size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">GenWeb <span className="text-blue-400 font-normal">AI</span></h1>
        </div>
        
        <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button 
            onClick={() => setViewMode(ViewMode.CODE)}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${viewMode === ViewMode.CODE ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
          >
            <Code size={14} /> Code
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.SPLIT)}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all hidden md:flex ${viewMode === ViewMode.SPLIT ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
          >
            <Layout size={14} /> Split
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.PREVIEW)}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${viewMode === ViewMode.PREVIEW ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
          >
            <Play size={14} /> Preview
          </button>
        </div>

        <div className="w-8"></div> {/* Spacer for balance */}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Chat */}
        <div className="w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-r border-gray-800 z-10 flex flex-col">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage}
            status={status}
          />
        </div>

        {/* Right Panel: Workspace */}
        <div className="flex-1 bg-gray-900 relative flex flex-col min-w-0">
          
          {/* Toolbar for Preview */}
          {(viewMode === ViewMode.PREVIEW || viewMode === ViewMode.SPLIT) && (
             <div className="h-10 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4">
                <span className="text-xs text-gray-500 font-mono">Live Preview Environment</span>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setDevicePreview('desktop')}
                    className={`p-1 hover:bg-gray-800 rounded ${devicePreview === 'desktop' ? 'text-blue-400' : 'text-gray-500'}`}
                    title="Desktop View"
                   >
                     <Monitor size={14} />
                   </button>
                   <button 
                    onClick={() => setDevicePreview('mobile')}
                    className={`p-1 hover:bg-gray-800 rounded ${devicePreview === 'mobile' ? 'text-blue-400' : 'text-gray-500'}`}
                    title="Mobile View"
                   >
                     <Smartphone size={14} />
                   </button>
                </div>
             </div>
          )}

          <div className="flex-1 flex overflow-hidden p-0 relative">
            
            {/* Code View */}
            {(viewMode === ViewMode.CODE || viewMode === ViewMode.SPLIT) && (
              <div className={`h-full ${viewMode === ViewMode.SPLIT ? 'w-1/2 border-r border-gray-800' : 'w-full'} p-2`}>
                <CodeEditor code={currentCode} />
              </div>
            )}

            {/* Preview View */}
            {(viewMode === ViewMode.PREVIEW || viewMode === ViewMode.SPLIT) && (
              <div className={`h-full flex items-center justify-center bg-[#0d1117] ${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'} p-4`}>
                <div 
                  className={`transition-all duration-300 ease-in-out shadow-2xl ${
                    devicePreview === 'mobile' 
                      ? 'w-[375px] h-[812px] rounded-[30px] border-8 border-gray-800 overflow-hidden' 
                      : 'w-full h-full rounded-md'
                  }`}
                >
                  <PreviewFrame code={currentCode} refreshTrigger={refreshTrigger} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
