import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProseProps {
  children: string;
  size?: 'sm' | 'xs';
  className?: string;
}

export function Prose({ children, size = 'sm', className = '' }: ProseProps) {
  const sizeClass = size === 'xs' ? 'prose-xs' : 'prose-sm';

  return (
    <div className={`prose prose-invert ${sizeClass} max-w-none
      prose-headings:text-white prose-headings:font-semibold
      prose-h1:text-2xl prose-h1:border-b prose-h1:border-[#333] prose-h1:pb-2 prose-h1:mb-4
      prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
      prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
      prose-p:text-gray-300 prose-p:leading-relaxed
      prose-a:text-orch-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-white prose-strong:font-semibold
      prose-code:text-orch-300 prose-code:bg-[#1a1a1a] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-[#222] prose-pre:rounded-lg
      prose-ul:text-gray-300 prose-ol:text-gray-300
      prose-li:marker:text-gray-500
      prose-table:border-collapse prose-table:w-full
      prose-th:bg-[#1a1a1a] prose-th:border prose-th:border-[#333] prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-white prose-th:font-medium
      prose-td:border prose-td:border-[#222] prose-td:px-3 prose-td:py-2 prose-td:text-gray-300
      prose-blockquote:border-l-orch-500 prose-blockquote:bg-[#111] prose-blockquote:py-1 prose-blockquote:text-gray-400
      prose-hr:border-[#333]
      ${className}
    `}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
