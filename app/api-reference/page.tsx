const endpoints = [
  {
    group: "Pages",
    items: [
      { method: "GET", path: "/v1/pages/{page_id}", desc: "Retrieve a page" },
      { method: "POST", path: "/v1/pages", desc: "Create a page" },
      { method: "PATCH", path: "/v1/pages/{page_id}", desc: "Update page properties" },
    ],
  },
  {
    group: "Databases",
    items: [
      { method: "GET", path: "/v1/databases/{database_id}", desc: "Retrieve a database" },
      { method: "POST", path: "/v1/databases", desc: "Create a database" },
      { method: "PATCH", path: "/v1/databases/{database_id}", desc: "Update a database" },
      { method: "POST", path: "/v1/databases/{database_id}/query", desc: "Query a database" },
    ],
  },
  {
    group: "Blocks",
    items: [
      { method: "GET", path: "/v1/blocks/{block_id}", desc: "Retrieve a block" },
      { method: "GET", path: "/v1/blocks/{block_id}/children", desc: "Retrieve block children" },
      { method: "PATCH", path: "/v1/blocks/{block_id}", desc: "Update a block" },
      { method: "PATCH", path: "/v1/blocks/{block_id}/children", desc: "Append block children" },
      { method: "DELETE", path: "/v1/blocks/{block_id}", desc: "Delete a block" },
    ],
  },
  {
    group: "Users",
    items: [
      { method: "GET", path: "/v1/users", desc: "List all users" },
      { method: "GET", path: "/v1/users/{user_id}", desc: "Retrieve a user" },
      { method: "GET", path: "/v1/users/me", desc: "Retrieve your token's bot user" },
    ],
  },
  {
    group: "Comments",
    items: [
      { method: "GET", path: "/v1/comments", desc: "Retrieve comments" },
      { method: "POST", path: "/v1/comments", desc: "Create a comment" },
    ],
  },
  {
    group: "Search",
    items: [{ method: "POST", path: "/v1/search", desc: "Search by title" }],
  },
  {
    group: "Authentication",
    items: [
      { method: "POST", path: "/v1/oauth/token", desc: "Create a token (OAuth)" },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
  PATCH: "bg-yellow-100 text-yellow-700",
  DELETE: "bg-red-100 text-red-700",
};

export default function ApiReference() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Reference</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">API Reference</h1>
        <p className="text-lg text-gray-600">
          All requests use the base URL <code className="bg-gray-100 px-2 py-0.5 rounded text-base font-mono">https://api.notion.com</code> and require a <code className="bg-gray-100 px-2 py-0.5 rounded text-base font-mono">Bearer</code> token in the <code className="bg-gray-100 px-2 py-0.5 rounded text-base font-mono">Authorization</code> header.
        </p>
      </div>

      {/* Auth header example */}
      <div className="mb-12 bg-gray-950 text-gray-100 rounded-xl p-5 text-sm leading-relaxed overflow-x-auto">
        <code>{`Authorization: Bearer secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Notion-Version: 2022-06-28
Content-Type: application/json`}</code>
      </div>

      {/* Endpoints */}
      <div className="space-y-10">
        {endpoints.map((group) => (
          <div key={group.group}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{group.group}</h2>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.path + item.method}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md font-mono w-16 text-center flex-shrink-0 ${methodColors[item.method] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {item.method}
                  </span>
                  <code className="text-sm text-gray-800 font-mono flex-1">{item.path}</code>
                  <span className="text-sm text-gray-500 hidden sm:block">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rate limits */}
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Rate Limits</h3>
          <p className="text-sm text-gray-600">
            The API is rate limited to <strong>3 requests per second</strong> per integration. Exceeding this returns <code className="bg-gray-100 px-1 rounded">429 Too Many Requests</code>. Use exponential backoff to retry.
          </p>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Versioning</h3>
          <p className="text-sm text-gray-600">
            Always send the <code className="bg-gray-100 px-1 rounded">Notion-Version</code> header. The current stable version is <code className="bg-gray-100 px-1 rounded">2022-06-28</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
