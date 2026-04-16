```typescript
'use client';

import { useState } from 'react';

interface CodeBlock {
  language: string;
  code: string;
  title?: string;
}

const codeBlocks: CodeBlock[] = [
  {
    language: 'bash',
    title: 'Worker 생성',
    code: `wrangler generate my-worker
cd my-worker
npm install`,
  },
  {
    language: 'typescript',
    title: 'Worker 핸들러',
    code: `export default {
  async fetch(request: Request): Promise<Response> {
    return new Response('Hello from Worker!', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};`,
  },
  {
    language: 'bash',
    title: 'Worker 배포',
    code: `wrangler deploy`,
  },
  {
    language: 'typescript',
    title: '환경 변수 사용',
    code: `interface Env {
  API_KEY: string;
  DATABASE_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const apiKey = env.API_KEY;
    return new Response(\`API Key: \${apiKey}\`);
  },
};`,
  },
  {
    language: 'json',
    title: 'wrangler.toml',
    code: `name = "my-worker"
type = "service"
main = "src/index.ts"

[env.production]
routes = [
  { pattern = "example.com/*", zone_name = "example.com" }
]`,
  },
];

function CodeBlock({ language, code, title }: CodeBlock) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="mb-6 rounded-2xl bg-gray-950 dark:bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 dark:bg-gray-800 border-b border-gray-800 dark:border-gray-700">
        {title && <span className="text-sm font-semibold text-gray-300 dark:text-gray-400">{title}</span>}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-gray-400 dark:text-gray-500">{language}</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-200 dark:text-gray-300 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="p-6 overflow-x-auto">
        <code className="text-sm text-gray-100 dark:text-gray-200 font-mono leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

export default function WorkersPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-950 dark:text-white mb-4">
            Workers 시작하기
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Cloudflare Workers를 사용하여 엣지에서 JavaScript를 실행하세요. 아래 코드 예제를 통해 기본 설정 방법을 알아보세요.
          </p>
        </div>

        {/* Introduction Section */}
        <div className="mb-12 p-6 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white mb-3">개요</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Cloudflare Workers는 Cloudflare의 글로벌 네트워크에서 직접 코드를 실행할 수 있는 서버리스 플랫폼입니다.
            낮은 지연 시간과 높은 성능으로 전 세계 사용자에게 빠른 응답을 제공합니다.
          </p>
        </div>

        {/* Code Blocks */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white mb-6">설치 및 설정</h2>
            <CodeBlock
              language={codeBlocks[0].language}
              title={codeBlocks[0].title}
              code={codeBlocks[0].code}
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white mb-6">기본 핸들러</h2>
            <CodeBlock
              language={codeBlocks[1].language}
              title={codeBlocks[1].title}
              code={codeBlocks[1].code}
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white mb-6">배포</h2>