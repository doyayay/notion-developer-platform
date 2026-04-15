import Link from "next/link";

const features = [
  {
    icon: "🔌",
    title: "REST API",
    description: "Query databases, create pages, update blocks, and manage users through a clean REST API.",
  },
  {
    icon: "🤖",
    title: "Integrations",
    description: "Build internal integrations to connect Notion to your existing tools and workflows.",
  },
  {
    icon: "🔒",
    title: "OAuth 2.0",
    description: "Let users authorize your app with their Notion workspace using standard OAuth flows.",
  },
  {
    icon: "📦",
    title: "Official SDKs",
    description: "Get started fast with the official JavaScript/TypeScript SDK and community SDKs.",
  },
  {
    icon: "⚡",
    title: "Webhooks",
    description: "React to changes in real time with webhook events for pages, databases, and comments.",
  },
  {
    icon: "🏗️",
    title: "Block API",
    description: "Read and write any Notion block type — paragraphs, code, tables, embeds, and more.",
  },
];

const sections = [
  { href: "/quickstart", label: "Quickstart", desc: "Create your first integration in minutes." },
  { href: "/authentication", label: "Authentication", desc: "Internal integrations and OAuth 2.0." },
  { href: "/docs", label: "Core Concepts", desc: "Pages, databases, blocks, and users." },
  { href: "/api-reference", label: "API Reference", desc: "Full endpoint and type reference." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-black text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Developer Platform
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Build on Notion
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            The Notion Developer Platform gives you the tools to integrate,
            automate, and extend Notion — connecting it to the rest of your stack.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quickstart"
              className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Get Started →
            </Link>
            <Link
              href="/api-reference"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              API Reference
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything you need to build</h2>
        <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">
          A complete set of APIs and tooling to read, write, and react to data in any Notion workspace.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Explore the docs</h2>
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
