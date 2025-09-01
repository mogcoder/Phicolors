import React, { useState } from 'react';
import Tooltip from './Tooltip';

interface CodeBlockProps {
    code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="relative bg-slate-200/60 dark:bg-slate-800/60 rounded-xl border border-slate-300/50 dark:border-slate-700/50">
            <pre className="p-4 text-sm text-slate-800 dark:text-slate-200 overflow-x-auto">
                <code className="font-mono">{code}</code>
            </pre>
            <Tooltip content={copied ? 'Copied!' : 'Copy to clipboard'}>
                <button
                    onClick={handleCopy}
                    aria-label="Copy code to clipboard"
                    className="absolute top-3 right-3 p-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400/80 dark:hover:bg-slate-600/80 rounded-lg transition-colors text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 dark:focus:ring-offset-slate-800 focus:ring-slate-500"
                >
                     {copied ? (
                      <span className="text-lg" aria-hidden="true">✅</span>
                  ) : (
                      <span className="text-lg" aria-hidden="true">📋</span>
                  )}
                </button>
            </Tooltip>
        </div>
    );
};

export default CodeBlock;
