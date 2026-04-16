'use client';

import { useState, useRef } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyableItem {
  id: string;
  label: string;
  value: string;
  category: 'endpoint' | 'code' | 'token' | 'link';
}

const SAMPLE_ITEMS: CopyableItem[] = [
  {
    id: '1',
    label: 'Notion API Endpoint',
    value: 'https://api.notion.com/v1/pages',
    category: 'endpoint',
  },
  {
    id: '2',
    label: 'Python Code Snippet',
    value: 'import requests\nresponse = requests.get("https://api.example.com")',
    category: 'code',
  },
  {
    id: '3',
    label: 'API Token',
    value: 'YOUR_API_KEY_placeholder_12345',
    category: 'token',
  },
  {
    id: '4',
    label: 'Share Link',
    value: 'https://share.example.com/project/abc123',
    category: 'link',
  },
];

const TABLE_DATA = [
  { id: 1, endpoint: 'GET /users', status: '200', latency: '45ms' },
  { id: 2, endpoint: 'POST /posts', status: '201', latency: '120ms' },
  { id: 3, endpoint: 'DELETE /items/{id}', status: '204', latency: '30ms' },
];

function CopyableContent({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div ref={containerRef} className="relative group">
      <code className="bg-gray-800 dark:bg-gray-900 text-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
        {value}
      </code>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-200 dark:text-gray-300"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

function CopyableTableCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative group">
      <span className="text-gray-100 dark:text-gray-200">{value}</span>
      <button
        onClick={handleCopy}
        className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-200 dark:text-gray-300"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}

export default function WorkersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Copy 기능 가이드
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            페이지 내 콘텐츠를 클릭 한 번으로 클립보드에 복사하세요. 항목 위에 마우스를
            올려 Copy 아이콘을 확인할 수 있습니다.
          </p>
        </div>

        {/* API Endpoints Section */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              API 엔드포인트
            </h2>
            <div className="space-y-4">
              {SAMPLE_ITEMS.filter((item) => item.category === 'endpoint').map(
                (item) => (
                  <div key={item.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {item.label}
                    </label>
                    <CopyableContent value={item.value} />
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Code Snippets Section */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              코드 스니펫
            </h2>
            <div className="space-y-4">
              {SAMPLE_ITEMS.filter((item) => item.category === 'code').map(
                (item) => (
                  <div key={item.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {item.label}
                    </label>
                    <CopyableContent value={item.value} />
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Sensitive Information Section */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              민감 정보
            </h2>
            <div className="space-y-4">
              {SAMPLE_ITEMS.filter((item) =>
                ['token', 'link'].includes(item.category)
              ).map((item) => (
                <div key={item.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {item.label}
                  </label>
                  <CopyableContent value={item.value} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Table Data Section */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              테이블 데이터
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Endpoint
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Latency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TABLE_DATA.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <CopyableTableCell value={row.endpoint} />
                      </td>
                      <td className="py-3 px-4">
                        <CopyableTableCell value={row.status} />
                      </td>
                      <td className="py-3 px-4">
                        <CopyableTableCell value={row.latency} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Instructions Section */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              사용 방법
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-1">1.</span>
                <span>복사하고 싶은 콘텐츠 위에 마우스를 올립니다.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-1">2.</span>
                <span>우측에 나타나는 Copy 아이콘(📋)을 클릭합니다.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-1">3.</span>
                <span>
                  아이콘이 체크 표시(✅)로 변경되면 복사가 완료된 것입니다.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-1">4.</span>
                <span>2초 후 자동으로 원래 상태로 돌아갑니다.</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}