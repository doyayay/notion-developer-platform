'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'md';
  position?: 'inline' | 'overlay';
  onCopySuccess?: () => void;
  onCopyError?: () => void;
}

const CopyButton = ({
  text,
  size = 'md',
  position = 'inline',
  onCopySuccess,
  onCopyError,
}: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setIsCopied(true);
      onCopySuccess?.();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      onCopyError?.();
    }
  }, [text, onCopySuccess, onCopyError]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const sizeClasses = {
    sm: 'w-5 h-5 p-0.5',
    md: 'w-6 h-6 p-1',
  };

  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <button
      onClick={handleCopy}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-md transition-all duration-200 bg-gray-700 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-300 hover:text-white dark:text-gray-400 dark:hover:text-gray-200`}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {isCopied ? (
        <Check size={iconSize} className="text-green-400" />
      ) : (
        <Copy size={iconSize} />
      )}
    </button>
  );
};

interface CopyableFieldProps {
  label: string;
  value: string;
  type?: 'text' | 'url' | 'code' | 'token';
}

const CopyableField = ({ label, value, type = 'text' }: CopyableFieldProps) => {
  return (
    <div className="relative group">
      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 dark:bg-gray-700 border border-gray-700 dark:border-gray-600">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
            {label}
          </p>
          <p className="text-sm font-mono text-gray-100 dark:text-gray-300 truncate">
            {value}
          </p>
        </div>
        <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={value} size="md" />
        </div>
      </div>
    </div>
  );
};

interface CopyableTableCellProps {
  value: string;
}

const CopyableTableCell = ({ value }: CopyableTableCellProps) => {
  return (
    <div className="relative group flex items-center gap-2">
      <span className="text-sm text-gray-100 dark:text-gray-300">{value}</span>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={value} size="sm" />
      </div>
    </div>
  );
};

interface CopyableInlineCodeProps {
  code: string;
}

const CopyableInlineCode = ({ code }: CopyableInlineCodeProps) => {
  return (
    <span className="relative group inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800 dark:bg-gray-700 border border-gray-700 dark:border-gray-600">
      <code className="text-sm font-mono text-gray-100 dark:text-gray-300">
        {code}
      </code>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} size="sm" />
      </div>
    </span>
  );
};

export default function WorkersPage() {
  const [copyFeedback, setCopyFeedback] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleCopySuccess = useCallback(() => {
    setCopyFeedback({ message: '클립보드에 복사되었습니다', type: 'success' });
    setTimeout(() => setCopyFeedback(null), 3000);
  }, []);

  const handleCopyError = useCallback(() => {
    setCopyFeedback({ message: '복사에 실패했습니다', type: 'error' });
    setTimeout(() => setCopyFeedback(null), 3000);
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white dark:text-gray-100 mb-2">
            Workers
          </h1>
          <p className="text-gray-400 dark:text-gray-500">
            클립보드 복사 기능이 포함된 페이지
          </p>
        </div>

        {/* Toast Notification */}
        {copyFeedback && (
          <div
            className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white text-sm font-medium transition-all duration-300 ${
              copyFeedback.type === 'success'
                ? 'bg-green-600 dark:bg-green-700'
                : 'bg-red-600 dark:bg-red-700'
            }`}
          >
            {copyFeedback.message}
          </div>
        )}

        {/* API Endpoints Section */}
        <section className="mb-12">
          <div className="rounded-2xl bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-6">
              API Endpoints
            </h2>
            <div className="space-y-4">
              <div className="relative group">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900 dark:bg-gray-900 border border-gray-700 dark:border-gray-600">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                      List Pages
                    </p>
                    <p className="text-sm font-mono text-gray-100 dark:text-gray-300 truncate break-all">
                      https://api.notion.com/v1/pages
                    </p>
                  </div>
                  <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton
                      text="https://api.notion.com/v1/pages"
                      size="md"
                      onCopySuccess={handleCopySuccess}
                      onCopyError={handleCopyError}
                    />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900 dark:bg-gray-900 border border-gray-700 dark:border-gray-600">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                      Create Database
                    </p>
                    <p className="text-sm font-mono text-gray-100 dark:text-gray-300 truncate break-all">
                      https://api.notion.com/v1/databases
                    </p>
                  </div>
                  <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton
                      text="https://api.notion.com/v1/databases"
                      size="md"
                      onCopySuccess={handleCopySuccess}
                      onCopyError={handleCopyError}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Section */}
        <section className="mb-12">
          <div className="rounded-2xl bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-6">
              Authentication
            </h2>
            <div className="space-y-4">
              <CopyableField
                label="API Key"
                value="ntn_0123456789abcdef0123456789abcdef01"
                type="token"
              />
              <CopyableField
                label="Workspace ID"
                value="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                type="token"
              />
              <CopyableField
                label="Database ID"
                value="d1c2b3a4-5678-90ab-cdef-1234567890ab"
                type="token"
              />
            </div>
          </div>
        </section>

        {/* Code Examples Section */}
        <section className="mb-12">
          <div className="rounded-2xl bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-6">
              Code Examples
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-3">
                  Import 문:
                </p>
                <CopyableInlineCode code="import { CopyButton } from '@/components/CopyButton'" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300 dark:text-gray-400 mb-3">
                  함수 호출:
                </p>
                <CopyableInlineCode code="navigator.clipboard.writeText(text)" />
              </div>
            </div>
          </div>
        </section>

        {/* Table Example Section */}
        <section className="mb-12">
          <div className="rounded-2xl bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-6">
              Configuration
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-semibold text-gray-100 dark:text-gray-300">
                      Parameter
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-100 dark:text-gray-300">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700 dark:border-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4 text-gray-400 dark:text-gray-500">
                      API Version
                    </td>
                    <td className="py-3 px-4">
                      <CopyableTableCell value="2024-08-15" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700 dark:border-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4 text-gray-400 dark:text-gray-500">
                      Timeout (ms)
                    </td>
                    <td className="py-3 px-4">
                      <CopyableTableCell value="30000" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700 dark:border-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4 text-gray-400 dark:text-gray-500">
                      Rate Limit
                    </td>
                    <td className="py-3 px-4">
                      <CopyableTableCell value="3 requests/second" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Component Props Section */}
        <section>
          <div className="rounded-2xl bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-6">
              CopyButton Props
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-semibold text-gray-100 dark:text-gray-300">
                      Prop
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-100 dark:text-gray-300">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-100 dark:text-gray-300">