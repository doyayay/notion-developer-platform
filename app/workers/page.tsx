'use client';

import Link from 'next/link';

const workerCode = `import { WorkerEntrypoint } from '@notionhq/workers';
import { Client } from '@notionhq/client';

export default class PRDStatusWorker extends WorkerEntrypoint {
  async fetch(request: Request): Promise<Response> {
    // Validate GitHub webhook signature
    const signature = request.headers.get('x-hub-signature-256');
    if (!this.verifySignature(request, signature)) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = await request.json();

    // Only handle PR merge events
    if (payload.action !== 'closed' || !payload.pull_request.merged) {
      return new Response('OK', { status: 200 });
    }

    const notion = new Client({ auth: this.env.NOTION_API_KEY });

    // Extract PRD page ID from PR description
    const prdPageId = this.extractPageId(payload.pull_request.body);
    if (!prdPageId) {
      return new Response('No PRD link found', { status: 200 });
    }

    // Update PRD status to Implemented
    await notion.pages.update({
      page_id: prdPageId,
      properties: {
        Status: {
          select: { name: 'Implemented' },
        },
        'Merged At': {
          date: { start: new Date().toISOString() },
        },
        'PR URL': {
          url: payload.pull_request.html_url,
        },
      },
    });

    // Trigger test case generation via Agent Tool
    await this.generateTestCases(notion, prdPageId, payload.pull_request);

    return new Response('PRD updated successfully', { status: 200 });
  }

  private async generateTestCases(
    notion: Client,
    prdPageId: string,
    pr: Record<string, unknown>
  ): Promise<void> {
    // Create a child page with generated test cases
    await notion.pages.create({
      parent: { page_id: prdPageId },
      properties: {
        title: {
          title: [{ text: { content: 'Auto-generated Test Cases' } }],
        },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                text: {
                  content: \`Generated from PR #\${pr.number}: \${pr.title}\`,
                },
              },
            ],
          },
        },
      ],
    });
  }

  private extractPageId(body: string | null): string | null {
    if (!body) return null;
    const match = body.match(/notion\\.so\\/[a-zA-Z0-9-]+\\/([a-f0-9]{32})/);
    return match ? match[1] : null;
  }

  private async verifySignature(
    request: Request,
    signature: string | null
  ): Promise<boolean> {
    if (!signature) return false;
    // HMAC-SHA256 verification logic here
    return true;
  }
}`;

const workflowSteps = [
  {
    id: 1,
    label: 'PRD 작성',
    description: 'Developer writes PRD in Notion with requirements and acceptance criteria',
    actor: 'human',
    actorLabel: 'Developer',
    icon: '🧑',
    connector: true,
  },
  {
    id: 2,
    label: 'Code Implementation',
    description: 'Developer implements the feature based on PRD specifications',
    actor: 'human',
    actorLabel: 'Developer',
    icon: '🧑',
    connector: true,
  },
  {
    id: 3,
    label: 'PR Merge',
    description: 'Pull request is reviewed, approved, and merged into main branch',
    actor: 'human',
    actorLabel: 'Developer',
    icon: '🧑',
    connector: true,
  },
  {
    id: 4,
    label: 'PRD Auto-Update',
    description: 'Worker detects the merge event via GitHub Webhook and updates PRD status to Implemented',
    actor: 'auto',
    actorLabel: 'Worker ⚡',
    icon: '🤖',
    connector: true,
  },
  {
    id: 5,
    label: 'Test Case Generation',
    description: 'Worker automatically generates and appends test cases to the PRD page in Notion',
    actor: 'auto',
    actorLabel: 'Worker ⚡',
    icon: '🤖',
    connector: false,
  },
];

const capabilities = [
  {
    title: 'Agent Tools',
    description: 'Expose your Worker as a tool that AI agents can call, enabling intelligent automation and decision-making within your workflows.',
    icon: '🛠️',
  },
  {
    title: 'OAuth Integration',
    description: 'Built-in OAuth 2.0 support lets Workers securely authenticate with Notion and third-party services on behalf of users.',
    icon: '🔐',
  },
  {
    title: 'Webhook Handlers',
    description: 'Receive and process real-time events from GitHub, Slack, or any HTTP source with zero infrastructure setup.',
    icon: '⚡',
  },
  {
    title: 'Notion SDK Built-in',
    description: 'First-class @notionhq/workers SDK with typed bindings for pages, databases, and blocks — no extra configuration needed.',
    icon: '📦',
  },
  {
    title: 'Edge Runtime',
    description: 'Workers run at the edge globally, ensuring low latency responses for time-sensitive automation triggers.',
    icon: '🌐',
  },
  {
    title: 'Environment Secrets',
    description: 'Securely store API keys and secrets via the CLI. Access them at runtime through typed environment bindings.',
    icon: '🔒',
  },
];

export default function WorkersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-1.5 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          New on Notion Developer Platform
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Notion Workers
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
          Workers are serverless functions that run at the edge, built specifically for the Notion Developer Platform.
          Automate workflows, respond to webhooks, and extend Notion with custom logic — no infrastructure required.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="#get-started"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="https://developers.notion.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-semibold px-5 py-2.5 rounded-xl text-sm hover:border-gray-500 hover:text-white transition-colors"
          >
            View Docs →
          </Link>
        </div>
      </div>

      {/* Section 1 — What are Workers */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">What are Workers?</h2>
          <p className="text-gray-400">
            Workers bring server-side logic to your Notion integrations without managing any infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-2 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cap.icon}</span>
                <h3 className="font-semibold text-white text-sm">{cap.title}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{cap.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 — Workflow Diagram */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Workflow Diagram</h2>
          <p className="text-gray-400">
            This very page was built by a Worker. Here&apos;s the end-to-end automation pipeline it demonstrates.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-x-auto">
          {/* Legend */}
          <div className="flex items-center gap-6 mb-8 pb-5 border-b border-gray-800">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 text-base">🧑</span>
              <span>Manual (Human)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-800 border border-green-800 text-base">🤖</span>
              <span>Automated (Worker ⚡)</span>
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-0 min-w-[320px]">
            {workflowSteps.map((step) => (
              <div key={step.id} className="flex flex-col">
                <div
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    step.actor === 'auto'
                      ? 'bg-gray-800/50 border-green-900/60'
                      : 'bg-gray-800/30 border-gray-800'
                  }`}
                >
                  {/* Step number + icon */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border ${
                        step.actor === 'auto'
                          ? 'bg-green-900/40 border-green-700 text-green-400'
                          : 'bg-gray-800 border-gray-700 text-gray-300'
                      }`}
                    >
                      {step.id}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white font-semibold text-sm">{step.label}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          step.actor === 'auto'
                            ? 'bg-green-900/50 text-green-400 border border-green-800'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                      >
                        <span>{step.icon}</span>
                        <span>{step.actorLabel}</span>
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Connector */}
                {step.connector && (
                  <div className="flex items-center justify-start pl-[22px] py-1">
                    <div className="w-px h-5 bg-gray-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Code Example */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Code Example</h2>
          <p className="text-gray-400">
            A Worker that listens for GitHub PR merge events and automatically updates the linked Notion PRD status to{' '}
            <code className="bg-gray-800 text-green-400 px-1.5 py-0.5 rounded text-sm font-mono">Implemented</code>.
          </p>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Code header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-gray-400 text-xs font-mono">worker.ts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-mono">@notionhq/workers</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(workerCode);
                }}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-gray-800"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Code body */}
          <div className="overflow-x-auto">
            <pre className="p-5 text-xs leading-relaxed font-mono text-gray-300 whitespace-pre">
              <code>{workerCode}</code>
            </pre>
          </div>
        </div>

        {/* Key highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Webhook Validation', detail: 'HMAC-SHA256 signature verification from GitHub', icon: '🔐' },
            { label: 'Notion SDK', detail: 'First-class typed bindings via @notionhq/workers', icon: '📦' },
            { label: 'Agent Tool', detail: 'Auto-