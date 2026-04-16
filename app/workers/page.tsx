import Link from "next/link";

const workflowSteps = [
  { step: 1, emoji: "🧑", actor: "사람", title: "PRD 작성", desc: "Notion PRD Database에 기능 스펙을 작성하고 상태를 In Development로 설정합니다.", auto: false },
  { step: 2, emoji: "🤖", actor: "AI + 사람", title: "코드 구현", desc: "Claude Code가 Notion PRD를 읽고 코드를 작성합니다. 개발자가 리뷰 후 GitHub PR을 생성합니다.", auto: false },
  { step: 3, emoji: "🧑", actor: "사람", title: "PR Merge", desc: "개발자가 PR을 리뷰하고 직접 Merge 버튼을 클릭합니다. 이 시점부터 이하 모든 과정이 자동입니다.", highlight: true, auto: false },
  { step: 4, emoji: "⚡", actor: "Worker (자동)", title: "Notion PRD 자동 업데이트", desc: "GitHub Webhook → Worker 트리거 → PRD 상태를 Implemented로 변경하고 PR 링크와 Commit Summary를 기입합니다. LLM 비용 0원.", auto: true },
  { step: 5, emoji: "🤖", actor: "Agent (자동)", title: "테스트 케이스 자동 생성", desc: "상태 변경을 트리거로 QA Agent가 PRD 내용과 Commit Summary를 읽고 Test Cases DB에 테스트 케이스 3~5개를 생성합니다.", auto: true },
];

const capabilities = [
  { icon: "🛠️", title: "Agent Tools", badge: "Generally Available", color: "bg-green-100 text-green-700", desc: "Notion 에이전트가 호출할 수 있는 커스텀 함수를 정의합니다. 스키마와 실행 로직을 함께 선언하면 에이전트가 적절한 시점에 자동으로 호출합니다." },
  { icon: "🔐", title: "OAuth", badge: "Generally Available", color: "bg-green-100 text-green-700", desc: "3-legged OAuth 플로우를 Workers 위에서 처리합니다. 외부 서비스와의 연동에 필요한 액세스 토큰을 안전하게 관리합니다." },
  { icon: "🔄", title: "Syncs", badge: "Private Alpha", color: "bg-gray-100 text-gray-500", desc: "외부 데이터 소스를 Notion 데이터베이스와 주기적으로 동기화합니다." },
  { icon: "⚙️", title: "Automations", badge: "Private Alpha", color: "bg-gray-100 text-gray-500", desc: "Notion 내 이벤트를 트리거로 자동화 로직을 실행합니다." },
];

export default function Workers() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-14">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Workers</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Notion Workers</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Workers는 Notion 위에서 실행되는 서버리스 함수입니다. 에이전트 도구, OAuth, 자동화 등 다양한 capability를 선언하고 배포하면 Notion이 적절한 시점에 실행합니다.
        </p>
      </div>

      {/* Workflow */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">워크플로우 예시</h2>
        <p className="text-sm text-gray-500 mb-8">PR Merge 이후의 모든 과정을 자동화할 수 있습니다.</p>
        <div className="space-y-4">
          {workflowSteps.map((s) => (
            <div key={s.step} className={`flex gap-5 p-5 rounded-2xl border ${s.highlight ? "border-black bg-gray-50" : s.auto ? "border-blue-100 bg-blue-50" : "border-gray-200 bg-white"}`}>
              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${s.auto ? "bg-blue-600 text-white" : "bg-black text-white"}`}>{s.step}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{s.emoji}</span>
                  <span className="text-xs text-gray-400">{s.actor}</span>
                  {s.auto && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">자동</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Code Example */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">코드 예제</h2>
        <p className="text-sm text-gray-500 mb-6">GitHub PR이 merge되면 Notion PRD 상태를 자동으로 업데이트하는 Worker입니다.</p>
        <pre className="bg-gray-950 text-gray-100 rounded-xl p-5 text-sm overflow-x-auto leading-relaxed">
          <code>{`import { Worker } from "@notionhq/workers";
import * as j from "@notionhq/workers/schema-builder";

const worker = new Worker();
export default worker;

worker.tool("updatePrdOnMerge", {
  title: "Update PRD on PR Merge",
  description: "PR이 merge되면 Notion PRD 상태를 Implemented로 업데이트합니다.",
  schema: j.object({
    pageId:        j.string().describe("PRD 페이지 ID"),
    prUrl:         j.string().describe("merge된 GitHub PR URL"),
    commitSummary: j.string().describe("커밋 요약"),
  }),
  execute: async ({ pageId, prUrl, commitSummary }, { notion }) => {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        "상태":          { status: { name: "Implemented" } },
        "GitHub PR":     { url: prUrl },
        "Commit Summary": { rich_text: [{ text: { content: commitSummary } }] },
      },
    });
    return "PRD updated successfully";
  },
});`}</code>
        </pre>
      </section>

      {/* Capabilities */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Capabilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {capabilities.map((c) => (
            <div key={c.title} className="border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.color}`}>{c.badge}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Getting Started */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">시작하기</h2>
        <div className="space-y-4">
          {[
            { label: "1. CLI 설치", code: "npm install -g @notionhq/ntn" },
            { label: "2. 워크스페이스 연결", code: "ntn login" },
            { label: "3. 배포", code: "ntn workers deploy" },
          ].map(({ label, code }) => (
            <div key={label}>
              <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
              <pre className="bg-gray-950 text-gray-100 rounded-xl p-4 text-sm overflow-x-auto">
                <code>{code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">더 알아보기</h3>
        <p className="text-sm text-gray-600 mb-4">Workers SDK 전체 레퍼런스와 예제는 공식 문서에서 확인하세요.</p>
        <div className="flex flex-wrap gap-3">
          <a href="https://developers.notion.com/docs/workers" target="_blank" rel="noopener noreferrer" className="inline-block bg-black text-white text-sm px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors">공식 문서 →</a>
          <Link href="/docs" className="inline-block border border-gray-300 text-gray-700 text-sm px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors">Core Concepts</Link>
        </div>
      </div>
    </div>
  );
}
