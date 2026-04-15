import Link from "next/link";

const concepts = [
  {
    icon: "📄",
    title: "Pages",
    description:
      "Pages are the core unit of content in Notion. They can contain any combination of blocks and can be nested inside other pages or databases.",
    details: [
      "Fetch a page with GET /v1/pages/{page_id}",
      "Create a page with POST /v1/pages",
      "Update page properties with PATCH /v1/pages/{page_id}",
      "Archive (soft-delete) a page by setting archived: true",
    ],
  },
  {
    icon: "🗄️",
    title: "Databases",
    description:
      "Databases are structured collections of pages. Each row is a page, and each column is a property with a defined type (text, number, select, date, relation, etc.).",
    details: [
      "Query a database with POST /v1/databases/{database_id}/query",
      "Filter and sort results inline in the query body",
      "Create or update database schema via PATCH /v1/databases/{database_id}",
      "Database pages inherit the parent database's property schema",
    ],
  },
  {
    icon: "🧱",
    title: "Blocks",
    description:
      "Everything inside a page is a block — paragraphs, headings, images, code, to-do items, callouts, and more. Blocks can be nested to create rich layouts.",
    details: [
      "List children with GET /v1/blocks/{block_id}/children",
      "Append blocks with PATCH /v1/blocks/{block_id}/children",
      "Update a block's content with PATCH /v1/blocks/{block_id}",
      "Delete a block with DELETE /v1/blocks/{block_id}",
    ],
  },
  {
    icon: "👥",
    title: "Users",
    description:
      "The Users API lets you retrieve information about workspace members and bots. You can list all users or fetch a specific user by ID.",
    details: [
      "List all users with GET /v1/users",
      "Get a specific user with GET /v1/users/{user_id}",
      "Get the bot user for your integration with GET /v1/users/me",
      "Users can be of type 'person' or 'bot'",
    ],
  },
  {
    icon: "💬",
    title: "Comments",
    description:
      "Comments can be added to pages and inline on blocks. The Comments API lets you read and create comments programmatically.",
    details: [
      "Retrieve comments with GET /v1/comments",
      "Create a comment with POST /v1/comments",
      "Supports rich text formatting in comment bodies",
      "Requires comment read/write capabilities enabled in integration settings",
    ],
  },
  {
    icon: "🔍",
    title: "Search",
    description:
      "The Search API searches all pages and databases shared with your integration. It supports filtering by object type and keyword queries.",
    details: [
      "POST /v1/search with a query string",
      "Filter results to only pages or only databases",
      "Results are sorted by last edited time by default",
      "Only returns objects shared with your integration",
    ],
  },
];

export default function Docs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Documentation</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Core Concepts</h1>
        <p className="text-lg text-gray-600">
          Understand the fundamental building blocks of the Notion API — from pages and databases to blocks and users.
        </p>
      </div>

      <div className="space-y-10">
        {concepts.map((c) => (
          <div key={c.title} className="border border-gray-200 rounded-2xl p-7 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{c.icon}</span>
              <h2 className="text-2xl font-bold text-gray-900">{c.title}</h2>
            </div>
            <p className="text-gray-600 mb-5">{c.description}</p>
            <ul className="space-y-2">
              {c.details.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 mt-0.5">›</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Ready to explore the API?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Check the full endpoint reference for request/response shapes, error codes, and rate limits.
        </p>
        <Link
          href="/api-reference"
          className="inline-block bg-black text-white text-sm px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
        >
          Go to API Reference →
        </Link>
      </div>
    </div>
  );
}
