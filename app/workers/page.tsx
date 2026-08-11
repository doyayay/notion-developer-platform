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

interface CopyFieldProps {
  label: string;
  value: string;
  sensitive?: boolean;
  size?: CopySize;
}

interface TableRow {
  method: string;
  endpoint: string;
  description: string;
}

// ─── Clipboard Utility ────────────────────────────────────────────────────────

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback: document.execCommand
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

// ─── Toast Context / Store (local) ───────────────────────────────────────────

let toastId = 0;

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, addToast };
}

// ─── Toast Container ──────────────────────────────────────────────────────────

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
            backdrop-blur-sm border transition-all duration-300 animate-fade-in
            ${
              toast.type === "success"
                ? "bg-gray-900/95 border-gray-700 text-green-400"
                : "bg-gray-900/95 border-gray-700 text-red-400"
            }
          `}
        >
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          <span className="text-gray-100">{toast.message}</span>
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
      ? "w-6 h-6 text-xs"
      : "w-8 h-8 text-sm";

  const positionClasses =
    position === "overlay"
      ? "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      : "relative flex-shrink-0";

  return (
    <button
      onClick={handleCopy}
      aria-label={label ?? "Copy to clipboard"}
      title={copied ? "Copied!" : "Copy to clipboard"}
      className={`
        ${positionClasses}
        ${sizeClasses}
        inline-flex items-center justify-center rounded-lg
        bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600
        border border-gray-700 dark:border-gray-600
        text-gray-400 hover:text-gray-100
        transition-all duration-150 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-gray-500
        z-10
      `}
    >
      {copied ? "✅" : "📋"}
    </button>
  );
}

// ─── CopyField Component ──────────────────────────────────────────────────────

function CopyField({
  label,
  value,
  sensitive = false,
  size = "md",
  onCopy,
}: CopyFieldProps & { onCopy?: (success: boolean) => void }) {
  const [revealed, setRevealed] = useState(false);
  const displayValue = sensitive && !revealed ? "•".repeat(Math.min(value.length, 32)) : value;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div className="group relative flex items-center gap-2 bg-gray-900 dark:bg-gray-950 border border-gray-800 dark:border-gray-700 rounded-xl px-4 py-3">
        <span className="font-mono text-sm text-gray-300 dark:text-gray-200 truncate flex-1 select-all">
          {displayValue}
        </span>
        {sensitive && (
          <button
            onClick={() => setRevealed((r) => !r)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-1"
            aria-label={revealed ? "Hide value" : "Reveal value"}
          >
            {revealed ? "🙈" : "👁️"}
          </button>
        )}
        <CopyButton text={value} size={size} position="inline" onCopy={onCopy} />
      </div>
    </div>
  );
}

// ─── Inline Code Snippet ──────────────────────────────────────────────────────

function InlineCode({
  code,
  onCopy,
}: {
  code: string;
  onCopy?: (success: boolean) => void;
}) {
  return (
    <span className="group relative inline-flex items-center gap-1.5">
      <code className="bg-gray-800 dark:bg-gray-900 text-green-400 font-mono text-sm px-2 py-0.5 rounded-lg border border-gray-700 dark:border-gray-700">
        {code}
      </code>
      <CopyButton text={code} size="sm" position="inline" onCopy={onCopy} />
    </span>
  );
}

// ─── Endpoint Row ─────────────────────────────────────────────────────────────

function EndpointRow({
  method,
  endpoint,
  description,
  onCopy,
}: TableRow & { onCopy?: (success: boolean, value: string) => void }) {
  const methodColors: Record<string, string> = {
    GET: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    POST: "text-green-400 bg-green-400/10 border-green-400/30",
    PATCH: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    DELETE: "text-red-400 bg-red-400/10 border-red-400/30",
  };

  return (
    <tr className="group border-b border-gray-800 dark:border-gray-800 hover:bg-gray-800/40 dark:hover:bg-gray-800/30 transition-colors">
      <td className="py-3 px-4">
        <span
          className={`inline-block font-mono text-xs font-bold px-2 py-1 rounded-lg border ${
            methodColors[method] ?? "text-gray-400 bg-gray-800 border-gray-700"
          }`}
        >
          {method}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-gray-300 dark:text-gray-200 truncate max-w-xs">
            {endpoint}
          </span>
          <CopyButton
            text={endpoint}
            size="sm"
            position="inline"
            onCopy={(s) => onCopy?.(s, endpoint)}
          />
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-400 dark:text-gray-500">{description}</td>
    </tr>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-gray-900 dark:bg-gray-900 border border-gray-800 dark:border-gray-800 overflow-hidden shadow-xl">
      <div className="px-6 py-5 border-b border-gray-800 dark:border-gray-800 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white">{title}</h2>
            {badge && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 border border-gray-600">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

// ─── Storybook-style Showcase Card ───────────────────────────────────────────

function ShowcaseCard({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-800 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 bg-gray-800/60 dark:bg-gray-800/40 border-b border-gray-800 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-300 tracking-wide">{label}</span>
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      <div className="px-6 py-5 bg-gray-900/50 dark:bg-gray-900/30 flex items-center gap-3 flex-wrap">
        {children}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const API_ENDPOINTS: TableRow[] = [
  { method: "GET", endpoint: "https://api.notion.com/v1/pages", description: "Retrieve a page object" },
  { method: "POST", endpoint: "https://api.notion.com/v1/pages", description: "Create a new page" },
  { method: "PATCH", endpoint: "https://api.notion.com/v1/pages/:id", description: "Update page properties" },
  { method: "GET", endpoint: "https://api.notion.com/v1/databases/:id", description: "Retrieve a database" },
  { method: "DELETE", endpoint: "https://api.notion.com/v1/blocks/:id", description: "Delete a block" },
];

export default function WorkersPage() {
  const { toasts, addToast } = useToast();

  const handleCopy = useCallback(
    (success: boolean, context?: string) => {
      if (success) {
        addToast(`Copied${context ? ` "${context.slice(0, 28)}${context.length > 28 ? "…" : ""}"` : ""} to clipboard`, "success");
      } else {
        addToast("Failed to copy — please copy manually", "error");
      }
    },
    [addToast]
  );

  // Inject keyframe animation
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">

        {/* Header */}
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Copy 기능 추가</h1>
              <p className="text-sm text-gray-500 mt-0.5">Universal clipboard copy for API endpoints, tokens, code, and table data</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {["CopyButton Component", "Overlay & Inline", "Toast Feedback", "Clipboard Fallback"].map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* ── Section 1: CopyButton Storybook Showcase ── */}
        <SectionCard
          title="CopyButton Component"
          subtitle="Reusable component with size and position variants — props: text, size (sm/md), position (inline/overlay)"
          badge="Storybook"
        >
          <div className="flex flex-col gap-4">
            <ShowcaseCard label="size=&quot;md&quot; position=&quot;inline&quot;" description="Default">
              <span className="text-sm text-gray-400">Click to copy:</span>
              <CopyButton
                text="YOUR_API_KEY"
                size="md"
                position="inline"
                label="Copy API key"
                onCopy={(s) => handleCopy(s, "YOUR_API_KEY")}
              />
            </ShowcaseCard>

            <ShowcaseCard label="size=&quot;sm&quot; position=&quot;inline&quot;" description="Compact">
              <span className="text-sm text-gray-400">Small variant:</span>
              <CopyButton
                text="npm install notion-sdk"
                size="sm"
                position="inline"
                label="Copy command"
                onCopy={(s) => handleCopy(s, "npm install notion-sdk")}
              />
            </ShowcaseCard>

            <ShowcaseCard label="position=&quot;overlay&quot;" description="Hover to reveal button">
              <div className="group relative flex items-center bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 w-full min-w-60">
                <span className="font-mono text-sm text-gray-300 flex-1">
                  process.env.NOTION_SECRET
                </span>
                <CopyButton
                  text="process.env.NOTION_SECRET"
                  size="sm"
                  position="overlay"
                  onCopy={(s) => handleCopy(s, "process.env.NOTION_SECRET")}
                />
              </div>
              <span className="text-xs text-gray-600 ml-2">← hover the field</span>
            </ShowcaseCard>
          </div>
        </SectionCard>

        {/* ── Section 2: Authentication — Token / Secret Fields ── */}
        <SectionCard
          title="Authentication"
          subtitle="Sensitive credential fields with reveal toggle and one-click copy"
          badge="Auth Page"
        >
          <div className="flex flex-col gap-4">
            <CopyField
              label="Integration Token"
              value="YOUR_NOTION_INTEGRATION_TOKEN"
              sensitive
              size="md"
              onCopy={(s) => handleCopy(s, "Integration Token")}
            />
            <CopyField
              label="OAuth Client Secret"
              value="YOUR_OAUTH_CLIENT_SECRET"
              sensitive
              size="md"
              onCopy={(s) => handleCopy(s, "OAuth Client Secret")}
            />
            <CopyField
              label="Webhook Signing Secret"
              value="YOUR_WEBHOOK_SIGNING_SECRET"
              sensitive
              size="md"
              onCopy={(s) => handleCopy(s, "Webhook Signing Secret")}
            />
            <CopyField
              label="OAuth Client ID"
              value="YOUR_OAUTH_CLIENT_ID"
              sensitive={false}
              size="sm"
              onCopy={(s) => handleCopy(s, "OAuth Client ID")}
            />
          </div>
        </SectionCard>

        {/* ── Section 3: Quickstart — Config Values ── */}
        <SectionCard
          title="Quickstart"
          subtitle="Configuration values and IDs used throughout the integration setup"
          badge="Quickstart Page"
        >
          <div className="flex flex-col gap-4">
            <CopyField
              label="Database ID"
              value="YOUR_NOTION_DATABASE_ID"
              size="md"
              onCopy={(s) => handleCopy(s, "Database ID")}
            />
            <CopyField
              label="Page ID"
              value="YOUR_NOTION_PAGE_ID"
              size="md"
              onCopy={(s) => handleCopy(s, "Page ID")}
            />
            <CopyField
              label="Notion API Base URL"
              value="https://api.notion.com/v1"
              size="md"
              onCopy={(s) => handleCopy(s, "API Base URL")}
            />

            {/* Inline code snippets */}
            <div className="flex flex-col gap-3 pt-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Inline Code Snippets
              </span>
              <div className="flex flex-wrap gap-3 items-center">
                <InlineCode
                  code="notion-version: 2022-06-28"
                  onCopy={(s) => handleCopy(s, "notion-version header")}
                />
                <InlineCode
                  code="Content-Type: application/json"
                  onCopy={(s) => handleCopy(s, "Content-Type header")}
                />
                <InlineCode
                  code="Bearer YOUR_TOKEN"
                  onCopy={(s) => handleCopy(s, "Bearer token format")}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 4: API Reference — Endpoint Table ── */}
        <SectionCard
          title="API Reference"
          subtitle="Click the copy icon beside any endpoint URL to copy it to your clipboard"
          badge="API Ref Page"
        >
          <div className="overflow-x-auto rounded-xl border border-gray-800 dark:border-gray-800">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 dark:border-gray-800 bg-gray-800/50">
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-500 w-24">
                    Method
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Endpoint URL
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {API_ENDPOINTS.map((row, i) => (
                  <EndpointRow
                    key={i}
                    {...row}
                    onCopy={(s, v) => handleCopy(s, v)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* ── Section 5: Fallback Info ── */}
        <SectionCard
          title="Browser Compatibility"
          subtitle="Clipboard API support and fallback strategy"
          badge="Implementation"
        >
          <div className="flex flex-col gap-3">
            {[
              {
                icon: "✅",
                label: "navigator.clipboard.writeText()",
                note: "Modern browsers — used by default",
                color: "text-green-400",
              },
              {
                icon: "⚡",
                label: "document.execCommand('copy')",
                note: "Fallback for older / restricted environments",
                color: "text-yellow-400",
              },
              {
                icon: "🔔",
                label: "Toast Notifications",
                note: "Success & error feedback, auto-dismiss after 3s",
                color: "text-blue-400",
              },
              {
                icon: "🎯",
                label: "Absolute positioning (overlay mode)",
                note: "Copy button never shifts content layout",
                color: "text-purple-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 dark:bg-gray-800/30 border border-gray-800"
              >
                <span className="text-lg mt-0.5">{item.icon}</span>
                <div>
                  <p className={`text-sm font-semibold font-mono ${item.color}`}>{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-700 dark:text-gray-700 py-4">
          CopyButton · app/components/CopyButton.tsx · Works across API Reference, Auth &amp; Quickstart pages
        </footer>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}