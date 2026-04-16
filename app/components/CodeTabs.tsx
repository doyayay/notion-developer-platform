'use client';

import { useState, useEffect } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

type Language = 'javascript' | 'python' | 'curl';

interface CodeTabsProps {
  javascript?: string;
  python?: string;
  curl?: string;
}

const STORAGE_KEY = 'preferred-code-language';

const TAB_LABELS: { id: Language; label: string }[] = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'curl', label: 'curl' },
];

function tokenize(code: string, lang: Language): React.ReactNode[] {
  if (lang === 'curl') {
    return code.split('\n').map((line, i) => {
      const parts: React.ReactNode[] = [];
      let rest = line;

      // flags like -X, -H, -d
      rest = rest.replace(/(^|\s)(-[A-Za-z]+)/g, (m, pre, flag) =>
        `__FLAG__${pre}${flag}__ENDFLAG__`
      );

      const segments = rest.split(/(__FLAG__.*?__ENDFLAG__)/g);
      segments.forEach((seg, j) => {
        if (seg.startsWith('__FLAG__')) {
          const inner = seg.replace('__FLAG__', '').replace('__ENDFLAG__', '');
          parts.push(<span key={j} className="text-yellow-400">{inner}</span>);
        } else {
          // strings
          const strParts = seg.split(/("[^"]*")/g);
          strParts.forEach((s, k) => {
            if (s.startsWith('"')) {
              parts.push(<span key={`${j}-${k}`} className="text-green-400">{s}</span>);
            } else if (s === 'curl') {
              parts.push(<span key={`${j}-${k}`} className="text-blue-400 font-semibold">{s}</span>);
            } else {
              parts.push(<span key={`${j}-${k}`}>{s}</span>);
            }
          });
        }
      });

      return <div key={i}>{parts}</div>;
    });
  }

  if (lang === 'python') {
    const keywords = /\b(import|from|def|class|return|if|else|elif|for|while|in|not|and|or|True|False|None|with|as|try|except|raise|print|async|await)\b/g;
    const builtins = /\b(requests|json|os|sys|str|int|list|dict|len)\b/g;
    const strings = /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\n]*"|'[^'\n]*')/g;
    const comments = /(#.*)/g;
    const numbers = /\b(\d+(\.\d+)?)\b/g;

    return renderTokenized(code, [
      { pattern: comments, className: 'text-gray-500 italic' },
      { pattern: strings, className: 'text-green-400' },
      { pattern: keywords, className: 'text-purple-400 font-semibold' },
      { pattern: builtins, className: 'text-blue-400' },
      { pattern: numbers, className: 'text-orange-400' },
    ]);
  }

  // javascript
  const keywords = /\b(const|let|var|function|return|if|else|for|while|in|of|import|export|default|from|async|await|new|class|this|try|catch|throw|typeof|true|false|null|undefined)\b/g;
  const builtins = /\b(console|fetch|JSON|Promise|Object|Array|String|Number|Math)\b/g;
  const strings = /(`[^`]*`|"[^"\n]*"|'[^'\n]*')/g;
  const comments = /(^\/\/.*|\/\*[\s\S]*?\*\/)/gm;
  const numbers = /\b(\d+(\.\d+)?)\b/g;

  return renderTokenized(code, [
    { pattern: comments, className: 'text-gray-500 italic' },
    { pattern: strings, className: 'text-green-400' },
    { pattern: keywords, className: 'text-purple-400 font-semibold' },
    { pattern: builtins, className: 'text-blue-400' },
    { pattern: numbers, className: 'text-orange-400' },
  ]);
}

function renderTokenized(
  code: string,
  rules: { pattern: RegExp; className: string }[]
): React.ReactNode[] {
  // Simple line-by-line rendering with regex highlights
  const lines = code.split('\n');
  return lines.map((line, i) => {
    const nodes = applyRules(line, rules, 0);
    return <div key={i}>{nodes.length ? nodes : <span>&#8203;</span>}</div>;
  });
}

function applyRules(
  text: string,
  rules: { pattern: RegExp; className: string }[],
  ruleIndex: number
): React.ReactNode[] {
  if (ruleIndex >= rules.length || !text) {
    return text ? [<span key="t">{text}</span>] : [];
  }

  const { pattern, className } = rules[ruleIndex];
  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  regex.lastIndex = 0;
  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) {
      applyRules(before, rules, ruleIndex + 1).forEach((n, j) =>
        parts.push(<span key={`b-${lastIndex}-${j}`}>{n}</span>)
      );
    }
    parts.push(
      <span key={`m-${match.index}`} className={className}>
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
    if (match[0].length === 0) { regex.lastIndex++; }
  }

  const after = text.slice(lastIndex);
  if (after) {
    applyRules(after, rules, ruleIndex + 1).forEach((n, j) =>
      parts.push(<span key={`a-${lastIndex}-${j}`}>{n}</span>)
    );
  }

  return parts;
}

export default function CodeTabs({ javascript, python, curl }: CodeTabsProps) {
  const available = TAB_LABELS.filter(({ id }) => {
    if (id === 'javascript') return !!javascript;
    if (id === 'python') return !!python;
    if (id === 'curl') return !!curl;
    return false;
  });

  const [active, setActive] = useState<Language>(available[0]?.id ?? 'javascript');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && available.some((t) => t.id === saved)) {
        setActive(saved);
      }
    } catch {}
  }, []);

  const handleTabClick = (lang: Language) => {
    setActive(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  };

  const currentCode =
    active === 'javascript' ? javascript :
    active === 'python' ? python :
    curl ?? '';

  const handleCopy = async () => {
    if (!currentCode) return;
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!mounted) {
    return (
      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-950 animate-pulse h-48" />
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Tab bar */}
      <div className="flex items-center justify-between bg-gray-900 dark:bg-gray-950 border-b border-gray-700 px-4">
        <div className="flex">
          {available.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`
                px-4 py-3 text-sm font-medium transition-all duration-200
                border-b-2 -mb-px
                ${
                  active === id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }
              `}
            >
              {label === 'JavaScript' && <span className="mr-1.5">🟨</span>}
              {label === 'Python' && <span className="mr-1.5">🐍</span>}
              {label === 'curl' && <Terminal size={12} className="inline mr-1.5 -mt-0.5" />}
              {label}
            </button>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          title="Copy code"
          className="
            flex items-center gap-1.5
            text-xs text-gray-400 hover:text-white
            transition-colors duration-200
            py-1.5 px-2 rounded-lg hover:bg-gray-700
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
      </div>

      {/* Code block */}
      <div className="bg-gray-950 overflow-x-auto">
        <pre className="p-5 text-sm leading-relaxed font-mono text-gray-200 min-h-[120px]">
          <code>
            {currentCode ? tokenize(currentCode, active) : (
              <span className="text-gray-500 italic">No code example available.</span>
            )}
          </code>
        </pre>
      </div>

      {/* Footer bar */}
      <div className="flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-gray-950 border-t border-gray-700">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-gray-500">
          {active === 'javascript' && 'Node.js · fetch API'}
          {active === 'python' && 'Python 3.8+ · requests'}
          {active === 'curl' && 'cURL · bash'}
        </span>
      </div>
    </div>
  );
}
