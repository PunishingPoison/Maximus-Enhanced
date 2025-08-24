import React from 'react';
import { Message, Role } from '../types';
import { User, Bot, Info, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

const UserAvatar = () => (
    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
        <User size={18} className="text-gray-200" />
    </div>
);

const AssistantAvatar = () => (
    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#1c1c1c] flex items-center justify-center">
        <Bot size={18} />
    </div>
);


const OptimizerAvatar = () => (
    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
        <Sparkles size={18} />
    </div>
);

const SystemMessage: React.FC<{ content: string }> = ({ content }) => (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 my-2">
        <Info size={16} />
        <span>{content}</span>
    </div>
);

export const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const { role, content, isOptimizer } = message;

    if (role === Role.SYSTEM) {
        return <SystemMessage content={content} />;
    }

    const isUser = role === Role.USER;
    const AvatarComponent = isUser ? UserAvatar : isOptimizer ? OptimizerAvatar : AssistantAvatar;

    const messageStyles = isUser
        ? 'bg-[#1c1c1c]'
        : 'bg-zinc-800 text-gray-200';
    
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && <AvatarComponent />}
            
            <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'inline-block' : 'block'}`}>
                <div
                    className={`px-4 py-3 rounded-2xl ${messageStyles}`}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap text-base text-gray-200 leading-relaxed break-words">
                            {content}
                        </p>
                    ) : (
                        <div className="prose prose-sm prose-invert max-w-none leading-relaxed">
                            <ReactMarkdown
                                children={content}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-none p-0 my-4" {...props} />,
                                    li: ({ node, ...props }) => <li className="mb-1.5" {...props} />,
                                    hr: ({ node, ...props }) => <hr className="my-4 border-gray-600" {...props} />,
                                    a: ({ node, ...props }) => <a className="text-blue-400 no-underline hover:underline" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="text-gray-100" {...props} />,
                                    code({ node, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return match ? (
                                            <CodeBlock isDark={!isUser} language={match[1]} value={String(children).replace(/\n$/, '')} />
                                        ) : (
                                            <code className="text-pink-400 bg-black/50 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {isUser && <AvatarComponent />}
        </div>
    );
};