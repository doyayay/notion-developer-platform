import Link from "next/link";

const concepts = [
  {
    icon: "📄",
    title: "페이지(Pages)",
    description:
      "페이지는 Notion 콘텐츠의 핵심 단위입니다. 모든 조합의 블록을 포함할 수 있으며 다른 페이지나 데이터베이스 안에 중첩될 수 있습니다.",
    details: [
      "GET /v1/pages/{page_id}로 페이지 가져오기",
      "POST /v1/pages로 페이지 생성",
      "PATCH /v1/pages/{page_id}로 페이지 속성 업데이트",
      "archived: true로 페이지 보관(소프트 삭제)",
    ],
  },
  {
    icon: "🗄️",
    title: "데이터베이스(Databases)",
    description:
      "데이터베이스는 페이지의 구조화된 컬렉션입니다. 각 행은 페이지이고, 각 열은 정의된 타입(텍스트, 숫자, 선택, 날짜, 관계 등)을 가진 속성입니다.",
    details: [
      "POST /v1/databases/{database_id}/query로 데이터베이스 조회",
      "쿼리 본문에서 결과 필터링 및 정렬",
      "PATCH /v1/databases/{database_id}로 데이터베이스 스키마 생성 또는 업데이트",
      "데이터베이스 페이지는 부모 데이터베이스의 속성 스키마를 상속",
    ],
  },
  {
    icon: "🧱",
    title: "블록(Blocks)",
    description:
      "페이지 안의 모든 것은 블록입니다 — 단락, 헤딩, 이미지, 코드, 할 일 항목, 콜아웃 등. 블록은 중첩되어 풍부한 레이아웃을 만들 수 있습니다.",
    details: [
      "GET /v1/blocks/{block_id}/children으로 자식 블록 목록 조회",
      "PATCH /v1/blocks/{block_id}/children으로 블록 추가",
      "PATCH /v1/blocks/{block_id}로 블록 내용 업데이트",
      "DELETE /v1/blocks/{block_id}로 블록 삭제",
    ],
  },
  {
    icon: "👥",
    title: "사용자(Users)",
    description:
      "Users API를 통해 워크스페이스 멤버와 봇에 대한 정보를 가져올 수 있습니다. 모든 사용자를 나열하거나 ID로 특정 사용자를 가져올 수 있습니다.",
    details: [
      "GET /v1/users로 모든 사용자 목록 조회",
      "GET /v1/users/{user_id}로 특정 사용자 가져오기",
      "GET /v1/users/me로 통합의 봇 사용자 가져오기",
      "사용자 타입은 'person' 또는 'bot'",
    ],
  },
  {
    icon: "💬",
    title: "댓글(Comments)",
    description:
      "댓글은 페이지와 블록 인라인에 추가할 수 있습니다. Comments API를 통해 프로그래밍 방식으로 댓글을 읽고 작성할 수 있습니다.",
    details: [
      "GET /v1/comments로 댓글 조회",
      "POST /v1/comments로 댓글 작성",
      "댓글 본문에서 리치 텍스트 포맷 지원",
      "통합 설정에서 댓글 읽기/쓰기 권한 활성화 필요",
    ],
  },
  {
    icon: "🔍",
    title: "검색(Search)",
    description:
      "Search API는 통합과 공유된 모든 페이지와 데이터베이스를 검색합니다. 객체 타입별 필터링과 키워드 쿼리를 지원합니다.",
    details: [
      "쿼리 문자열과 함께 POST /v1/search",
      "결과를 페이지 또는 데이터베이스로만 필터링",
      "기본적으로 마지막 수정 시간 순으로 정렬",
      "통합과 공유된 객체만 반환",
    ],
  },
];

export default function Docs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">문서</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">핵심 개념</h1>
        <p className="text-lg text-gray-600">
          페이지, 데이터베이스, 블록, 사용자 등 Notion API의 근본적인 구성 요소를 이해하세요.
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
        <h3 className="font-semibold text-gray-900 mb-2">API를 탐색할 준비가 됐나요?</h3>
        <p className="text-sm text-gray-600 mb-4">
          요청/응답 형태, 에러 코드, 속도 제한에 대한 전체 엔드포인트 레퍼런스를 확인하세요.
        </p>
        <Link
          href="/api-reference"
          className="inline-block bg-black text-white text-sm px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
        >
          API 레퍼런스로 이동 →
        </Link>
      </div>
    </div>
  );
}
