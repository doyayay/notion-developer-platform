export default function Authentication() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">보안</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">인증</h1>
        <p className="text-lg text-gray-600">
          Notion은 내부 도구를 만들거나 공개 앱을 만드는지에 따라 두 가지 인증 방식을 지원합니다.
        </p>
      </div>

      <div className="space-y-14">
        {/* Internal */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">내부 통합</h2>
          <p className="text-gray-600 mb-4">
            단일 워크스페이스 내에서만 사용하는 도구 — 스크립트, 자동화, 내부 대시보드에 적합합니다. 정적 <strong>통합 시크릿(Integration Secret)</strong>으로 인증합니다.
          </p>
          <CodeBlock
            code={`const notion = new Client({
  auth: process.env.NOTION_TOKEN, // "secret_..."
});`}
          />
          <ul className="mt-4 text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>토큰은 <code className="bg-gray-100 px-1 rounded">secret_</code> 접두사로 시작합니다</li>
            <li>커밋하지 마세요 — 환경 변수나 시크릿 매니저를 사용하세요</li>
            <li>유출된 경우 통합 설정에서 토큰을 교체하세요</li>
          </ul>
        </section>

        {/* OAuth */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">OAuth 2.0 (공개 통합)</h2>
          <p className="text-gray-600 mb-4">
            모든 Notion 사용자가 자신의 워크스페이스에 접근 권한을 부여할 수 있는 앱(예: SaaS 제품)에 필요합니다. Notion은 표준 Authorization Code 플로우를 사용합니다.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">플로우 개요</h3>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 text-sm mb-6">
            <li><code className="bg-gray-100 px-1 rounded">client_id</code>와 <code className="bg-gray-100 px-1 rounded">redirect_uri</code>를 포함하여 사용자를 Notion 인가 URL로 리디렉션합니다.</li>
            <li>사용자가 승인하면 — Notion이 <code className="bg-gray-100 px-1 rounded">code</code> 쿼리 파라미터와 함께 리디렉션합니다.</li>
            <li>서버 측 POST 요청으로 코드를 액세스 토큰으로 교환합니다.</li>
            <li>토큰을 저장하고 Notion 클라이언트 초기화에 사용합니다.</li>
          </ol>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 1 — 인가 URL</h3>
          <CodeBlock
            code={`const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
authUrl.searchParams.set("client_id", process.env.NOTION_CLIENT_ID!);
authUrl.searchParams.set("redirect_uri", process.env.NOTION_REDIRECT_URI!);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("owner", "user");

// 사용자를 authUrl.toString()으로 리디렉션`}
          />

          <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">Step 2 — 코드를 토큰으로 교환</h3>
          <CodeBlock
            code={`const { code } = req.query; // 리디렉션에서 받은 값

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
          <h2 className="text-2xl font-bold text-gray-900 mb-3">토큰 타입 한눈에 보기</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">타입</th>
                  <th className="px-4 py-3">접두사</th>
                  <th className="px-4 py-3">사용 사례</th>
                  <th className="px-4 py-3">만료</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr>
                  <td className="px-4 py-3 font-medium">통합 시크릿</td>
                  <td className="px-4 py-3 font-mono text-xs">secret_</td>
                  <td className="px-4 py-3">내부 도구</td>
                  <td className="px-4 py-3">없음</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">OAuth 액세스 토큰</td>
                  <td className="px-4 py-3 font-mono text-xs">ntn_</td>
                  <td className="px-4 py-3">공개 통합</td>
                  <td className="px-4 py-3">없음 (취소 전까지)</td>
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
