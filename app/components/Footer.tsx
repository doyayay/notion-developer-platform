export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Notion Developer Platform Demo</p>
        <div className="flex gap-6">
          <a href="https://developers.notion.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">공식 문서</a>
          <a href="https://github.com/makenotion/notion-sdk-js" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">GitHub SDK</a>
          <a href="https://www.notion.so/help/create-integrations-with-the-notion-api" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">통합 가이드</a>
        </div>
      </div>
    </footer>
  );
}
