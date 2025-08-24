import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  value: string;
  isDark: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value, isDark }) => {
    const [copied, setCopied] = useState(false);

    const containerClasses = "bg-black/75 border-gray-700";
    const headerClasses = "bg-black/25 text-gray-400";
    const hoverClasses = "hover:text-white";

    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className={`rounded-lg my-4 overflow-hidden border ${containerClasses}`}>
            <div className={`flex justify-between items-center px-4 py-1 text-xs ${headerClasses}`}>
                <span>{language}</span>
                <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 transition-colors ${hoverClasses}`}
                >
                    {copied ? (
                        <>
                            <Check size={14} className="text-green-400" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Clipboard size={14} />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto">
                <code>{value}</code>
            </pre>
        </div>
    );
};