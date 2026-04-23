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

interface ToastMessage {
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
  // Fallback: document.execCommand
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

// ─── Toast Store (simple module-level) ───────────────────────────────────────

let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];
let nextId = 0;

function addToast(message: string, type: "success" | "error") {
  const id = ++nextId;
  toasts = [...toasts, { id, message, type }];
  toastListeners.forEach((fn) => fn(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    toastListeners.forEach((fn) => fn(toasts));
  }, 2800);
}

function useToasts() {
  const [list, setList] = useState<ToastMessage[]>([]);
  useEffect(() => {
    setList(toasts);
    toastListeners.push(setList);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setList);
    };
  }, []);
  return list;
}

// ─── CopyButton Component ─────────────────────────────────────────────────────

function CopyButton({
  text,
  size = "md",
  position = "inline",
  label,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      addToast("클립보드에 복사되었습니다.", "success");
      setTimeout(() => setCopied(false), 2000);
    } else {
      addToast("복사에 실패했습니다.", "error");
    }
  }, [text]);

  const sizeClasses =
    size === "sm"
      ? "w-6 h-6 text-xs"
      : "w-8 h-8 text-sm";

  const positionClasses =
    position === "overlay"
      ? "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      : "inline-flex opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-1.5 align-middle";

  return (
    <button
      onClick={handleCopy}
      aria-label={label ?? "복사"}
      title={label ?? "클립보드에 복사"}
      className={`
        ${sizeClasses}
        ${positionClasses}
        items-center justify-center rounded-md
        bg-gray-800 hover:bg-gray-700
        dark:bg-gray-700 dark:hover:bg-gray-600
        border border-gray-700 dark:border-gray-600
        text-gray-300 hover:text-white dark:text-gray-400 dark:hover:text-white
        cursor-pointer select-none shrink-0
        focus:outline-none focus:ring-2 focus:ring-gray-500
        transition-all duration-150
      `}
    >
      {copied ? "✅" : "📋"}
    </button>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────

function ToastContainer() {
  const list = useToasts();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {list.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl
            text-sm font-medium text-white
            animate-fade-in-up
            ${
              t.type === "success"
                ? "bg-gray-900 border border-gray-700"
                : "bg-red-900 border border-red-700"
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

// ─── Section Components ───────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 dark:bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface CopyRowProps {
  label: string;
  value: string;
  mono?: boolean;
  masked?: boolean;
}

function CopyRow({ label, value, mono = false, masked = false }: CopyRowProps) {
  const [revealed, setRevealed] = useState(false);
  const display = masked && !revealed ? "•".repeat(Math.min(value.length, 32)) : value;

  return (
    <div className="group relative flex items-center justify-between gap-3 bg-gray-950 dark:bg-black rounded-xl px-4 py-3 border border-gray-800">
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        <span
          className={`text-sm text-gray-200 truncate ${
            mono ? "font-mono" : ""
          }`}
        >
          {display}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {masked && (
          <button
            onClick={() => setRevealed((r) => !r)}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white text-xs transition-all"
            title={revealed ? "숨기기" : "보기"}
          >
            {revealed ? "🙈" : "👁️"}
          </button>
        )}
        <div className="relative w-8 h-8">
          <CopyButton text={value} size="md" position="inline" label={`${label} 복사`} />
        </div>
      </div>
    </div>
  );
}

// ─── Inline Code Component ────────────────────────────────────────────────────

function InlineCode({ children, copyText }: { children: React.ReactNode; copyText: string }) {
  return (
    <span className="group relative inline-flex items-center gap-0">
      <code className="px-1.5 py-0.5 rounded-md bg-gray-800 dark:bg-gray-800 text-emerald-400 font-mono text-sm border border-gray-700">
        {children}
      </code>
      <CopyButton text={copyText} size="sm" position="inline" />
    </span>
  );
}

// ─── Table with Copy ──────────────────────────────────────────────────────────

interface TableRow {
  param: string;
  type: string;
  example: string;
  description: string;
}

function CopyTable({ rows }: { rows: TableRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800 text-gray-400 text-xs uppercase tracking-wide">
            <th className="px-4 py-3 text-left font-medium">Parameter</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Example</th>
            <th className="px-4 py-3 text-left font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((row, i) => (
            <tr key={i} className="bg-gray-950 dark:bg-black hover:bg-gray-900 transition-colors">
              <td className="px-4 py-3">
                <code className="text-purple-400 font-mono">{row.param}</code>
              </td>
              <td className="px-4 py-3">
                <span className="text-blue-400 font-mono text-xs">{row.type}</span>
              </td>
              <td className="px-4 py-3">
                <div className="group relative inline-flex items-center gap-1">
                  <span className="text-gray-300 font-mono text-xs truncate max-w-[140px]">
                    {row.example}
                  </span>
                  <CopyButton text={row.example} size="sm" position="inline" label="값 복사" />
                </div>
              </td>
              <td className="px-4 py-3 text-gray-400">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Endpoint URL Banner ──────────────────────────────────────────────────────

function EndpointBanner({
  method,
  url,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
}) {
  const methodColors: Record<string, string> = {
    GET: "text-emerald-400 bg-emerald-950 border-emerald-800",
    POST: "text-blue-400 bg-blue-950 border-blue-800",
    PATCH: "text-yellow-400 bg-yellow-950 border-yellow-800",
    DELETE: "text-red-400 bg-red-950 border-red-800",
  };

  return (
    <div className="group relative flex items-center gap-3 bg-gray-950 dark:bg-black rounded-xl px-4 py-3 border border-gray-800 overflow-hidden">
      <span
        className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${methodColors[method]}`}
      >
        {method}
      </span>
      <span className="flex-1 font-mono text-sm text-gray-200 truncate">{url}</span>
      <CopyButton text={url} size="md" position="overlay" label="URL 복사" />
    </div>
  );
}

// ─── Demo: CopyButton Showcase ────────────────────────────────────────────────

function ShowcaseCard() {
  return (
    <SectionCard
      title="🧩 CopyButton 컴포넌트 Showcase"
      description="size(sm/md) × position(inline/overlay) 조합 미리보기"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* sm / inline */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-950 border border-gray-800">
          <span className="text-xs text-gray-500 uppercase tracking-wide">size=sm / position=inline</span>
          <div className="flex items-center gap-1">
            <span className="text-gray-300 text-sm">sample-value-sm</span>
            <CopyButton text="sample-value-sm" size="sm" position="inline" />
          </div>
        </div>
        {/* md / inline */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-950 border border-gray-800">
          <span className="text-xs text-gray-500 uppercase tracking-wide">size=md / position=inline</span>
          <div className="group flex items-center gap-1">
            <span className="text-gray-300 text-sm">sample-value-md</span>
            <CopyButton text="sample-value-md" size="md" position="inline" />
          </div>
        </div>
        {/* sm / overlay */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-950 border border-gray-800">
          <span className="text-xs text-gray-500 uppercase tracking-wide">size=sm / position=overlay</span>
          <div className="group relative bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
            <span className="text-gray-300 text-sm font-mono pr-8">hover-to-reveal-sm</span>
            <CopyButton text="hover-to-reveal-sm" size="sm" position="overlay" />
          </div>
        </div>
        {/* md / overlay */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-950 border border-gray-800">
          <span className="text-xs text-gray-500 uppercase tracking-wide">size=md / position=overlay</span>
          <div className="group relative bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
            <span className="text-gray-300 text-sm font-mono pr-10">hover-to-reveal-md</span>
            <CopyButton text="hover-to-reveal-md" size="md" position="overlay" />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABLE_ROWS: TableRow[] = [
  {
    param: "page_id",
    type: "string (UUID)",
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    description: "복사할 Notion 페이지의 고유 식별자",
  },
  {
    param: "database_id",
    type: "string (UUID)",
    example: "deadbeef-cafe-babe-feed-000000000000",
    description: "연결할 Notion 데이터베이스 ID",
  },
  {
    param: "version",
    type: "string",
    example: "2022-06-28",
    description: "Notion API 버전 헤더",
  },
  {
    param: "filter",
    type: "object",
    example: '{"property":"Status","select":{"equals":"Done"}}',
    description: "데이터베이스 쿼리 필터 객체",
  },
];

export default function WorkersPage() {
  return (
    <div className="min-h-screen bg-gray-950 dark:bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-white">Workers</span>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-xs border border-gray-700">
            Copy 기능 데모
          </span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">

        {/* Page Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            📋 Copy 기능 추가
          </h1>
          <p className="text-gray-400 text-base max-w-2xl">
            텍스트, 링크, 테이블 데이터, 민감 정보 등 다양한 콘텐츠를 클릭
            한 번으로 클립보드에 복사합니다. 요소에{" "}
            <strong className="text-gray-200">hover</strong>하면 복사 버튼이
            나타납니다.
          </p>
        </div>

        {/* API Endpoints */}
        <SectionCard
          title="🔗 API Endpoints"
          description="API Reference 페이지의 Endpoint URL 복사"
        >
          <div className="flex flex-col gap-3">
            <EndpointBanner method="GET" url="https://api.notion.com/v1/pages/{page_id}" />
            <EndpointBanner method="POST" url="https://api.notion.com/v1/pages" />
            <EndpointBanner method="PATCH" url="https://api.notion.com/v1/pages/{page_id}" />
            <EndpointBanner method="DELETE" url="https://api.notion.com/v1/blocks/{block_id}" />
          </div>
        </SectionCard>

        {/* Authentication — sensitive fields */}
        <SectionCard
          title="🔐 Authentication"
          description="토큰 및 시크릿 필드 복사. 마스킹 해제 후 복사 가능합니다."
        >
          <div className="flex flex-col gap-3">
            <CopyRow
              label="Integration Token"
              value="YOUR_NOTION_INTEGRATION_TOKEN"
              mono
              masked
            />
            <CopyRow
              label="OAuth Client Secret"
              value="YOUR_OAUTH_CLIENT_SECRET"
              mono
              masked
            />
            <CopyRow
              label="OAuth Client ID"
              value="your-oauth-client-id-placeholder"
              mono
            />
            <CopyRow
              label="Authorization Header"
              value="Bearer YOUR_NOTION_INTEGRATION_TOKEN"
              mono
              masked
            />
          </div>
        </SectionCard>

        {/* Quickstart — Database ID etc. */}
        <SectionCard
          title="🚀 Quickstart 설정값"
          description="Database ID 및 초기 설정 값 복사"
        >
          <div className="flex flex-col gap-3">
            <CopyRow
              label="Database ID"
              value="deadbeef-cafe-babe-feed-000000000000"
              mono
            />
            <CopyRow
              label="Workspace ID"
              value="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
              mono
            />
            <CopyRow label="API Base URL" value="https://api.notion.com/v1" mono />
            <CopyRow label="Notion-Version Header" value="2022-06-28" mono />
          </div>
        </SectionCard>

        {/* Inline Code Snippets */}
        <SectionCard
          title="💡 인라인 코드 스니펫"
          description="문서 내 인라인 코드 복사"
        >
          <div className="flex flex-col gap-4 text-sm text-gray-300 leading-relaxed">
            <p>
              데이터베이스를 쿼리하려면{" "}
              <InlineCode copyText="POST /v1/databases/{database_id}/query">
                POST /v1/databases/{"{database_id}"}/query
              </InlineCode>{" "}
              엔드포인트를 사용하세요.
            </p>
            <p>
              요청 헤더에{" "}
              <InlineCode copyText="Authorization: Bearer YOUR_NOTION_INTEGRATION_TOKEN">
                Authorization: Bearer YOUR_NOTION_INTEGRATION_TOKEN
              </InlineCode>{" "}
              를 포함해야 합니다.
            </p>
            <p>
              응답 타입은{" "}
              <InlineCode copyText="application/json">
                application/json
              </InlineCode>{" "}
              이며,{" "}
              <InlineCode copyText="Notion-Version: 2022-06-28">
                Notion-Version: 2022-06-28
              </InlineCode>{" "}
              헤더도 필수입니다.
            </p>
            <p>
              페이지네이션을 위해 응답의{" "}
              <InlineCode copyText="next_cursor">next_cursor</InlineCode> 값을
              다음 요청의{" "}
              <InlineCode copyText="start_cursor">start_cursor</InlineCode>{" "}
              파라미터로 전달하세요.
            </p>
          </div>
        </SectionCard>

        {/* Table with Copy */}
        <SectionCard
          title="📊 파라미터 테이블"
          description="테이블 셀 값 복사 — Example 열을 hover하면 복사 버튼이 나타납니다."
        >
          <CopyTable rows={TABLE_ROWS} />
        </SectionCard>

        {/* Component Showcase */}
        <ShowcaseCard />

        {/* Implementation Note */}
        <SectionCard title="📝 구현 노트">
          <ul className="flex flex-col gap-2 text-sm text-gray-400 list-none">
            {[
              "CopyButton props: text (복사 문자열), size (sm|md), position (inline|overlay)",
              "navigator.clipboard.writeText() 우선 사용, 미지원 시 document.execCommand('copy') 폴백",
              "복사 성공/실패 시 우하단 Toast 알림 (2.8초 자동 소멸)",
              "클릭 후 아이콘 📋 → ✅ 2초 후 원복",
              "overlay 포지션: absolute + group-hover 패턴으로 레이아웃 밀림 없음",
              "민감 정보 필드: 마스킹(•) 기본, 👁️ 버튼으로 reveal 후 복사",
            ].map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">▸</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

      </main>

      <ToastContainer />
    </div>
  );
}