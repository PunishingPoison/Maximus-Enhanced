import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                <Bot size={18} />
            </div>
            <div className="bg-[#1c1c1c] rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
                <motion.div
                    className="h-2 w-2 bg-gray-600 rounded-full"
                    animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="h-2 w-2 bg-gray-600 rounded-full"
                    animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                />
                <motion.div
                    className="h-2 w-2 bg-gray-600 rounded-full"
                    animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                />
            </div>
        </div>
    );
};