import React, { useState, useCallback } from 'react';
import { Layout, Code, Play, Smartphone, Monitor, Settings2 } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import PreviewFrame from './components/PreviewFrame';
import CodeEditor from './components/CodeEditor';
import SettingsPanel, { DEFAULT_CONFIG } from './components/SettingsPanel';
import { generateAppCode } from './services/geminiService';
import { ChatMessage, GenerationStatus, ViewMode, ModelConfig, Attachment } from './types';

// Initial placeholder code
const INITIAL_CODE = `import React from 'react';
import { Sparkles, Zap, Code2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4">
      <div className="relative max-w-2xl w-full">
        {/* Glow Effect */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative bg-[#1e293b]/80 backdrop-blur-xl p-10 rounded-3xl border border-slate-700 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mb-8 shadow-lg">
            <Sparkles size={40} className="text-white" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            GenWeb Studio
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Không gian làm việc AI chuyên nghiệp để tạo web tức thì. 
            Mô tả ý tưởng, tùy chỉnh mô hình và xem kết quả ngay.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <Zap className="text-yellow-400 mb-2" size={20} />
              <h3 className="font-semibold text-sm mb-1">Xem trước tức thì</h3>
              <p className="text-xs text-slate-500">Hiển thị trực tiếp với React & Tailwind</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <Settings2 className="text-blue-400 mb-2" size={20} />
              <h3 className="font-semibold text-sm mb-1">Kiểm soát đầy đủ</h3>
              <p className="text-xs text-slate-500">Điều chỉnh Nhiệt độ & Prompt</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <Code2 className="text-purple-400 mb-2" size={20} />
              <h3 className="font-semibold text-sm mb-1">Mã nguồn sạch</h3>
              <p className="text-xs text-slate-500">React 18 sẵn sàng cho sản phẩm</p>
            </div>
          </div>
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
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [showSettings, setShowSettings] = useState(true);

  const handleSendMessage = useCallback(async (content: string, attachments: Attachment[]) => {
    const newUserMsg: ChatMessage = { role: 'user', content, timestamp: Date.now(), attachments };
    setMessages(prev => [...prev, newUserMsg]);
    
    setStatus({ isGenerating: true, step: 'thinking' });

    try {
      // Simulate "Thinking" delay for UX
      await new Promise(r => setTimeout(r, 600));
      setStatus({ isGenerating: true, step: 'coding' });

      // Call Gemini API with Config
      const result = await generateAppCode(
        content, 
        modelConfig, 
        attachments,
        currentCode !== INITIAL_CODE ? currentCode : undefined
      );
      
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
        content: "Lỗi Hệ Thống: Không thể tạo mã nguồn. Vui lòng kiểm tra API key hoặc thử lại.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setStatus({ isGenerating: false });
    }
  }, [currentCode, modelConfig]);

  return (
    <div className="h-screen w-full flex flex-col bg-black text-white overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Studio Header */}
      <header className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-[#111] flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-to-tr from-blue-600 to-purple-600 rounded flex items-center justify-center">
            <Layout size={16} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide text-gray-200">GenWeb <span className="text-blue-500">Studio</span></span>
          <span className="text-xs text-gray-600 border border-gray-800 rounded px-1.5 py-0.5">Thử nghiệm</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#1a1a1a] rounded-lg p-0.5 border border-gray-800">
            <button 
              onClick={() => setViewMode(ViewMode.CODE)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${viewMode === ViewMode.CODE ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Code size={12} /> Mã nguồn
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.SPLIT)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all hidden md:flex ${viewMode === ViewMode.SPLIT ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Layout size={12} /> Chia đôi
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.PREVIEW)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${viewMode === ViewMode.PREVIEW ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Play size={12} /> Xem trước
            </button>
          </div>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-md transition-colors ${showSettings ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500 hover:text-white'}`}
            title="Cài đặt"
          >
            <Settings2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel 1: Settings (Collapsible) */}
        {showSettings && (
          <SettingsPanel config={modelConfig} setConfig={setModelConfig} />
        )}

        {/* Panel 2: Chat Interaction */}
        <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-gray-800 z-10 bg-[#131313]">
           <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage}
            status={status}
          />
        </div>

        {/* Panel 3: Editor/Preview Stage */}
        <div className="flex-1 bg-[#09090b] relative flex flex-col min-w-0">
          
          {/* Stage Toolbar */}
          {(viewMode === ViewMode.PREVIEW || viewMode === ViewMode.SPLIT) && (
             <div className="h-9 border-b border-gray-800 bg-[#09090b] flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Môi trường trực tiếp</span>
                </div>
                <div className="flex gap-1">
                   <button 
                    onClick={() => setDevicePreview('desktop')}
                    className={`p-1.5 hover:bg-gray-800 rounded transition-colors ${devicePreview === 'desktop' ? 'text-blue-400' : 'text-gray-600'}`}
                    title="Giao diện máy tính"
                   >
                     <Monitor size={14} />
                   </button>
                   <button 
                    onClick={() => setDevicePreview('mobile')}
                    className={`p-1.5 hover:bg-gray-800 rounded transition-colors ${devicePreview === 'mobile' ? 'text-blue-400' : 'text-gray-600'}`}
                    title="Giao diện điện thoại"
                   >
                     <Smartphone size={14} />
                   </button>
                </div>
             </div>
          )}

          <div className="flex-1 flex overflow-hidden p-0 relative">
            
            {/* Code Editor Area */}
            {(viewMode === ViewMode.CODE || viewMode === ViewMode.SPLIT) && (
              <div className={`h-full ${viewMode === ViewMode.SPLIT ? 'w-1/2 border-r border-gray-800' : 'w-full'} p-0`}>
                <CodeEditor code={currentCode} />
              </div>
            )}

            {/* Preview Area */}
            {(viewMode === ViewMode.PREVIEW || viewMode === ViewMode.SPLIT) && (
              <div className={`h-full flex items-center justify-center bg-black/50 ${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'} p-6 relative`}>
                 {/* Grid Background */}
                 <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                 
                <div 
                  className={`relative z-10 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] ${
                    devicePreview === 'mobile' 
                      ? 'w-[375px] h-[812px] rounded-[36px] border-[10px] border-[#222] bg-[#111] overflow-hidden ring-1 ring-white/10' 
                      : 'w-full h-full rounded-lg border border-gray-800 bg-white'
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