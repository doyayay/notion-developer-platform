"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, FileText, Database, Paperclip, Clock, ChevronDown, Filter } from "lucide-react";

type ResultType = "page" | "db" | "file";
type SortOption = "relevance" | "latest" | "title";
type PeriodFilter = "7days" | "30days" | "all";

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
  { id: "1", type: "page", title: "Getting Started with Notion API", path: "Docs / Getting Started", modifiedAt: "2025-01-10", preview: "Learn how to authenticate and make your first API call to the Notion platform integration.", author: "Alice" },
  { id: "2", type: "page", title: "Authentication Guide", path: "Docs / Authentication", modifiedAt: "2025-01-08", preview: "OAuth 2.0 flow and internal integration tokens are the two primary authentication methods.", author: "Bob" },
  { id: "3", type: "db", title: "API Endpoints Reference", path: "Database / API Reference", modifiedAt: "2025-01-12", preview: "Complete list of REST API endpoints including parameters, request body, and response schema.", author: "Alice" },
  { id: "4", type: "db", title: "Changelog Database", path: "Database / Changelog", modifiedAt: "2025-01-05", preview: "Version history and release notes for all Notion API updates and deprecations.", author: "Carol" },
  { id: "5", type: "file", title: "notion-sdk-quickstart.zip", path: "Files / Quickstart", modifiedAt: "2024-12-28", preview: "Starter project with pre-configured SDK setup and example integration scripts.", author: "Bob" },
  { id: "6", type: "page", title: "Webhooks & Events", path: "Docs / Advanced", modifiedAt: "2025-01-09", preview: "Set up real-time webhooks to listen for page, database, and block change events.", author: "Carol" },
  { id: "7", type: "page", title: "Rate Limits & Quotas", path: "Docs / Reference", modifiedAt: "2024-12-20", preview: "Understanding API rate limits, quota management, and best practices for high-volume usage.", author: "Alice" },
  { id: "8", type: "db", title: "Integration Templates", path: "Database / Templates", modifiedAt: "2025-01-11", preview: "Ready-to-use integration templates for common use cases like CRM, project management, and more.", author: "Bob" },
];

const TYPE_LABELS: Record<ResultType, string> = { page: "Page", db: "DB Item", file: "Attachment" };
const TYPE_ICONS: Record<ResultType, React.ReactNode> = {
  page: <FileText size={14} />,
  db: <Database size={14} />,
  file: <Paperclip size={14} />,
};
const TYPE_COLORS: Record<ResultType, string> = {
  page: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  db: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  file: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function daysDiff(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  return diff;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [filterType, setFilterType] = useState<ResultType | "all">("all");
  const [filterPeriod, setFilterPeriod] = useState<PeriodFilter>("all");
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [expandedTypes, setExpandedTypes] = useState<Set<ResultType>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const AUTHORS = Array.from(new Set(MOCK_DATA.map((d) => d.author)));

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Search
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      let filtered = MOCK_DATA.filter(
        (d) =>
          d.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          d.preview.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      if (filterType !== "all") filtered = filtered.filter((d) => d.type === filterType);
      if (filterAuthor !== "all") filtered = filtered.filter((d) => d.author === filterAuthor);
      if (filterPeriod === "7days") filtered = filtered.filter((d) => daysDiff(d.modifiedAt) <= 7);
      if (filterPeriod === "30days") filtered = filtered.filter((d) => daysDiff(d.modifiedAt) <= 30);
      if (sort === "latest") filtered.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
      if (sort === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
      setResults(filtered);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [debouncedQuery, filterType, filterPeriod, filterAuthor, sort]);

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

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setResults([]); setShowFilters(false); }
  }, [open]);

  const grouped = results.reduce<Record<ResultType, SearchResult[]>>(
    (acc, r) => { acc[r.type].push(r); return acc; },
    { page: [], db: [], file: [] }
  );
  const LIMIT = 3;

  const toggleExpand = (type: ResultType) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) setOpen(false);
  }, []);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, databases, files…"
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm outline-none"
          />
          {loading && (
            <span className="text-xs text-gray-400 animate-pulse">Searching…</span>
          )}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`p-1.5 rounded-lg transition-colors ${
              showFilters ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Toggle filters"
          >
            <Filter size={15} />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap gap-3">
            {/* Type */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium">Type</span>
              <div className="flex gap-1">
                {(["all", "page", "db", "file"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filterType === t
                        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {t === "all" ? "All" : TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            {/* Period */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium">Period</span>
              <div className="flex gap-1">
                {(["all", "7days", "30days"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPeriod(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filterPeriod === p
                        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {p === "all" ? "All time" : p === "7days" ? "Last 7 days" : "Last 30 days"}
                  </button>
                ))}
              </div>
            </div>
            {/* Author */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium">Author</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterAuthor("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterAuthor === "all"
                      ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  All
                </button>
                {AUTHORS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setFilterAuthor(a)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filterAuthor === a
                        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            {/* Sort */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium">Sort</span>
              <div className="flex gap-1">
                {(["relevance", "latest", "title"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      sort === s
                        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {s === "relevance" ? "Relevance" : s === "latest" ? "Latest" : "Title"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === "" && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
              <Search size={32} strokeWidth={1.5} />
              <p className="text-sm">Type to search across pages, databases, and files</p>
              <p className="text-xs">Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 font-mono">Esc</kbd> to close</p>
            </div>
          )}

          {query.trim() !== "" && !loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
              <Search size={32} strokeWidth={1.5} />
              <p className="text-sm">No results found for <strong className="text-gray-600 dark:text-gray-300">&ldquo;{query}&rdquo;</strong></p>
              <p className="text-xs">Try different keywords or adjust filters</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {(Object.entries(grouped) as [ResultType, SearchResult[]][]).map(
                ([type, items]) => {
                  if (items.length === 0) return null;
                  const isExpanded = expandedTypes.has(type);
                  const visible = isExpanded ? items : items.slice(0, LIMIT);
                  const hasMore = items.length > LIMIT;
                  return (
                    <div key={type}>
                      {/* Group Header */}
                      <div className="flex items-center gap-2 px-4 py-2">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[type]}`}>
                          {TYPE_ICONS[type]}
                          {TYPE_LABELS[type]}
                        </span>
                        <span className="text-xs text-gray-400">{items.length} result{items.length !== 1 ? "s" : ""}</span>
                      </div>
                      {/* Result Cards */}
                      {visible.map((item) => (
                        <div
                          key={item.id}
                          className="mx-3 mb-1.5 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white leading-snug">
                              {highlight(item.title, debouncedQuery)}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0 mt-0.5">
                              <Clock size={11} />
                              {item.modifiedAt}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">{item.path} · {item.author}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {highlight(item.preview, debouncedQuery)}
                          </p>
                        </div>
                      ))}
                      {/* Show More */}
                      {hasMore && (
                        <button
                          onClick={() => toggleExpand(type)}
                          className="mx-3 mb-2 w-[calc(100%-1.5rem)] flex items-center justify-center gap-1 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                        >
                          <ChevronDown size={13} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          {isExpanded ? "Show less" : `Show ${items.length - LIMIT} more`}
                        </button>
                      )}
                    </div>
                  );
                }
              )}

              <p className="text-center text-xs text-gray-300 dark:text-gray-600 py-3">
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
