export default function Quickstart() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">시작하기</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">빠른 시작</h1>
        <p className="text-lg text-gray-600">
          10분 안에 첫 번째 Notion 통합을 만들고 첫 API 호출을 해보세요.
        </p>
      </div>

      <div className="space-y-12">
        <Step number={1} title="통합 생성">
          <p className="text-gray-600 mb-4">
            <a href="https://www.notion.so/my-integrations" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">notion.so/my-integrations</a>로 이동하여 <strong>새 통합</strong>을 클릭하세요. 이름을 지정하고 빌드할 워크스페이스를 선택하세요.
          </p>
          <p className="text-gray-600">
            생성 후 <strong>내부 통합 시크릿(Internal Integration Secret)</strong>을 받게 됩니다 — 비밀번호처럼 취급하세요.
          </p>
        </Step>

        <Step number={2} title="페이지를 통합과 공유">
          <p className="text-gray-600">
            Notion 페이지나 데이터베이스를 여세요. <strong>···</strong> 메뉴 → <strong>연결</strong> → 통합을 선택하세요. 이 단계 없이는 API가 해당 리소스에 대해 404를 반환합니다.
          </p>
        </Step>

        <Step number={3} title="SDK 설치">
          <CodeBlock code={`npm install @notionhq/client`} />
        </Step>

        <Step number={4} title="첫 번째 API 호출">
          <p className="text-gray-600 mb-4">
            통합 시크릿으로 클라이언트를 초기화한 다음, 데이터베이스를 조회하거나 페이지를 가져오세요:
          </p>
          <CodeBlock
            code={`import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// 통합과 공유된 데이터베이스 목록 조회
const response = await notion.search({
  filter: { property: "object", value: "database" },
});

console.log(response.results);`}
          />
        </Step>

        <Step number={5} title="실행">
          <CodeBlock code={`NOTION_TOKEN=secret_xxx npx tsx index.ts`} />
          <p className="text-gray-600 mt-4">
            워크스페이스에서 반환된 데이터베이스 객체의 JSON 배열이 표시됩니다.
          </p>
        </Step>
      </div>

      <div className="mt-16 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">다음 단계</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
          <li>사용자 대상 OAuth 앱을 위한 <a href="/authentication" className="text-blue-600 underline">인증</a> 읽기</li>
          <li>페이지, 데이터베이스, 블록에 대한 <a href="/docs" className="text-blue-600 underline">핵심 개념</a> 탐색</li>
          <li>전체 <a href="/api-reference" className="text-blue-600 underline">API 레퍼런스</a> 확인</li>
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
