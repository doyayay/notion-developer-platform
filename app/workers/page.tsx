'use client';

import Link from 'next/link';

const workerCode = `import { WorkerEntrypoint } from '@notionhq/workers';
import { Client } from '@notionhq/client';

interface Env {
  NOTION_API_KEY: string;
  NOTION_DATABASE_ID: string;
}

interface GitHubWebhookPayload {
  action: string;
  pull_request?: {
    title: string;
    merged: boolean;
    body: string;
  };
}

export default class PRDUpdaterWorker extends WorkerEntrypoint<Env> {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const payload = await request.json<GitHubWebhookPayload>();

    // Only handle merged pull requests
    if (
      payload.action !== 'closed' ||
      !payload.pull_request?.merged
    ) {
      return new Response('OK', { status: 200 });
    }

    const notion = new Client({ auth: this.env.NOTION_API_KEY });
    const prTitle = payload.pull_request.title;

    // Search for matching PRD page in Notion
    const results = await notion.databases.query({
      database_id: this.env.NOTION_DATABASE_ID,
      filter: {
        property: 'Title',
        title: { contains: prTitle },
      },
    });

    if (results.results.length === 0) {
      return new Response('No matching PRD found', { status: 200 });
    }

    const pageId = results.results[0].id;

    // Update PRD status to Implemented
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Status: {
          select: { name: 'Implemented' },
        },
        'Last Updated': {
          date: { start: new Date().toISOString() },
        },
      },
    });

    return new Response(
      JSON.stringify({ success: true, updatedPageId: pageId }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}`;

const workflowSteps = [
  {
    id: 1,
    emoji: '🧑',
    label: 'Human',
    title: 'PRD 작성',
    description: 'Developer writes PRD in Notion with initial status Draft',
    type: 'human',
    badge: 'Manual',
  },
  {
    id: 2,
    emoji: '🧑',
    label: 'Human',
    title: 'Code Implementation',
    description: 'Developer implements the feature and opens a Pull Request on GitHub',
    type: 'human',
    badge: 'Manual',
  },
  {
    id: 3,
    emoji: '🧑',
    label: 'Human',
    title: 'PR Merge',
    description: 'Reviewer approves and merges the Pull Request into main branch',
    type: 'human',
    badge: 'Manual',
  },
  {
    id: 4,
    emoji: '⚡',
    label: 'Worker',
    title: 'PRD Auto Update',
    description: 'GitHub Webhook triggers a Worker that sets PRD status to Implemented',
    type: 'auto',
    badge: 'Automated',
  },
  {
    id: 5,
    emoji: '🤖',
    label: 'AI Worker',
    title: 'Test Case Generation',
    description: 'AI-powered Worker reads the PRD and auto-generates test cases in Notion',
    type: 'auto',
    badge: 'AI Automated',
  },
];

const capabilities = [
  {
    icon: '🛠️',
    title: 'Agent Tool',
    description: 'Expose your Worker as a tool callable by AI agents, enabling autonomous workflows.',
  },
  {
    icon: '🔐',
    title: 'OAuth Integration',
    description: 'Built-in OAuth support lets Workers authenticate on behalf of users securely.',
  },
  {
    icon: '🔗',
    title: 'Webhook Handlers',
    description: 'React to external events from GitHub, Slack, or any HTTP source in real time.',
  },
  {
    icon: '🗄️',
    title: 'Durable Storage',
    description: 'Persist state across invocations with built-in KV and object storage.',
  },
  {
    icon: '⏱️',
    title: 'Scheduled Triggers',
    description: 'Run Workers on a cron schedule for recurring automation tasks.',
  },
  {
    icon: '🌐',
    title: 'Global Edge Runtime',
    description: 'Deploy Workers to the edge, ensuring low-latency execution worldwide.',
  },
];

export default function WorkersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-1.5 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          New Platform Feature
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Notion Workers
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
          Workers are lightweight, serverless functions that extend the Notion Developer Platform.
          Build automations, integrate with third-party services, and power AI-driven workflows —
          all without managing infrastructure.
        </p>
      </div>

      {/* Section 1 — What are Workers */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">What are Workers?</h2>
          <p className="text-gray-400 leading-relaxed">
            Workers are event-driven TypeScript functions that run on the Notion platform edge
            runtime. They respond to HTTP requests, webhooks, scheduled triggers, or AI agent
            tool calls — making it trivial to automate complex workflows that span Notion,
            GitHub, Slack, and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 hover:border-gray-700 transition-colors"
            >
              <div className="text-2xl">{cap.icon}</div>
              <div>
                <h3 className="text-white font-medium text-sm">{cap.title}</h3>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{cap.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 — Workflow Diagram */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Workflow Diagram</h2>
          <p className="text-gray-400 leading-relaxed">
            This page itself is a meta-demo: the workflow below is what powers this very
            documentation. Human steps are marked <span className="text-blue-400 font-medium">Manual</span>,
            while automated steps are handled by Workers.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    step.type === 'auto'
                      ? 'bg-green-950 border border-green-800'
                      : 'bg-blue-950 border border-blue-800'
                  }`}
                >
                  {step.emoji}
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="w-px h-6 bg-gray-800 mt-2" />
                )}
              </div>

              <div
                className={`flex-1 rounded-xl p-4 border mb-1 ${
                  step.type === 'auto'
                    ? 'bg-green-950/30 border-green-900/50'
                    : 'bg-gray-800/50 border-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Step {step.id}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          step.badge === 'AI Automated'
                            ? 'bg-purple-900/50 text-purple-400 border border-purple-800/50'
                            : step.badge === 'Automated'
                            ? 'bg-green-900/50 text-green-400 border border-green-800/50'
                            : 'bg-blue-900/50 text-blue-400 border border-blue-800/50'
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm">{step.title}</h3>
                    <p className="text-gray-400 text-sm mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <span className="text-gray-500 text-xs hidden sm:block">{step.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 — Code Example */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Code Example</h2>
          <p className="text-gray-400 leading-relaxed">
            The Worker below listens for GitHub&apos;s <code className="text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded text-sm">pull_request</code> webhook.
            When a PR is merged, it queries your Notion database and automatically updates the
            matching PRD status to <span className="text-green-400 font-medium">Implemented</span>.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-gray-500 text-xs font-mono">prd-updater.worker.ts</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600 bg-gray-800 border border-gray-700 rounded px-2 py-0.5 font-mono">
                @notionhq/workers
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <pre className="text-sm text-gray-300 p-5 leading-relaxed font-mono whitespace-pre">
              <code>{workerCode}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Section 4 — Getting Started */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Getting Started</h2>
          <p className="text-gray-400 leading-relaxed">
            Install the Notion Workers CLI (<code className="text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded text-sm">ntn</code>) and
            deploy your first Worker in minutes.
          </p>
        </div>

        <div className="space-y-4">
          {/* Install CLI */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800">
              <span className="text-gray-500 text-xs font-mono">Terminal</span>
            </div>
            <div className="p-5 space-y-3 font-mono text-sm">
              <div className="flex items-start gap-3">
                <span className="text-green-500 select-none">$</span>
                <span className="text-gray-300">npm install -g @notionhq/ntn</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 select-none">$</span>
                <span className="text-gray-300">ntn init my-worker</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 select-none">$</span>
                <span className="text-gray-300">ntn deploy</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://developers.notion.com/docs/workers"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4 hover:border-gray-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-gray-700 flex items-center justify-center text-xl flex-shrink-0 group-hover:border-gray-500 transition-colors">
                📖
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Official Documentation</h3>
                <p className="text-gray-500 text-sm mt-0.5">
                  Full API reference, guides, and examples for Workers.
                </p>
                <span className="text-gray-600 text-xs mt-2 block group-hover:text-gray-400 transition-colors">
                  developers.notion.com →
                </span>
              </div>
            </a>

            <a
              href="https://developers.notion.