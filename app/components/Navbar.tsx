import Link from "next/link";

const links = [
  { href: "/", label: "홈" },
  { href: "/quickstart", label: "빠른 시작" },
  { href: "/authentication", label: "인증" },
  { href: "/docs", label: "문서" },
  { href: "/api-reference", label: "API 레퍼런스" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
          <span className="text-2xl">📝</span>
          <span>Notion Dev Platform Demo</span>
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://developers.notion.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            공식 문서 열기 ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
