"use client";

import { useState, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Clipboard Utility ───────────────────────────────────────────────────────

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback: execCommand
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

// ─── Toast Store (simple in-component) ───────────────────────────────────────

let toastId = 0;

// ─── CopyButton Component ─────────────────────────────────────────────────────

function CopyButton({
  text,
  size = "md",
  position = "inline",
  label,
  onCopy,
}: CopyButtonProps & { onCopy?: (success: boolean) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const success = await copyToClipboard(text);
      onCopy?.(success);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [text, onCopy]
  );

  const sizeClasses =
    size === "sm"
      ? "h-6 w-6 text-xs"
      : "h-8 w-8 text-sm";

  const positionClasses =
    position === "overlay"
      ? "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      : "inline-flex flex-shrink-0";

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : `Copy ${label ?? "to clipboard"}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
      className={`
        ${positionClasses}
        ${sizeClasses}
        items-center justify-center rounded-md
        bg-zinc-800 hover:bg-zinc-700
        dark:bg-zinc-700 dark:hover:bg-zinc-600
        text-zinc-400 hover:text-zinc-100
        border border-zinc-700 dark:border-zinc-600
        transition-all duration-150 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-zinc-500
        z-10
      `}
    >
      {copied ? "✅" : "📋"}
    </button>
  );
}

// ─── Toast Component ──────────────────────────────────────────────────────────

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium
            transition-all duration-300 pointer-events-auto
            ${
              t.type === "success"
                ? "bg-zinc-900 border border-zinc-700 text-zinc-100"
                : "bg-red-950 border border-red-800 text-red-200"
            }
          `}
        >
          <span>{t.type === "success" ? "✅" : "❌"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CopyField Component ──────────────────────────────────────────────────────

function CopyField({
  label,
  value,
  sensitive = false,
  onCopy,
}: {
  label: string;
  value: string;
  sensitive?: boolean;
  onCopy: (success: boolean) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const display = sensitive && !revealed ? "•".repeat(Math.min(value.length, 32)) : value;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="group relative flex items-center gap-2 bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
        <code className="flex-1 text-sm text-zinc-200 font-mono truncate select-all">
          {display}
        </code>
        {sensitive && (
          <button
            onClick={() => setRevealed((r) => !r)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0 px-1"
          >
            {revealed ? "Hide" : "Show"}
          </button>
        )}
        <CopyButton text={value} size="sm" position="inline" label={label} onCopy={onCopy} />
      </div>
    </div>
  );
}

// ─── EndpointRow Component ────────────────────────────────────────────────────

function EndpointRow({
  method,
  url,
  description,
  onCopy,
}: {
  method: string;
  url: string;
  description: string;
  onCopy: (success: boolean) => void;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-emerald-950 text-emerald-400 border-emerald-800",
    POST: "bg-blue-950 text-blue-400 border-blue-800",
    PATCH: "bg-amber-950 text-amber-400 border-amber-800",
    DELETE: "bg-red-950 text-red-400 border-red-800",
  };

  return (
    <div className="group relative flex items-center gap-3 bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors">
      <span
        className={`text-xs font-bold px-2 py-0.5 rounded-md border flex-shrink-0 font-mono ${
          methodColors[method] ?? "bg-zinc-800 text-zinc-300 border-zinc-700"
        }`}
      >
        {method}
      </span>
      <code className="flex-1 text-sm text-zinc-200 font-mono truncate">{url}</code>
      <span className="text-xs text-zinc-500 hidden sm:block flex-shrink-0 max-w-[140px] truncate">
        {description}
      </span>
      <CopyButton text={url} size="sm" position="inline" label="endpoint" onCopy={onCopy} />
    </div>
  );
}

// ─── TableCell Component ──────────────────────────────────────────────────────

function CopyableCell({
  value,
  onCopy,
}: {
  value: string;
  onCopy: (success: boolean) => void;
}) {
  return (
    <td className="group relative px-4 py-3 text-sm text-zinc-300 font-mono">
      <div className="flex items-center gap-2">
        <span className="truncate max-w-[180px]">{value}</span>
        <CopyButton text={value} size="sm" position="inline" onCopy={onCopy} />
      </div>
    </td>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
        {badge && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            {badge}
          </span>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Inline Code Snippet ──────────────────────────────────────────────────────

function InlineSnippet({
  code,
  onCopy,
}: {
  code: string;
  onCopy: (success: boolean) => void;
}) {
  return (
    <div className="group relative flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
      <pre className="flex-1 text-sm text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
      <CopyButton text={code} size="md" position="inline" label="code snippet" onCopy={onCopy} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkersPage() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((success: boolean) => {
    const id = ++toastId;
    setToasts((prev) => [
      ...prev,
      {
        id,
        message: success ? "Copied to clipboard!" : "Copy failed. Please try again.",
        type: success ? "success" : "error",
      },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Dismiss toasts on unmount
  useEffect(() => () => setToasts([]), []);

  // ── Demo Data ──────────────────────────────────────────────────────────────

  const endpoints = [
    { method: "GET", url: "https://api.notion.com/v1/pages/{page_id}", description: "Retrieve a page" },
    { method: "POST", url: "https://api.notion.com/v1/pages", description: "Create a page" },
    { method: "PATCH", url: "https://api.notion.com/v1/pages/{page_id}", description: "Update a page" },
    { method: "DELETE", url: "https://api.notion.com/v1/blocks/{block_id}", description: "Delete a block" },
    { method: "GET", url: "https://api.notion.com/v1/databases/{database_id}", description: "Retrieve a database" },
  ];

  const authFields = [
    { label: "API Key", value: "YOUR_API_KEY", sensitive: true },
    { label: "Integration Token", value: "secret_YOUR_INTEGRATION_TOKEN_HERE", sensitive: true },
    { label: "OAuth Client ID", value: "YOUR_OAUTH_CLIENT_ID", sensitive: false },
    { label: "Redirect URI", value: "https://your-app.example.com/auth/callback", sensitive: false },
  ];

  const tableData = [
    { name: "Main Workspace DB", id: "YOUR_DATABASE_ID_1", type: "Database", status: "Active" },
    { name: "Tasks Collection", id: "YOUR_DATABASE_ID_2", type: "Collection", status: "Active" },
    { name: "Archive Store", id: "YOUR_DATABASE_ID_3", type: "Database", status: "Archived" },
    { name: "Dev Sandbox", id: "YOUR_DATABASE_ID_4", type: "Collection", status: "Draft" },
  ];

  const snippets = [
    {
      label: "Install SDK",
      code: `npm install @notionhq/client`,
    },
    {
      label: "Initialize Client",
      code: `import { Client } from "@notionhq/client";\n\nconst notion = new Client({\n  auth: process.env.NOTION_API_KEY,\n});`,
    },
    {
      label: "Query Database",
      code: `const response = await notion.databases.query({\n  database_id: process.env.NOTION_DATABASE_ID,\n  filter: {\n    property: "Status",\n    select: { equals: "Active" },\n  },\n});`,
    },
  ];

  const statusColors: Record<string, string> = {
    Active: "text-emerald-400",
    Archived: "text-zinc-500",
    Draft: "text-amber-400",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-base">
            📋
          </div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Component Showcase
          </span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight mb-2">
          Copy 기능 데모
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
          API 엔드포인트 URL, 인증 토큰, 테이블 셀 값, 코드 스니펫 등 다양한 콘텐츠를
          클릭 한 번으로 클립보드에 복사할 수 있습니다. 복사 성공·실패 시 토스트 알림이
          표시됩니다.
        </p>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* ── Section 1: API Endpoints ───────────────────────────────────── */}
        <SectionCard title="API Reference" badge="Endpoints">
          <p className="text-sm text-zinc-500 mb-4">
            각 엔드포인트 URL의 📋 버튼을 클릭하면 전체 URL이 클립보드에 복사됩니다.
          </p>
          <div className="flex flex-col gap-2">
            {endpoints.map((ep) => (
              <EndpointRow
                key={ep.url}
                method={ep.method}
                url={ep.url}
                description={ep.description}
                onCopy={addToast}
              />
            ))}
          </div>
        </SectionCard>

        {/* ── Section 2: Auth / Sensitive Fields ────────────────────────── */}
        <SectionCard title="Authentication" badge="Tokens & Secrets">
          <p className="text-sm text-zinc-500 mb-4">
            민감 정보는 기본적으로 마스킹되며, Show 버튼으로 확인하거나 그대로 복사할 수
            있습니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {authFields.map((f) => (
              <CopyField
                key={f.label}
                label={f.label}
                value={f.value}
                sensitive={f.sensitive}
                onCopy={addToast}
              />
            ))}
          </div>
        </SectionCard>

        {/* ── Section 3: Table Data ──────────────────────────────────────── */}
        <SectionCard title="Quickstart" badge="Database IDs">
          <p className="text-sm text-zinc-500 mb-4">
            테이블 셀의 ID 값을 직접 복사하여 환경 변수 설정에 활용하세요.
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Database ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-zinc-800 last:border-0 hover:bg-zinc-900/60 transition-colors ${
                      i % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/30"
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-zinc-200 font-medium whitespace-nowrap">
                      {row.name}
                    </td>
                    <CopyableCell value={row.id} onCopy={addToast} />
                    <td className="px-4 py-3 text-sm text-zinc-400 whitespace-nowrap">
                      {row.type}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`font-medium ${statusColors[row.status] ?? "text-zinc-400"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* ── Section 4: Code Snippets ───────────────────────────────────── */}
        <SectionCard title="Code Snippets" badge="Inline Copy">
          <p className="text-sm text-zinc-500 mb-4">
            설정 코드 스니펫을 바로 복사하여 프로젝트에 붙여넣으세요.
          </p>
          <div className="flex flex-col gap-4">
            {snippets.map((s) => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {s.label}
                </span>
                <InlineSnippet code={s.code} onCopy={addToast} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 5: CopyButton Props Reference ─────────────────────── */}
        <SectionCard title="CopyButton Props" badge="Component API">
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  {["Prop", "Type", "Default", "Description"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    prop: "text",
                    type: "string",
                    def: "—",
                    desc: "복사할 문자열 (필수)",
                  },
                  {
                    prop: "size",
                    type: '"sm" | "md"',
                    def: '"md"',
                    desc: "버튼 크기 (sm: 24px, md: 32px)",
                  },
                  {
                    prop: "position",
                    type: '"inline" | "overlay"',
                    def: '"inline"',
                    desc: "레이아웃 배치 방식",
                  },
                  {
                    prop: "label",
                    type: "string",
                    def: "undefined",
                    desc: "aria-label 및 title 보조 텍스트",
                  },
                  {
                    prop: "onCopy",
                    type: "(success: boolean) => void",
                    def: "undefined",
                    desc: "복사 성공/실패 콜백",
                  },
                ].map((row, i) => (
                  <tr
                    key={row.prop}
                    className={`border-b border-zinc-800 last:border-0 ${
                      i % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/30"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-emerald-400 whitespace-nowrap">
                      {row.prop}
                    </td>
                    <td className="px-4 py-3 font-mono text-blue-400 text-xs whitespace-nowrap">
                      {row.type}
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-400 text-xs whitespace-nowrap">
                      {row.def}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Live size/position demo */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Size variants
              </span>
              <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
                <span className="text-xs text-zinc-500 font-mono">sm</span>
                <CopyButton text="Small copy button demo" size="sm" position="inline" onCopy={addToast} />
                <span className="text-xs text-zinc-500 font-mono ml-4">md</span>
                <CopyButton text="Medium copy button demo" size="md" position="inline" onCopy={addToast} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Overlay position (hover me)
              </span>
              <div className="group relative bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
                <span className="text-sm text-zinc-300 font-mono">
                  Hover to reveal copy button →
                </span>
                <CopyButton
                  text="Overlay position demo text"
                  size="sm"
                  position="overlay"
                  onCopy={addToast}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Footer note */}
        <div className="text-center text-xs text-zinc-600 pb-4">
          CopyButton은{" "}
          <code className="font-mono text-zinc-500">app/components/CopyButton.tsx</code>
          로 분리하여 전체 앱에서 재사용할 수 있습니다.
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}