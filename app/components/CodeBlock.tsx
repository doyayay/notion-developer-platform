"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-gray-950 border border-gray-800">
      {language && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
            {language}
          </span>
        </div>
      )}
      <button
        onClick={handleCopy}
        aria-label="Copy code"
        className="
          absolute top-2 right-2 z-10
          flex items-center gap-1.5
          px-2.5 py-1.5
          rounded-lg
          text-xs font-medium
          transition-all duration-150
          bg-gray-800 text-gray-300
          hover:bg-gray-700 hover:text-white
          active:scale-95
          opacity-0 group-hover:opacity-100
          focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-600
        "
      >
        {copied ? (
          <>
            <Check size={13} className="text-green-400" />
            <span className="text-green-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy size={13} />
            <span>Copy</span>
          </>
        )}
      </button>
      <pre className="overflow-x-auto p-4 text-sm font-mono text-gray-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
