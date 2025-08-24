import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Search, Sparkles } from 'lucide-react';
import { Mode } from '../types';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';

interface PromptInputProps {
  onSubmit: (prompt: string, mode: Mode) => void;
  isLoading: boolean;
  currentMode: Mode;
}

const ToolButton: React.FC<{ icon: React.ReactNode; tooltip: string; isActive?: boolean; onClick: () => void; disabled: boolean }> = ({ icon, tooltip, isActive, onClick, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`group relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
            isActive 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-500 hover:bg-gray-700/50 hover:text-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        {icon}
        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {tooltip}
        </span>
    </button>
);

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading, currentMode }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedMode, setSelectedMode] = useState<Mode>(Mode.STANDARD);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useAutoResizeTextarea(textareaRef, prompt);

    const handleSubmit = () => {
        if (!prompt.trim() || isLoading) return;
        onSubmit(prompt, selectedMode);
        setPrompt('');
        if (selectedMode !== Mode.OPTIMIZE) {
            setSelectedMode(Mode.STANDARD);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
    
    const isOptimizing = currentMode === Mode.OPTIMIZE;
    
    // In optimizer mode, force the mode to optimize.
    // Otherwise, allow the user to toggle between standard, research, and optimize.
    const effectiveMode = isOptimizing ? Mode.OPTIMIZE : selectedMode;

    const toggleMode = (mode: Mode) => {
        setSelectedMode(prev => prev === mode ? Mode.STANDARD : mode);
    }

    return (
        <div className="bg-[#1c1c1c] border border-gray-700 rounded-2xl flex items-end gap-2 p-3">
             <div className="flex-shrink-0 flex items-center self-end">
                <ToolButton 
                    icon={<Search size={18}/>} 
                    tooltip="Research"
                    isActive={effectiveMode === Mode.RESEARCH} 
                    onClick={() => toggleMode(Mode.RESEARCH)}
                    disabled={isLoading || isOptimizing}
                />
                <ToolButton 
                    icon={<Sparkles size={18}/>} 
                    tooltip="Optimize"
                    isActive={effectiveMode === Mode.OPTIMIZE}
                    onClick={() => toggleMode(Mode.OPTIMIZE)}
                    disabled={isLoading || isOptimizing}
                />
            </div>
            <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isOptimizing ? "Answer the question to continue..." : "Message Maximus AI..."}
                className="flex-1 w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none text-base max-h-48 py-2 px-1"
                rows={1}
                disabled={isLoading}
            />
            <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
                className="flex-shrink-0 self-end flex items-center justify-center h-9 w-9 rounded-lg bg-white text-black hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
                <Send size={18} />
            </button>
        </div>
    );
};