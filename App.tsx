import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Message, View, Mode, Role } from './types';
import { ChatMessage } from './components/ChatMessage';
import { PromptInput } from './components/PromptInput';
import { TypingIndicator } from './components/TypingIndicator';
import { generateStandardResponse, generateOptimizedPrompt } from './services/geminiService';
import { getWikipediaSummary } from './services/wikipediaService';
import { BrainCircuit, PlusSquare } from 'lucide-react';
import { SAMPLE_PROMPTS } from './constants';

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.LANDING);
    const [messages, setMessages] = useState<Message[]>([]);
    const [optimizerHistory, setOptimizerHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentMode, setCurrentMode] = useState<Mode>(Mode.STANDARD);
    const [samplePrompts, setSamplePrompts] = useState<string[]>([]);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        scrollAreaRef.current?.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        // Shuffle and pick 4 random prompts on component mount
        const shuffled = [...SAMPLE_PROMPTS].sort(() => 0.5 - Math.random());
        setSamplePrompts(shuffled.slice(0, 4));
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const resetChat = () => {
        setMessages([]);
        setOptimizerHistory([]);
        setCurrentMode(Mode.STANDARD);
        setView(View.LANDING);
    };

    const handleStandardSubmit = useCallback(async (prompt: string, history: Message[]) => {
        const response = await generateStandardResponse(prompt, history);
        setMessages(prev => [...prev, { role: Role.ASSISTANT, content: response, id: Date.now() }]);
    }, []);

    const handleOptimizerContinuation = useCallback(async (userMessage: Message) => {
        const newOptimizerHistory = [...optimizerHistory, userMessage];
        setOptimizerHistory(newOptimizerHistory);
        const optimizerResponse = await generateOptimizedPrompt(newOptimizerHistory);
        
        setOptimizerHistory(prev => [...prev, { role: Role.ASSISTANT, content: optimizerResponse.content, id: Date.now() + 1 }]);

        if (optimizerResponse.status === 'needs_more_info') {
            setMessages(prev => [...prev, { role: Role.ASSISTANT, content: optimizerResponse.content, id: Date.now() + 1, isOptimizer: true }]);
        } else if (optimizerResponse.status === 'complete') {
            const finalPromptMessage: Message = {
                role: Role.ASSISTANT,
                content: `**Optimized Prompt:**\n\nBased on our conversation, here is the final prompt that will be sent to Maximus:\n\n---\n\n${optimizerResponse.content}`,
                id: Date.now() + 1,
                isOptimizer: true,
            };
            const systemMessage: Message = {
                role: Role.SYSTEM,
                content: '🚀 Handing off to Maximus for the final response...',
                id: Date.now() + 2
            };

            setMessages(prev => [...prev, finalPromptMessage, systemMessage]);

            const historyForMaximus = [...messages, userMessage];
            await handleStandardSubmit(optimizerResponse.content, historyForMaximus);
            
            setCurrentMode(Mode.STANDARD);
            setOptimizerHistory([]);
        }
    }, [optimizerHistory, messages, handleStandardSubmit]);

    const handleSubmit = async (prompt: string, mode: Mode) => {
        if (!prompt.trim()) return;

        if (view === View.LANDING) {
            setView(View.CHAT);
        }

        const userMessage: Message = { role: Role.USER, content: prompt, id: Date.now() };

        // Handle UI state updates for messages first.
        if (mode === Mode.OPTIMIZE && currentMode !== Mode.OPTIMIZE) {
            // First time entering optimize mode. Add user prompt and the system message.
            setCurrentMode(Mode.OPTIMIZE);
            const systemMessage: Message = { role: Role.SYSTEM, content: '🚀 Optimizer mode activated. I will now ask you questions to refine your prompt.', id: Date.now() - 1 };
            setMessages(prev => [...prev, userMessage, systemMessage]);
        } else {
            // All other cases (standard, research, continuing optimize) just add the user's message.
            setMessages(prev => [...prev, userMessage]);
        }
        
        setIsLoading(true);

        try {
            // Now, handle the async API calls
            if (mode === Mode.OPTIMIZE || currentMode === Mode.OPTIMIZE) {
                 await handleOptimizerContinuation(userMessage);
            } else if (mode === Mode.RESEARCH) {
                const systemMessage: Message = { role: Role.SYSTEM, content: '🔎 Conducting research...', id: Date.now() -1 };
                setMessages(prev => [...prev, systemMessage]);
                const summary = await getWikipediaSummary(prompt);
                const researchPrompt = `Based on the following context, answer the user's query.\n\nContext:\n${summary}\n\nUser Query: ${prompt}`;
                setMessages(prev => prev.filter(m => m.id !== systemMessage.id)); // remove research message
                await handleStandardSubmit(researchPrompt, messages);
            } else {
                await handleStandardSubmit(prompt, messages);
            }
        } catch (error) {
            console.error("Error processing request:", error);
            const errorMessage: Message = { role: Role.ASSISTANT, content: "Sorry, I encountered an error. Please try again.", id: Date.now() + 1 };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-black text-gray-200 h-screen flex flex-col font-sans">
            {view === View.CHAT && (
                 <header className="flex-shrink-0 w-full">
                    <div className="flex items-center justify-between py-3 text-white/90 max-w-5xl mx-auto px-4 z-10">
                        <div className="flex items-center gap-2">
                            <BrainCircuit size={20} className="text-gray-500" />
                            <h2 className="text-lg font-semibold">Maximus AI</h2>
                        </div>
                        <button
                            onClick={resetChat}
                            className="group relative p-1.5 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
                            aria-label="New Chat"
                        >
                            <PlusSquare size={20} />
                            <span className="absolute top-full right-0 mt-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap border border-gray-700 shadow-lg z-20">
                                New Chat
                            </span>
                        </button>
                    </div>
                </header>
            )}

            <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 overflow-hidden">
                <AnimatePresence>
                    {view === View.LANDING ? (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center text-center h-full flex-1"
                        >
                            <div className="max-w-3xl">
                                <BrainCircuit size={64} className="text-gray-600 mb-6 mx-auto" />
                                <h1 className="text-5xl font-bold tracking-tight text-gray-200">
                                    Maximus AI
                                </h1>
                                <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                                    Welcome to Maximus AI. Engage in conversation, use the <span className="text-gray-200 font-medium">Research</span> tool to get web-informed answers, or activate <span className="text-gray-200 font-medium">Optimizer</span> to collaboratively craft the perfect prompt.
                                </p>
                                
                                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                    {samplePrompts.map((prompt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSubmit(prompt, Mode.STANDARD)}
                                            className="bg-[#1c1c1c] p-4 rounded-xl text-left text-gray-300 hover:bg-gray-800 transition-colors border border-gray-800 text-sm"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="chat" 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ duration: 0.5 }} 
                            className="flex flex-col h-full"
                        >
                            <div ref={scrollAreaRef} className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6 pt-6 pb-4">
                                <AnimatePresence initial={false}>
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                        >
                                            <ChatMessage message={message} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {isLoading && <TypingIndicator />}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            
            <div className="flex-shrink-0 w-full bg-black relative">
                <div className="absolute bottom-full left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
                <div className="max-w-5xl mx-auto px-4 py-3 md:py-5">
                    <PromptInput
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        currentMode={currentMode}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;