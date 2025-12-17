import React from 'react';
import { Sliders, Cpu, MessageSquareQuote, RotateCcw } from 'lucide-react';
import { ModelConfig } from '../types';

interface SettingsPanelProps {
  config: ModelConfig;
  setConfig: React.Dispatch<React.SetStateAction<ModelConfig>>;
}

export const DEFAULT_CONFIG: ModelConfig = {
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  topP: 0.95,
  systemInstruction: "Bạn là chuyên gia lập trình React Frontend và thiết kế UI/UX. Hãy tạo ra các giao diện hiện đại, đẹp mắt và viết nội dung bằng tiếng Việt."
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, setConfig }) => {
  
  const handleChange = (key: keyof ModelConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-gray-300 border-r border-gray-800 overflow-y-auto w-80 flex-shrink-0">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sliders size={16} />
          Cài đặt Studio
        </h2>
        <button 
          onClick={() => setConfig(DEFAULT_CONFIG)}
          className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
          title="Khôi phục mặc định"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 flex items-center gap-2">
            <Cpu size={14} /> Mô hình (Model)
          </label>
          <select 
            value={config.model}
            onChange={(e) => handleChange('model', e.target.value)}
            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Nhanh)</option>
            <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Tư duy)</option>
          </select>
          <p className="text-[10px] text-gray-500">
            Chọn "Pro" cho logic phức tạp, "Flash" cho tốc độ.
          </p>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-medium text-gray-400">Nhiệt độ (Sáng tạo)</label>
            <span className="text-xs text-gray-500">{config.temperature}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="0.1"
            value={config.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>Chính xác</span>
            <span>Sáng tạo</span>
          </div>
        </div>

        {/* System Instruction */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 flex items-center gap-2">
            <MessageSquareQuote size={14} /> Vai trò / Hướng dẫn hệ thống
          </label>
          <textarea
            value={config.systemInstruction}
            onChange={(e) => handleChange('systemInstruction', e.target.value)}
            rows={8}
            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-xs text-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none leading-relaxed"
            placeholder="Định nghĩa cách AI nên ứng xử..."
          />
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-gray-800">
        <div className="p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
           <p className="text-[11px] text-blue-200">
             <strong>Mẹo:</strong> Đính kèm hình ảnh vào khung chat để sao chép thiết kế hoặc wireframe ngay lập tức.
           </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;