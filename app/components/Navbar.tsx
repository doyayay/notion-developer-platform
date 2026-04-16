import Link from "next/link";
import { Code2 } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/quickstart", label: "Quickstart" },
  { href: "/authentication", label: "Authentication" },
  { href: "/docs", label: "Docs" },
  { href: "/api-reference", label: "API Reference" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-gray-900 text-lg"
        >
          <span className="text-2xl">📝</span>
          <span>Notion Dev Platform</span>
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

          {/* Code snippets badge — signals copy-enabled code blocks site-wide */}
          <span
            title="All code blocks support one-click copy"
            className="
              hidden sm:flex items-center gap-1.5
              px-3 py-1.5 rounded-full
              bg-gray-950 text-gray-300
              text-xs font-medium
              select-none
            "
          >
            <Code2 size={13} />
            Copy-ready
          </span>

          <a
            href="https://developers.notion.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            Open Notion Docs ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
