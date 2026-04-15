export default function Quickstart() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Getting Started</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Quickstart</h1>
        <p className="text-lg text-gray-600">
          Create your first Notion integration and make your first API call in under 10 minutes.
        </p>
      </div>

      <div className="space-y-12">
        <Step number={1} title="Create an integration">
          <p className="text-gray-600 mb-4">
            Go to <a href="https://www.notion.so/my-integrations" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">notion.so/my-integrations</a> and click <strong>New integration</strong>. Give it a name and select the workspace you want to build for.
          </p>
          <p className="text-gray-600">
            After creation you&apos;ll receive an <strong>Internal Integration Secret</strong> — treat it like a password.
          </p>
        </Step>

        <Step number={2} title="Share a page with your integration">
          <p className="text-gray-600">
            Open any Notion page or database. Click the <strong>···</strong> menu → <strong>Connect to</strong> → select your integration. Without this step, the API will return 404 for that resource.
          </p>
        </Step>

        <Step number={3} title="Install the SDK">
          <CodeBlock code={`npm install @notionhq/client`} />
        </Step>

        <Step number={4} title="Make your first API call">
          <p className="text-gray-600 mb-4">
            Use your integration secret to initialize the client, then query a database or fetch a page:
          </p>
          <CodeBlock
            code={`import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// List databases shared with your integration
const response = await notion.search({
  filter: { property: "object", value: "database" },
});

console.log(response.results);`}
          />
        </Step>

        <Step number={5} title="Run it">
          <CodeBlock code={`NOTION_TOKEN=secret_xxx npx tsx index.ts`} />
          <p className="text-gray-600 mt-4">
            You should see a JSON array of database objects returned from your workspace.
          </p>
        </Step>
      </div>

      <div className="mt-16 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Next steps</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
          <li>Read about <a href="/authentication" className="text-blue-600 underline">Authentication</a> for user-facing OAuth apps</li>
          <li>Explore the <a href="/docs" className="text-blue-600 underline">Core Concepts</a> — pages, databases, and blocks</li>
          <li>Browse the full <a href="/api-reference" className="text-blue-600 underline">API Reference</a></li>
        </ul>
      </div>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
        {number}
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-gray-950 text-gray-100 rounded-xl p-5 text-sm overflow-x-auto leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}
