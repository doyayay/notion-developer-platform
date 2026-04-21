import Link from "next/link";

const features = [
  {
    icon: "🔌",
    title: "REST API",
    description: "데이터베이스 조회, 페이지 생성, 블록 업데이트, 사용자 관리를 깔끔한 REST API로 처리하세요.",
  },
  {
    icon: "🤖",
    title: "통합(Integrations)",
    description: "기존 도구 및 워크플로우와 Notion을 연결하는 내부 통합을 구축하세요.",
  },
  {
    icon: "🔒",
    title: "OAuth 2.0",
    description: "표준 OAuth 플로우를 사용하여 사용자가 자신의 Notion 워크스페이스에 앱 권한을 부여할 수 있게 하세요.",
  },
  {
    icon: "📦",
    title: "공식 SDK",
    description: "공식 JavaScript/TypeScript SDK와 커뮤니티 SDK로 빠르게 시작하세요.",
  },
  {
    icon: "⚡",
    title: "웹훅(Webhooks)",
    description: "페이지, 데이터베이스, 댓글에 대한 웹훅 이벤트로 변경 사항에 실시간 반응하세요.",
  },
  {
    icon: "🏗️",
    title: "Block API",
    description: "단락, 코드, 표, 임베드 등 모든 Notion 블록 타입을 읽고 쓰세요.",
  },
];

const sections = [
  { href: "/quickstart", label: "빠른 시작", desc: "몇 분 안에 첫 번째 통합을 만들어보세요." },
  { href: "/authentication", label: "인증", desc: "내부 통합과 OAuth 2.0." },
  { href: "/docs", label: "핵심 개념", desc: "페이지, 데이터베이스, 블록, 사용자." },
  { href: "/api-reference", label: "API 레퍼런스", desc: "전체 엔드포인트 및 타입 레퍼런스." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-black text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Developer Platform Demo
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Notion 위에서 구축하세요
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Notion Developer Platform은 Notion을 통합하고, 자동화하고, 확장하여
            나머지 스택과 연결하는 도구를 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quickstart"
              className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              시작하기 →
            </Link>
            <Link
              href="/api-reference"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              API 레퍼런스
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">구축에 필요한 모든 것</h2>
        <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">
          Notion 워크스페이스의 데이터를 읽고, 쓰고, 반응하는 완전한 API와 툴링 세트.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="bg-gray-50 border-t border-gray-100 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">문서 탐색하기</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sections.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="flex flex-col gap-1 p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group"
              >
                <span className="font-semibold text-gray-900 group-hover:text-black">{s.label} →</span>
                <span className="text-sm text-gray-500">{s.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
