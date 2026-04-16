'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const workers = [
  {
    title: 'Background Job Processing',
    description:
      'Run long-running tasks asynchronously without blocking your main application thread. Perfect for data processing, report generation, and bulk operations.',
    badge: 'Core',
    badgeColor: 'bg-blue-500/20 text-blue-400 dark:bg-blue-500/10 dark:text-blue-300',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    title: 'Scheduled Tasks',
    description:
      'Define cron-like schedules to trigger workers at specific intervals. Automate recurring workflows such as syncing data, sending digests, or cleanup routines.',
    badge: 'Scheduling',
    badgeColor: 'bg-purple-500/20 text-purple-400 dark:bg-purple-500/10 dark:text-purple-300',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Event-Driven Workers',
    description:
      'React to Notion events in real time. Trigger workers when pages are created, databases are updated, or comments are added — no polling required.',
    badge: 'Events',
    badgeColor: 'bg-green-500/20 text-green-400 dark:bg-green-500/10 dark:text-green-300',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Queue Management',
    description:
      'Manage work queues with priority levels, retry logic, and dead-letter handling. Gain visibility into job status, execution history, and failure diagnostics.',
    badge: 'Infrastructure',
    badgeColor: 'bg-orange-500/20 text-orange-400 dark:bg-orange-500/10 dark:text-orange-300',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
];

const codeExample = `import { NotionWorker } from '@notionhq/workers';

const worker = new NotionWorker({
  auth: process.env.NOTION_TOKEN,
});

// Register a background job
worker.define('sync-database', async (job) => {
  const { databaseId } = job.data;

  const pages = await notion.databases.query({
    database_id: databaseId,
  });

  for (const page of pages.results) {
    await processPage(page);
  }

  return { processed: pages.results.length };
});

// Schedule a recurring task
worker.schedule('daily-digest', '0 9 * * *', async () => {
  await sendDailyDigest();
});

worker.start();`;

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function WorkersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity">
              Notion Developer
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {['Quickstart', 'Docs', 'Authentication', 'API Reference', 'Workers'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(' ', '-')}`}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    item === 'Workers'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Beta
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 text-gray-900 dark:text-gray-100">
            Notion Workers
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed mb-8">
            A powerful runtime for executing background jobs, scheduled tasks, and event-driven
            workflows — natively integrated with the Notion API.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/quickstart"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-700 dark:hover:bg-white transition-colors"
            >
              Get started
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              View docs
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {workers.map((worker) => (
            <div
              key={worker.title}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {worker.icon}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${worker.badgeColor}`}>
                  {worker.badge}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{worker.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{worker.description}</p>
            </div>
          ))}
        </div>

        {/* Code example */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick example</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">worker.ts</span>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700" />
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 font-mono">worker.ts</span>
            </div>
            <pre className="bg-gray-950 p-6 overflow-x-auto text-sm leading-relaxed">
              <code className="text-gray-300 font-mono whitespace-pre">{codeExample}</code>
            </pre>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8 mb-16">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Built for scale</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '10M+', label: 'Jobs per day' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<50ms', label: 'Queue latency' },
              { value: '∞', label: 'Retry strategies' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-8">Get started in minutes</h2>
          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Install the SDK',
                description: 'Add the Notion Workers SDK to your project.',
                code: 'npm install @notionhq/workers',
              },
              {
                step: '02',
                title: 'Configure your worker',
                description: 'Initialize with your integration token and define your jobs.',
                code: "const worker = new NotionWorker({ auth: process.env.NOTION_TOKEN });",
              },
              {
                step: '03',
                title: 'Deploy',
                description: 'Deploy to any Node.js environment or serverless platform.',
                code: 'notion-workers deploy --env production',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-5 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray