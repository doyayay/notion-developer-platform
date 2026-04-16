"use client";

import { useState, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CopySize = "sm" | "md";
type CopyPosition = "inline" | "overlay";

interface CopyButtonProps {
  text: string;
  size?: CopySize;
  position?: CopyPosition;
  label?: string;
}

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

// ─── Clipboard Utility ────────────────────────────────────────────────────────

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to execCommand
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

let toastIdCounter = 0;
type ToastListener = (toasts: ToastItem[]) => void;
const toastListeners = new Set<ToastListener>();
let toastState: ToastItem[] = [];

function emitToast(message: string, type: "success" | "error") {
  const id = ++toastIdCounter;
  toastState = [...toastState, { id, message, type }];
  toastListeners.forEach((l) => l(toastState));
  setTimeout(() => {
    toastState = toastState.filter((t) => t.id !== id);
    toastListeners.forEach((l) => l(toastState));
  }, 3000);
}

function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => {
    const listener: ToastListener = (t) => setToasts([...t]);
    toastListeners.add(listener);
    return () => { toastListeners.delete(listener); };
  }, []);
  return toasts;
}

function ToastContainer() {
  const toasts = useToasts();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl
            transition-all duration-300 animate-in slide-in-from-bottom-4
            ${toast.type === "success"
              ? "bg-neutral-900 text-green-400 border border-green-800/60 dark:bg-neutral-800 dark:border-green-700/50"
              : "bg-neutral-900 text-red-400 border border-red-800/60 dark:bg-neutral-800 dark:border-red-700/50"
            }
          `}
        >
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CopyButton Component ─────────────────────────────────────────────────────

function CopyButton({
  text,
  size = "md",
  position = "inline",
  label,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      emitToast("Copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } else {
      emitToast("Failed to copy.", "error");
    }
  }, [text]);

  const sizeClasses = size === "sm"
    ? "w-6 h-6 text-xs"
    : "w-8 h-8 text-sm";

  const positionClasses = position === "overlay"
    ? "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
    : "inline-flex opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-1.5 align-middle";

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy${label ? ` ${label}` : ""}`}
      className={`
        ${positionClasses}
        ${sizeClasses}
        items-center justify-center rounded-lg
        bg-neutral-800/80 hover:bg-neutral-700 dark:bg-neutral-700/80 dark:hover:bg-neutral-600
        border border-neutral-700/60 dark:border-neutral-600/60
        text-neutral-400 hover:text-neutral-100
        cursor-pointer select-none
        transition-all duration-150 active:scale-95
        inline-flex shrink-0
      `}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? "✅" : "📋"}
    </button>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-neutral-100 mb-1">{title}</h2>
      <p className="text-sm text-neutral-500">{description}</p>
    </div>
  );
}

interface EndpointRowProps {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  description: string;
}

function EndpointRow({ method, url, description }: EndpointRowProps) {
  const methodColors: Record<string, string> = {
    GET: "text-blue-400 bg-blue-950/60 border-blue-800/40",
    POST: "text-green-400 bg-green-950/60 border-green-800/40",
    PATCH: "text-yellow-400 bg-yellow-950/60 border-yellow-800/40",
    DELETE: "text-red-400 bg-red-950/60 border-red-800/40",
  };

  return (
    <div className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-900/60 border border-neutral-800/60 hover:border-neutral-700/60 transition-colors duration-150">
      <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-md border ${methodColors[method]}`}>
        {method}
      </span>
      <span className="font-mono text-sm text-neutral-300 truncate flex-1">{url}</span>
      <span className="text-xs text-neutral-600 hidden sm:block shrink-0">{description}</span>
      <CopyButton text={url} size="sm" position="overlay" label="URL" />
    </div>
  );
}

interface TokenFieldProps {
  label: string;
  value: string;
  masked?: boolean;
}

function TokenField({ label, value, masked = false }: TokenFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const display = masked && !revealed ? "•".repeat(Math.min(value.length, 32)) : value;

  return (
    <div className="group relative flex flex-col gap-1.5">
      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</span>
      <div className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/60 hover:border-neutral-700/60 transition-colors duration-150">
        <code className="font-mono text-sm text-neutral-300 flex-1 break-all">{display}</code>
        {masked && (
          <button
            onClick={() => setRevealed((r) => !r)}
            className="shrink-0 text-xs text-neutral-600 hover:text-neutral-400 transition-colors px-1.5 py-0.5 rounded-md hover:bg-neutral-800"
          >
            {revealed ? "Hide" : "Show"}
          </button>
        )}
        <CopyButton text={value} size="sm" position="overlay" label={label} />
      </div>
    </div>
  );
}

interface InlineCodeProps {
  code: string;
}

function InlineCodeSnippet({ code }: InlineCodeProps) {
  return (
    <span className="group relative inline-flex items-center">
      <code className="font-mono text-sm px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700/60 text-purple-300">
        {code}
      </code>
      <CopyButton text={code} size="sm" position="inline" />
    </span>
  );
}

interface TableData {
  key: string;
  value: string;
  type: string;
  required: boolean;
}

function CopyableTable({ rows }: { rows: TableData[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800/60">
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-900/80">Parameter</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-900/80">Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-900/80">Default Value</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-900/80">Required</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/40 bg-neutral-950/40">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-neutral-900/40 transition-colors duration-100">
              <td className="px-4 py-3">
                <InlineCodeSnippet code={row.key} />
              </td>
              <td className="px-4 py-3 text-neutral-400">{row.type}</td>
              <td className="px-4 py-3">
                <span className="group relative inline-flex items-center">
                  <span className="font-mono text-xs text-neutral-300">{row.value}</span>
                  <CopyButton text={row.value} size="sm" position="inline" />
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.required ? "bg-rose-950/60 text-rose-400 border border-rose-800/40" : "bg-neutral-800/60 text-neutral-500 border border-neutral-700/40"}`}>
                  {row.required ? "Required" : "Optional"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      emitToast("Code copied!", "success");
      setTimeout(() => setCopied(false), 2000);
    } else {
      emitToast("Failed to copy.", "error");
    }
  }, [code]);

  return (
    <div className="relative group rounded-xl overflow-hidden border border-neutral-800/60">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/90 border-b border-neutral-800/60">
        <span className="text-xs text-neutral-600 font-mono uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/60 text-neutral-400 hover:text-neutral-200 transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <span>{copied ? "✅" : "📋"}</span>
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className="px-4 py-4 overflow-x-auto bg-neutral-950/60">
        <code className="text-sm font-mono text-neutral-300 leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const endpoints: EndpointRowProps[] = [
  { method: "GET", url: "https://api.example.com/v1/pages", description: "List all pages" },
  { method: "POST", url: "https://api.example.com/v1/pages", description: "Create a page" },
  { method: "PATCH", url: "https://api.example.com/v1/pages/:id", description: "Update a page" },
  { method: "DELETE", url: "https://api.example.com/v1/pages/:id", description: "Delete a page" },
  { method: "GET", url: "https://api.example.com/v1/databases/:id/query", description: "Query database" },
];

const tableRows: TableData[] = [
  { key: "database_id", value: "YOUR_DATABASE_ID", type: "string", required: true },
  { key: "page_size", value: "100", type: "number", required: false },
  { key: "start_cursor", value: "undefined", type: "string", required: false },
  { key: "filter", value: "{}", type: "object", required: false },
  { key: "sorts", value: "[]", type: "array", required: false },
];

const sampleCurlCode = `curl -X POST https://api.example.com/v1/databases/YOUR_DATABASE_ID/query \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "API-Version: 2024-01" \\
  -d '{
    "page_size": 10,
    "filter": {
      "property": "Status",
      "select": { "equals": "Active" }
    }
  }'`;

const sampleJsCode = `import { Client } from "@example/sdk";

const client = new Client({
  auth: process.env.EXAMPLE_API_KEY,
});

const response = await client.databases.query({
  database_id: process.env.EXAMPLE_DATABASE_ID,
  page_size: 10,
  filter: {
    property: "Status",
    select: { equals: "Active" },
  },
});

console.log(response.results);`;

export default function WorkersPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-12 px-4">
      <ToastContainer />

      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800/60 text-xs text-neutral-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Copy Feature — Component Showcase
          </div>
          <h1 className="text-3xl font-bold text-neutral-50 tracking-tight">
            Universal Copy 기능
          </h1>
          <p className="text-neutral-500 text-base leading-relaxed max-w-2xl">
            API Endpoint, 인라인 코드, 테이블 셀, 토큰 필드 등 다양한 콘텐츠를 클릭 한 번으로 클립보드에 복사하세요.
            각 요소에 <InlineCodeSnippet code="hover" /> 시 복사 버튼이 노출됩니다.
          </p>
        </div>

        {/* API Endpoints */}
        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/60 p-6 space-y-4">
          <SectionHeader
            title="🔗 API Endpoint URLs"
            description="각 엔드포인트 URL에 hover하면 복사 버튼이 나타납니다."
          />
          <div className="space-y-2">
            {endpoints.map((ep) => (
              <EndpointRow key={`${ep.method}-${ep.url}`} {...ep} />
            ))}
          </div>
        </div>

        {/* Authentication Tokens */}
        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/60 p-6 space-y-4">
          <SectionHeader
            title="🔑 Authentication & Secrets"
            description="민감 정보는 마스킹 처리되며, Show 버튼으로 확인 후 복사할 수 있습니다."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TokenField label="API Key" value="YOUR_API_KEY" masked />
            <TokenField label="Secret Token" value="YOUR_SECRET_TOKEN" masked />
            <TokenField label="Database ID" value="YOUR_DATABASE_ID" />
            <TokenField label="Workspace ID" value="YOUR_WORKSPACE_ID" />
            <TokenField label="OAuth Client ID" value="YOUR_OAUTH_CLIENT_ID" />
            <TokenField label="Webhook Secret" value="YOUR_WEBHOOK_SECRET" masked />
          </div>
        </div>

        {/* Inline Code Snippets */}
        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/60 p-6 space-y-4">
          <SectionHeader
            title="💡 인라인 코드 스니펫"
            description="문서 내 인라인 코드 요소도 hover 시 복사 버튼이 노출됩니다."
          />
          <div className="space-y-4 text-sm text-neutral-400 leading-8">
            <p>
              데이터베이스를 쿼리하려면 <InlineCodeSnippet code="POST /v1/databases/:id/query" /> 엔드포인트를 사용하세요.
              응답 형식은 <InlineCodeSnippet code="application/json" /> 이며,
              인증 헤더로 <InlineCodeSnippet code="Authorization: Bearer YOUR_API_KEY" /> 를 포함해야 합니다.
            </p>
            <p>
              SDK 설치는 <InlineCodeSnippet code="npm install @example/sdk" /> 명령어로 시작합니다.
              환경 변수 <InlineCodeSnippet code="EXAMPLE_API_KEY" /> 와 <InlineCodeSnippet code="EXAMPLE_DATABASE_ID" /> 를 설정하세요.
            </p>
            <p>
              버전은 <InlineCodeSnippet code="API-Version: 2024-01" /> 헤더로 지정합니다.
              Pagination을 위해 <InlineCodeSnippet code="start_cursor" /> 파라미터를 활용하세요.
            </p>
          </div>
        </div>

        {/* Copyable Table */}
        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/60 p-6 space-y-4">
          <SectionHeader
            title="📋 테이블 셀 복사"
            description="파라미터명과 기본값을 개별적으로 복사할 수 있습니다."
          />
          <CopyableTable rows={tableRows} />
        </div>

        {/* Code Blocks */}
        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/60 p-6 space-y-4">
          <SectionHeader
            title="🖥️ 코드 블록"
            description="코드 블록 우상단의 Copy 버튼으로 전체 코드를 복사합니다."
          />
          <div className="space-y-4">
            <CodeBlock code={sampleCurlCode} language="bash" />
            <CodeBlock code={sampleJsCode} language="javascript" />
          </div>
        </div>

        {/* Quickstart Config */}
        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/60 p-6 space-y-4">
          <SectionHeader
            title="⚡ Quickstart 설정값"
            description="초기 설정에 필요한 ID와 URL을 빠르게 복사하세요."
          />
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: "Base URL", value: "https://api.example.com/v1" },
              { label: "Database ID", value: "YOUR_DATABASE_ID" },
              { label: "Page ID", value: "YOUR_PAGE_ID" },
              { label: "Block ID", value: "YOUR_BLOCK_ID" },
              { label: "User ID", value: "YOUR_USER_ID" },
            ].map((item) => (
              <div
                key={item.label}
                className="group relative flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 hover:border-neutral-700/60 transition-colors duration-150"
              >
                <span className="text-xs font-medium text-neutral-600 w-28 shrink-0">{item.label}</span>
                <span className="font-mono text-sm text-neutral-300 flex-1 truncate">{item.value}</span>
                <CopyButton text={item.value} size="sm" position="overlay" label={item.label} />
              </div>
            ))}
          </div>
        </div>

        {/* Component Props Reference */}
        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/60 p-6 space-y-4">
          <SectionHeader
            title="📦 CopyButton Props"
            description="공통 컴포넌트 인터페이스 — 모든 Copy 버튼은 이 컴포넌트를 사용합니다."
          />
          <CopyableTable
            rows={[
              { key: "text", value: '""', type: "string", required: true },
              { key: "size", value: '"md"', type: '"sm" | "md"', required: false },
              { key: "position", value: '"inline"', type: '"inline" | "overlay"', required: false },
              { key: "label", value: "undefined", type: "string", required: false },
            ]}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-neutral-700">
          <span>CopyButton</span>
          <span>·</span>
          <span>app/components/CopyButton.tsx</span>
          <span>·</span>
          <span>navigator.clipboard + execCommand fallback</span>
        </div>
      </div>
    </div>
  );
}