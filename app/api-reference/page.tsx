const endpoints = [
  {
    group: "페이지(Pages)",
    items: [
      { method: "GET", path: "/v1/pages/{page_id}", desc: "페이지 조회" },
      { method: "POST", path: "/v1/pages", desc: "페이지 생성" },
      { method: "PATCH", path: "/v1/pages/{page_id}", desc: "페이지 속성 업데이트" },
    ],
  },
  {
    group: "데이터베이스(Databases)",
    items: [
      { method: "GET", path: "/v1/databases/{database_id}", desc: "데이터베이스 조회" },
      { method: "POST", path: "/v1/databases", desc: "데이터베이스 생성" },
      { method: "PATCH", path: "/v1/databases/{database_id}", desc: "데이터베이스 업데이트" },
      { method: "POST", path: "/v1/databases/{database_id}/query", desc: "데이터베이스 쿼리" },
    ],
  },
  {
    group: "블록(Blocks)",
    items: [
      { method: "GET", path: "/v1/blocks/{block_id}", desc: "블록 조회" },
      { method: "GET", path: "/v1/blocks/{block_id}/children", desc: "자식 블록 조회" },
      { method: "PATCH", path: "/v1/blocks/{block_id}", desc: "블록 업데이트" },
      { method: "PATCH", path: "/v1/blocks/{block_id}/children", desc: "자식 블록 추가" },
      { method: "DELETE", path: "/v1/blocks/{block_id}", desc: "블록 삭제" },
    ],
  },
  {
    group: "사용자(Users)",
    items: [
      { method: "GET", path: "/v1/users", desc: "모든 사용자 목록" },
      { method: "GET", path: "/v1/users/{user_id}", desc: "사용자 조회" },
      { method: "GET", path: "/v1/users/me", desc: "봇 사용자 조회" },
    ],
  },
  {
    group: "댓글(Comments)",
    items: [
      { method: "GET", path: "/v1/comments", desc: "댓글 조회" },
      { method: "POST", path: "/v1/comments", desc: "댓글 생성" },
    ],
  },
  {
    group: "검색(Search)",
    items: [{ method: "POST", path: "/v1/search", desc: "제목으로 검색" }],
  },
  {
    group: "인증(Authentication)",
    items: [
      { method: "POST", path: "/v1/oauth/token", desc: "토큰 생성 (OAuth)" },
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
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">레퍼런스</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">API 레퍼런스</h1>
        <p className="text-lg text-gray-600">
          모든 요청은 기본 URL <code className="bg-gray-100 px-2 py-0.5 rounded text-base font-mono">https://api.notion.com</code>을 사용하며 <code className="bg-gray-100 px-2 py-0.5 rounded text-base font-mono">Authorization</code> 헤더에 <code className="bg-gray-100 px-2 py-0.5 rounded text-base font-mono">Bearer</code> 토큰이 필요합니다.
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
          <h3 className="font-semibold text-gray-900 mb-2">속도 제한(Rate Limits)</h3>
          <p className="text-sm text-gray-600">
            API는 통합당 <strong>초당 3개의 요청</strong>으로 제한됩니다. 초과 시 <code className="bg-gray-100 px-1 rounded">429 Too Many Requests</code>가 반환됩니다. 지수 백오프(exponential backoff)로 재시도하세요.
          </p>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">버전 관리(Versioning)</h3>
          <p className="text-sm text-gray-600">
            항상 <code className="bg-gray-100 px-1 rounded">Notion-Version</code> 헤더를 보내세요. 현재 안정 버전은 <code className="bg-gray-100 px-1 rounded">2022-06-28</code>입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
