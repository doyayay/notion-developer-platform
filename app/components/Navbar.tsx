import Link from "next/link";
import { Code2 } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/quickstart", label: "Quickstart" },
  { href: "/authentication", label: "Authentication" },
  { href: "/docs", label: "Docs" },
  { href: "/api-reference", label: "API Reference" },
];

export default function Navbar() {
  return (
    <header
      className="
        sticky top-0 z-50
        bg-white dark:bg-gray-950
        border-b border-gray-200 dark:border-gray-800
        transition-colors duration-300
      "
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 text-lg"
        >
          <span className="text-2xl">📝</span>
          <span>Notion Dev Platform</span>
        </Link>

        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="
                text-sm text-gray-600 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-gray-100
                transition-colors duration-200
              "
            >
              {link.label}
            </Link>
          ))}

          {/* Code snippets badge */}
          <span
            title="All code blocks support one-click copy"
            className="
              hidden sm:flex items-center gap-1.5
              px-3 py-1.5 rounded-full
              bg-gray-950 dark:bg-gray-800
              text-gray-300
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
            className="
              text-sm
              bg-black dark:bg-white
              text-white dark:text-gray-900
              px-4 py-2 rounded-full
              hover:bg-gray-800 dark:hover:bg-gray-200
              transition-colors duration-200
            "
          >
            Open Notion Docs ↗
          </a>

          {/* Dark mode toggle */}
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}
