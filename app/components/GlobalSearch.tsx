"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, FileText, Database, Paperclip, Clock, ChevronDown, Filter } from "lucide-react";

type ResultType = "page" | "db" | "file";

type SortOption = "relevance" | "latest" | "title";
type DateFilter = "7days" | "30days" | "all";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  path: string;
  modifiedAt: string;
  preview: string;
  author: string;
}

const MOCK_DATA: SearchResult[] = [
  { id: "1", type: "page", title: "Getting Started with Notion API", path: "Docs / Getting Started", modifiedAt: "2025-06-01", preview: "Learn how to authenticate and make your first API call to the Notion platform integration...", author: "Alice" },
  { id: "2", type: "page", title: "Authentication Guide", path: "Docs / Auth", modifiedAt: "2025-05-28", preview: "OAuth 2.0 flow and token management for Notion integrations. Securely handle user credentials...", author: "Bob" },
  { id: "3", type: "db", title: "API Endpoints Database", path: "API Reference / Endpoints", modifiedAt: "2025-06-05", preview: "Complete list of REST API endpoints including parameters, response types, and rate limits...", author: "Alice" },
  { id: "4", type: "db", title: "Integration Templates", path: "Resources / Templates", modifiedAt: "2025-05-15", preview: "Pre-built integration templates for common use cases like CRM sync, task management...", author: "Charlie" },
  { id: "5", type: "file", title: "notion-sdk-v2.zip", path: "Downloads / SDK", modifiedAt: "2025-06-03", preview: "SDK package containing client libraries for JavaScript, Python, and Ruby...", author: "Bob" },
  { id: "6", type: "page", title: "Quickstart Tutorial", path: "Docs / Quickstart", modifiedAt: "2025-06-07", preview: "Step-by-step guide to build your first Notion integration in under 10 minutes...", author: "Alice" },
  { id: "7", type: "db", title: "Webhook Events Reference", path: "API Reference / Webhooks", modifiedAt: "2025-04-20", preview: "All supported webhook event types, payload schemas, and retry policies for Notion...", author: "Charlie" },
  { id: "8", type: "file", title: "api-spec-openapi.yaml", path: "Downloads / Specs", modifiedAt: "2025-05-30", preview: "OpenAPI 3.0 specification file for the Notion REST API, importable into Postman or Insomnia...", author: "Bob" },
];

const TYPE_LABELS: Record<ResultType, string> = { page: "페이지", db: "DB 항목", file: "첨부파일" };
const TYPE_ICONS: Record<ResultType, React.ReactNode> = {
  page: <FileText size={14} />,
  db: <Database size={14} />,
  file: <Paperclip size={14} />,
};
const TYPE_COLORS: Record<ResultType, string> = {
  page: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  db: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  file: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded px-0.5">{part}</mark>
    ) : part
  );
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

const VISIBLE_LIMIT = 3;

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [filterType, setFilterType] = useState<ResultType | "all">("all");
  const [filterDate, setFilterDate] = useState<DateFilter>("all");
  const [filterAuthor, setFilterAuthor] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<ResultType, boolean>>({ page: false, db: false, file: false });
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setShowFilters(false); setExpanded({ page: false, db: false, file: false }); }
  }, [open]);

  const authors = Array.from(new Set(MOCK_DATA.map((r) => r.author)));

  const filtered = MOCK_DATA.filter((r) => {
    if (!debouncedQuery.trim()) return false;
    const q = debouncedQuery.toLowerCase();
    const matchesText = r.title.toLowerCase().includes(q) || r.preview.toLowerCase().includes(q);
    const matchesType = filterType === "all" || r.type === filterType;
    const matchesAuthor = filterAuthor === "all" || r.author === filterAuthor;
    const days = daysSince(r.modifiedAt);
    const matchesDate = filterDate === "all" || (filterDate === "7days" && days <= 7) || (filterDate === "30days" && days <= 30);
    return matchesText && matchesType && matchesAuthor && matchesDate;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "latest") return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
    if (sort === "title") return a.title.localeCompare(b.title);
    // relevance: title match > preview match
    const q = debouncedQuery.toLowerCase();
    const aScore = (a.title.toLowerCase().includes(q) ? 2 : 0) + (a.preview.toLowerCase().includes(q) ? 1 : 0);
    const bScore = (b.title.toLowerCase().includes(q) ? 2 : 0) + (b.preview.toLowerCase().includes(q) ? 1 : 0);
    return bScore - aScore;
  });

  const groups: Record<ResultType, SearchResult[]> = { page: [], db: [], file: [] };
  sorted.forEach((r) => groups[r.type].push(r));

  const groupOrder: ResultType[] = ["page", "db", "file"];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500 text-sm transition-colors group"
        aria-label="검색 열기"
      >
        <Search size={14} />
        <span className="hidden md:inline">검색...</span>
        <kbd className="hidden md:inline text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
        >
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="검색어를 입력하세요..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none text-sm"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
                  showFilters
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Filter size={12} /> 필터
              </button>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 ml-1">
                <X size={18} />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap gap-3">
                {/* Sort */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">정렬:</span>
                  {(["relevance", "latest", "title"] as SortOption[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                        sort === s ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {{ relevance: "관련도", latest: "최신순", title: "제목순" }[s]}
                    </button>
                  ))}
                </div>
                {/* Type */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">타입:</span>
                  {(["all", "page", "db", "file"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                        filterType === t ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {{ all: "전체", page: "페이지", db: "DB", file: "파일" }[t]}
                    </button>
                  ))}
                </div>
                {/* Date */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">기간:</span>
                  {(["7days", "30days", "all"] as DateFilter[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilterDate(d)}
                      className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                        filterDate === d ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {{ "7days": "최근 7일", "30days": "최근 30일", all: "전체" }[d]}
                    </button>
                  ))}
                </div>
                {/* Author */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">작성자:</span>
                  <select
                    value={filterAuthor}
                    onChange={(e) => setFilterAuthor(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 outline-none"
                  >
                    <option value="all">전체</option>
                    {authors.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!debouncedQuery.trim() ? (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">
                  <Search size={32} className="mx-auto mb-3 opacity-30" />
                  검색어를 입력해 정보를 빠르게 찾아보세요
                </div>
              ) : sorted.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">
                  <X size={32} className="mx-auto mb-3 opacity-30" />
                  <span>"{debouncedQuery}"에 대한 결과가 없습니다</span>
                </div>
              ) : (
                <div className="py-2">
                  {groupOrder.map((type) => {
                    const items = groups[type];
                    if (items.length === 0) return null;
                    const isExpanded = expanded[type];
                    const visible = isExpanded ? items : items.slice(0, VISIBLE_LIMIT);
                    return (
                      <div key={type} className="mb-1">
                        <div className="px-4 py-1.5 flex items-center gap-2">
                          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[type]}`}>
                            {TYPE_ICONS[type]} {TYPE_LABELS[type]}
                          </span>
                          <span className="text-xs text-gray-400">{items.length}개</span>
                        </div>
                        {visible.map((result) => (
                          <button
                            key={result.id}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                            onClick={() => setOpen(false)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {highlight(result.title, debouncedQuery)}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 truncate">{result.path}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                  {highlight(result.preview, debouncedQuery)}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                  <Clock size={11} />{result.modifiedAt}
                                </span>
                                <span className="text-xs text-gray-400">{result.author}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                        {items.length > VISIBLE_LIMIT && (
                          <button
                            onClick={() => setExpanded((prev) => ({ ...prev, [type]: !prev[type] }))}
                            className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <ChevronDown size={13} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            {isExpanded ? "접기" : `${items.length - VISIBLE_LIMIT}개 더 보기`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50">
              <span className="text-xs text-gray-400 flex items-center gap-1"><kbd className="bg-gray-200 dark:bg-gray-700 text-gray-500 px-1 rounded text-xs font-mono">↵</kbd> 선택</span>
              <span className="text-xs text-gray-400 flex items-center gap-1"><kbd className="bg-gray-200 dark:bg-gray-700 text-gray-500 px-1 rounded text-xs font-mono">ESC</kbd> 닫기</span>
              {sorted.length > 0 && (
                <span className="ml-auto text-xs text-gray-400">총 {sorted.length}개 결과</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
