"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import GlobalSearch from "./GlobalSearch";

export default function SearchButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs transition-colors group"
        title="Search (⌘K)"
      >
        <Search size={13} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-400 font-mono text-[10px] group-hover:border-gray-300">⌘K</kbd>
      </button>
      {open && <GlobalSearch />}
    </>
  );
}
