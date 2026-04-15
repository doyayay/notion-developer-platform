export default function Authentication() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Security</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Authentication</h1>
        <p className="text-lg text-gray-600">
          Notion supports two authentication methods depending on whether you&apos;re building an internal tool or a public-facing app.
        </p>
      </div>

      <div className="space-y-14">
        {/* Internal */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Internal integrations</h2>
          <p className="text-gray-600 mb-4">
            Best for tools used only within a single workspace — scripts, automations, or internal dashboards. You authenticate using a static <strong>Integration Secret</strong>.
          </p>
          <CodeBlock
            code={`const notion = new Client({
  auth: process.env.NOTION_TOKEN, // "secret_..."
});`}
          />
          <ul className="mt-4 text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Tokens are prefixed <code className="bg-gray-100 px-1 rounded">secret_</code></li>
            <li>Never commit them — use environment variables or a secrets manager</li>
            <li>Rotate tokens in your integration settings if compromised</li>
          </ul>
        </section>

        {/* OAuth */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">OAuth 2.0 (public integrations)</h2>
          <p className="text-gray-600 mb-4">
            Required for apps where any Notion user can authorize access to their workspace — e.g. a SaaS product. Notion uses standard Authorization Code flow.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">Flow overview</h3>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 text-sm mb-6">
            <li>Redirect the user to Notion&apos;s authorization URL with your <code className="bg-gray-100 px-1 rounded">client_id</code> and <code className="bg-gray-100 px-1 rounded">redirect_uri</code>.</li>
            <li>User approves — Notion redirects back with a <code className="bg-gray-100 px-1 rounded">code</code> query param.</li>
            <li>Exchange the code for an access token via a server-side POST request.</li>
            <li>Store the token and use it to initialize the Notion client.</li>
          </ol>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 1 — Authorization URL</h3>
          <CodeBlock
            code={`const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
authUrl.searchParams.set("client_id", process.env.NOTION_CLIENT_ID!);
authUrl.searchParams.set("redirect_uri", process.env.NOTION_REDIRECT_URI!);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("owner", "user");

// Redirect the user to authUrl.toString()`}
          />

          <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">Step 2 — Exchange code for token</h3>
          <CodeBlock
            code={`const { code } = req.query; // from the redirect

const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
  method: "POST",
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(
        \`\${process.env.NOTION_CLIENT_ID}:\${process.env.NOTION_CLIENT_SECRET}\`
      ).toString("base64"),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.NOTION_REDIRECT_URI,
  }),
});

const { access_token } = await tokenResponse.json();`}
          />
        </section>

        {/* Token types */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Token types at a glance</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Prefix</th>
                  <th className="px-4 py-3">Use case</th>
                  <th className="px-4 py-3">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr>
                  <td className="px-4 py-3 font-medium">Integration Secret</td>
                  <td className="px-4 py-3 font-mono text-xs">secret_</td>
                  <td className="px-4 py-3">Internal tools</td>
                  <td className="px-4 py-3">Never</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">OAuth Access Token</td>
                  <td className="px-4 py-3 font-mono text-xs">ntn_</td>
                  <td className="px-4 py-3">Public integrations</td>
                  <td className="px-4 py-3">Never (unless revoked)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
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
