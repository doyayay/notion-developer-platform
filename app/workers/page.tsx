'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Clock, AlertCircle, ChevronDown, Filter, ArrowUpDown } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'page' | 'db' | 'file';
  title: string;
  path: string;
  preview: string;
  lastModified: string;
  author: string;
  relevance: number;
}

interface RecentItem {
  id: string;
  title: string;
  type: 'page' | 'db' | 'file';
  timestamp: string;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'page',
    title: '검색 기능 개발 가이드',
    path: '/docs/features/search',
    preview: '전역 검색을 통해 서비스 내 모든 정보를 빠르게 찾을 수 있습니다. 키워드 기반의 효율적인...',
    lastModified: '2024-01-15',
    author: '김철수',
    relevance: 0.98,
  },
  {
    id: '2',
    type: 'db',
    title: '사용자 가이드 - 검색 활용법',
    path: '/database/guides',
    preview: '검색 결과를 효과적으로 활용하기 위한 팁과 트릭을 소개합니다. 필터와 정렬 옵션을...',
    lastModified: '2024-01-10',
    author: '이영희',
    relevance: 0.95,
  },
  {
    id: '3',
    type: 'page',
    title: '검색 API 문서',
    path: '/api/docs/search',
    preview: '검색 엔드포인트의 요청/응답 형식을 정의합니다. 쿼리 파라미터와 필터 옵션을...',
    lastModified: '2024-01-08',
    author: '박민준',
    relevance: 0.92,
  },
  {
    id: '4',
    type: 'file',
    title: 'Search_Implementation.pdf',
    path: '/files/documents',
    preview: 'PDF 파일 - 검색 기능 구현 사양서입니다. 기술 스펙과 예상 일정이 포함되어...',
    lastModified: '2024-01-05',
    author: '최수진',
    relevance: 0.88,
  },
];

const mockRecentSearches = ['검색 기능', '사용자 가이드', 'API 문서'];
const mockRecentItems: RecentItem[] = [
  { id: '1', title: '검색 기능 개발 가이드', type: 'page', timestamp: '2024-01-15' },
  { id: '2', title: '사용자 가이드 - 검색 활용법', type: 'db', timestamp: '2024-01-14' },
];

export default function WorkersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'title'>('relevance');
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['page', 'db']));
  const [selectedFilters, setSelectedFilters] = useState({
    types: new Set<string>(['page', 'db', 'file']),
    authors: new Set<string>(),
    period: 'all',
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const typeLabels: Record<string, string> = {
    page: '페이지',
    db: 'DB 항목',
    file: '첨부파일',
  };

  const typeColors: Record<string, string> = {
    page: 'bg-blue-500/20 text-blue-400 dark:bg-blue-500/30',
    db: 'bg-purple-500/20 text-purple-400 dark:bg-purple-500/30',
    file: 'bg-orange-500/20 text-orange-400 dark:bg-orange-500/30',
  };

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <span key={i} className="bg-yellow-400/30 font-semibold dark:bg-yellow-500/40">{part}</span> : part
    );
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    clearTimeout(debounceTimerRef.current);

    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      setSelectedIndex(-1);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    debounceTimerRef.current = setTimeout(() => {
      const filtered = mockSearchResults
        .filter(result =>
          (result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.preview.toLowerCase().includes(query.toLowerCase())) &&
          selectedFilters.types.has(result.type)
        )
        .sort((a, b) => {
          if (sortBy === 'relevance') return b.relevance - a.relevance;
          if (sortBy === 'recent') return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
          return a.title.localeCompare(b.title);
        });

      setResults(filtered);
      setSelectedIndex(filtered.length > 0 ? 0 : -1);
      setIsSearching(false);
    }, 300);
  }, [selectedFilters.types, sortBy]);

  const groupedResults = useCallback(() => {
    const grouped: Record<string, SearchResult[]> = {};
    results.forEach(result => {
      if (!grouped[result.type]) grouped[result.type] = [];
      grouped[result.type].push(result);
    });
    return grouped;
  }, [results]);

  const toggleTypeFilter = (type: string) => {
    const newTypes = new Set(selectedFilters.types);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedFilters({ ...selectedFilters, types: newTypes });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      setSearchQuery('');
      setSelectedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
    } else if (e.key === 'Enter' && selectedIndex