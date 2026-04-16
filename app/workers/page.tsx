'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Clock, AlertCircle, ChevronDown, Filter, X } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: 'page' | 'db' | 'file';
  path: string;
  preview: string;
  modifiedDate: string;
  author: string;
}

interface FilterState {
  types: ('page' | 'db' | 'file')[];
  authors: string[];
  dateRange: 'all' | '7days' | '30days';
}

interface SortOption {
  value: 'relevance' | 'recent' | 'title';
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'relevance', label: '관련도' },
  { value: 'recent', label: '최신순' },
  { value: 'title', label: '제목순' },
];

const SAMPLE_RESULTS: SearchResult[] = [
  {
    id: '1',
    title: '검색 기능 추가 - 프로젝트 개요',
    type: 'page',
    path: 'Docs / Projects / Search Feature',
    preview: '서비스 내 정보가 늘어나면서 원하는 정보를 빠르게 찾기 어려운 문제를 해결한다...',
    modifiedDate: '2024-01-15',
    author: 'John Doe',
  },
  {
    id: '2',
    title: '검색 알고리즘 개선 방안',
    type: 'db',
    path: 'Database / Tasks',
    preview: '현재 검색 성능을 개선하기 위한 알고리즘 비교 분석 자료입니다...',
    modifiedDate: '2024-01-14',
    author: 'Jane Smith',
  },
  {
    id: '3',
    title: 'search-requirements.pdf',
    type: 'file',
    path: 'Files / Documents',
    preview: '검색 기능 요구사항 상세 문서',
    modifiedDate: '2024-01-13',
    author: 'Admin',
  },
  {
    id: '4',
    title: '검색 UI/UX 디자인 시안',
    type: 'page',
    path: 'Design / Components',
    preview: '사용자 중심의 검색 인터페이스 설계 문서입니다...',
    modifiedDate: '2024-01-12',
    author: 'Designer Kim',
  },
  {
    id: '5',
    title: '검색 기능 API 명세서',
    type: 'db',
    path: 'API / Endpoints',
    preview: '검색 API의 요청/응답 형식 및 파라미터 설명서...',
    modifiedDate: '2024-01-11',
    author: 'Backend Team',
  },
];

const RECENT_SEARCHES = ['검색 기능', '사용자 권한', '데이터베이스 구조'];
const RECENT_VIEWED = [
  { id: '10', title: '프로젝트 대시보드', type: 'page' as const },
  { id: '11', title: '팀 멤버 목록', type: 'db' as const },
];

export default function WorkersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'title'>('relevance');
  const [filters, setFilters] = useState<FilterState>({
    types: ['page', 'db', 'file'],
    authors: [],
    dateRange: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowResults(true);
      }
      if (e.key === 'Escape') {
        setShowResults(false);
        setSelectedIndex(-1);
      }
      if (e.key === 'ArrowDown' && showResults) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      }
      if (e.key === 'ArrowUp' && showResults) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        // Handle selection
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResults, results.length, selectedIndex]);

  // Debounced search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedIndex(-1);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      const filtered = SAMPLE_RESULTS.filter(
        (result) =>
          (result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.preview.toLowerCase().includes(query.toLowerCase())) &&
          filters.types.includes(result.type)
      );

      setResults(filtered);
      setShowResults(true);
    }, 300);
  }, [filters.types]);

  const groupedResults = results.reduce(
    (acc, result) => {
      const type = result.type === 'page' ? '페이지' : result.type === 'db' ? 'DB 항목' : '첨부파일';
      if (!acc[type]) acc[type] = [];
      acc[type].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  const typeColors: Record<string, string> = {
    '페이지': 'bg-blue-900/30 text-blue-300 dark:bg-blue-900/50 dark:text-blue-200',
    'DB 항목': 'bg-purple-900/30 text-purple-300 dark:bg-purple-900/50 dark:text-purple-200',
    '첨부파일': 'bg-amber-900/30 text-amber-300 dark:bg-amber-900/50 dark:text-amber-200',
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-500/30 text-inherit font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-black/95 text-gray-200 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">검색</h1>
          <p className="text-gray-400">전체 콘텐츠에서 빠르게 원하는 정보를 찾으세요</p>
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <div className="relative rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 focus-within:border-blue-500 transition-colors">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowResults(true)}
              placeholder="검색어를 입력하세요... (⌘K)"
              className="w-full bg-transparent px-12 py-4 text-white placeholder-gray-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setResults([]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        {showResults && (
          <div className="flex gap-3 mb-6">
            <div className="flex gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <Filter className="w-4 h-4" />
              필터
            </button>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-white mb-3">타입</p>
                <div className="flex gap-3">
                  {(['page', 'db', 'file'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={(e) => {
                          setFilters({
                            ...filters,
                            types: e.target.checked
                              ? [...filters.types, type]
                              : filters.types.filter((t) => t !== type),
                          });
                        }}
                        className="w-4 h-4 rounded bg-gray-800 border-gray-700"
                      />
                      <span className="text-sm">
                        {type === 'page' ? '페이지' : type === 'db' ? 'DB 항목' : '첨부파일'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-3">기간</p>
                <div className="flex gap-3">
                  {(['all', '7days', '30days'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setFilters({ ...filters, dateRange: range })}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.dateRange === range
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {range === 'all' ? '전체' : range === '7days' ? '7일' : '30일'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results or Empty State */}
        {showResults ? (
          <>
            {searchQuery ? (
              results.length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(groupedResults).map(([type, typeResults]) => (
                    <div key={type}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[type]}`}>
                          {type}
                        </span>
                        <span className="text-sm text-gray-500">{typeResults.length}개</span>
                      </div>
                      <div className="space-y-3">
                        {typeResults.map((result, idx) => (
                          <div
                            key={result.id}
                            onClick={() => setSelectedIndex(results.indexOf(result))}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                              selectedIndex === results.indexOf(result)
                                ? 'bg-gray-800 border-blue-500'
                                : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <h3 className="font-semibold text-white mb-2">
                              {highlightMatch(result.title, searchQuery)}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                              {highlightMatch(result.preview, searchQuery)}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{result.path}</span>
                              <div className="flex gap-4">
                                <span>{result.author}</span>
                                <span>{result.modifiedDate}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-gray-900 border border-gray-800 p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">검색 결과 없음</h3>
                  <p className="text-gray-400 mb-6">
                    "{searchQuery}"에 대한 결과를 찾을 수 없습니다.
                  </p>
                  <div>
                    <p className="text-sm text-gray-500 mb