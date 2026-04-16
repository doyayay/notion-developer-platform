"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, FileText, Database, Paperclip, Clock, ChevronDown, Filter, SortAsc } from "lucide-react";

type ResultType = "page" | "db" | "file";
type SortOption = "relevance" | "latest" | "title";
type FilterPeriod = "7d" | "30d" | "all";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  path: string;
  modifiedAt: string;
  preview: string;
  author: string;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: "1", type: "page", title: "Getting Started with the API", path: "Docs / API / Getting Started", modifiedAt: "2025-01-10", preview: "This guide walks you through the basics of authenticating and making your first API call...", author: "Alice" },
  { id: "2", type: "page", title: "Authentication Overview", path: "Docs / Authentication", modifiedAt: "2025-01-08", preview: "Authentication is handled via API keys. You can generate keys from your dashboard settings...", author: "Bob" },
  { id: "3", type: "db", title: "API Keys Table", path: "Database / Keys", modifiedAt: "2025-01-09", preview: "Contains all active and revoked API keys with metadata including creation date and scope...", author: "Alice" },
  { id: "4", type: "page", title: "Quickstart Guide", path: "Docs / Quickstart", modifiedAt: "2025-01-07", preview: "Follow these steps to integrate our platform into your project within minutes...", author: "Charlie" },
  { id: "5", type: "file", title: "api-spec-v2.yaml", path: "Attachments / Specs", modifiedAt: "2025-01-06", preview: "OpenAPI 3.0 specification file describing all available endpoints and schemas...", author: "Bob" },
  { id: "6", type: "db", title: "Workers Configuration", path: "Database / Workers", modifiedAt: "2025-01-05", preview: "Worker instances and their configuration settings including region and memory allocation...", author: "Charlie" },
  { id: "7", type: "page", title: "API Rate Limits", path: "Docs / API / Rate Limits", modifiedAt: "2025-01-04", preview: "Understand the rate limiting policies applied to different endpoint tiers...", author: "Alice" },
  { id: "8", type: "file", title: "postman-collection.json", path: "Attachments / Tools", modifiedAt: "2025-01-03", preview: "Postman collection with pre-configured requests for all major API endpoints...", author: "Bob" },
];

const TYPE_CONFIG: Record<ResultType, { label: string; icon: React.ReactNode; color: string }> = {
  page: { label: "Page", icon: <FileText size={14} />, color: "text-blue-400 bg-blue-400/10" },
  db: { label: "DB Item", icon: <Database size={14} />, color: "text-purple-400 bg-purple-400/10" },
  file: { label: "Attachment", icon: <Paperclip size={14} />, color: "text-emerald-400 bg-emerald-400/10" },
};

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-400/30 text-yellow-300 rounded px-0.5">{part}</mark>
    ) : part
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [filterType, setFilterType] = useState<ResultType | "all">("all");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [filterAuthor, setFilterAuthor] = useState<string>("all");
  const [expandedTypes, setExpandedTypes] = useState<Set<ResultType>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const authors = Array.from(new Set(MOCK_RESULTS.map((r) => r.author)));

  const filteredResults = useCallback(() => {
    let results = MOCK_RESULTS;
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      results = results.filter(
        (r) => r.title.toLowerCase().includes(q) || r.preview.toLowerCase().includes(q)
      );
    }
    if (filterType !== "all") results = results.filter((r) => r.type === filterType);
    if (filterAuthor !== "all") results = results.filter((r) => r.author === filterAuthor);
    if (filterPeriod !== "all") {
      const days = filterPeriod === "7d" ? 7 : 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      results = results.filter((r) => new Date(r.modifiedAt) >= cutoff);
    }
    if (sort === "latest") results = [...results].sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    if (sort === "title") results = [...results].sort((a, b) => a.title.localeCompare(b.title));
    return results;
  }, [debouncedQuery, filterType, filterAuthor, filterPeriod, sort]);

  useEffect(() => {
    if (debouncedQuery) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(t);
    }
  }, [debouncedQuery]);

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
  }, [open]);

  const results = filteredResults();
  const groupedResults = (Object.keys(TYPE_CONFIG) as ResultType[]).reduce((acc, type) => {
    const items = results.filter((r) => r.type === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {} as Record<ResultType, SearchResult[]>);

  const INITIAL_SHOW = 3;

  const toggleExpand = (type: ResultType) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const reset = () => {
    setQuery("");
    setSort("relevance");
    setFilterType("all");
    setFilterPeriod("all");
    setFilterAuthor("all");
    setExpandedTypes(new Set());
    setShowFilters(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200 transition-all text-sm w-64"
      >
        <Search size={15} />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="text-xs bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 px-4"
          onClick={(e) => { if (e.target === overlayRef.current) { setOpen(false); reset(); } }}
        >
          <div className="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
              <Search size={18} className="text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, databases, files..."
                className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 text-base outline-none"
              />
              {loading && (
                <div className="w-4 h-4 rounded-full border-2 border-gray-600 border-t-gray-300 animate-spin shrink-0" />
              )}
              {query && !loading && (
                <button onClick={() => setQuery("")} className="text-gray-600 hover:text-gray-400 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800/60 bg-gray-900/40">
              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <SortAsc size={13} className="text-gray-500" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 outline-none focus:border-gray-500 cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="latest">Latest</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ResultType | "all")}
                className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 outline-none focus:border-gray-500 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="page">Pages</option>
                <option value="db">DB Items</option>
                <option value="file">Attachments</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border transition-all ${
                  showFilters ? "border-gray-500 bg-gray-700 text-gray-200" : "border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-200"
                }`}
              >
                <Filter size={12} />
                Filters
              </button>

              <div className="ml-auto text-xs text-gray-600">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/60 bg-gray-900/20">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Period</span>
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                    className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 outline-none focus:border-gray-500 cursor-pointer"
                  >
                    <option value="all">All time</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Author</span>
                  <select
                    value={filterAuthor}
                    onChange={(e) => setFilterAuthor(e.target.value)}
                    className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 outline-none focus:border-gray-500 cursor-pointer"
                  >
                    <option value="all">Anyone</option>
                    {authors.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => { setFilterPeriod("all"); setFilterAuthor("all"); setFilterType("all"); }}
                  className="ml-auto text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Results */}
            <div className="max-h-[420px] overflow-y-auto">
              {!debouncedQuery.trim() ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <Search size={32} className="mb-3 opacity-40" />
                  <p className="text-sm">Type to start searching</p>
                  <p className="text-xs mt-1 opacity-60">Search across pages, databases, and attachments</p>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-700 border-t-gray-400 animate-spin mb-3" />
                  <p className="text-sm">Searching...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <Search size={32} className="mb-3 opacity-40" />
                  <p className="text-sm">No results for &ldquo;{debouncedQuery}&rdquo;</p>
                  <p className="text-xs mt-1 opacity-60">Try different keywords or adjust filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/60">
                  {(Object.keys(groupedResults) as ResultType[]).map((type) => {
                    const items = groupedResults[type];
                    const isExpanded = expandedTypes.has(type);
                    const shown = isExpanded ? items : items.slice(0, INITIAL_SHOW);
                    const cfg = TYPE_CONFIG[type];
                    return (
                      <div key={type}>
                        {/* Group Header */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/60">
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                          <span className="text-xs text-gray-600">{items.length} result{items.length !== 1 ? "s" : ""}</span>
                        </div>

                        {/* Result Cards */}
                        {shown.map((result) => (
                          <button
                            key={result.id}
                            className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">
                                  {highlight(result.title, debouncedQuery)}
                                </h3>
                                <p className="text-xs text-gray-600 mt-0.5 truncate">{result.path}</p>
                                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                                  {highlight(result.preview, debouncedQuery)}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Clock size={11} />
                                  <span>{result.modifiedAt}</span>
                                </div>
                                <span className="text-xs text-gray-700">{result.author}</span>
                              </div>
                            </div>
                          </button>
                        ))}

                        {/* Show More */}
                        {items.length > INITIAL_SHOW && (
                          <button
                            onClick={() => toggleExpand(type)}
                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 transition-all"
                          >
                            <ChevronDown
                              size={13}
                              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            />
                            {isExpanded
                              ? "Show less"
                              : `Show ${items.length - INITIAL_SHOW} more ${cfg.label.toLowerCase()}${items.length - INITIAL_SHOW > 1 ? "s" : ""}`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-800 bg-gray-900/40">
              <div className="flex items-center gap-3 text-xs text-gray-700">
                <span className="flex items-center gap-1"><kbd className="bg-gray-800 border border-gray-700 rounded px-1 font-mono">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-gray-800 border border-gray-700 rounded px-1 font-mono">↵</kbd> Open</span>
                <span className="flex items-center gap-1"><kbd className="bg-gray-800 border border-gray-700 rounded px-1 font-mono">Esc</kbd> Close</span>
              </div>
              <button
                onClick={() => { setOpen(false); reset(); }}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
