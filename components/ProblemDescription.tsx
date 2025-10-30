'use client';

import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

export default function ProblemDescription({ markdown }: { markdown: string }) {
  const components: Components = {
    code: ({ node, className, children, ...props }) => {
      const isInline = !className?.includes('language-');
      if (isInline) {
        return <code className={className} {...props}>{children}</code>;
      }
      const content = children?.toString() || '';
      const trimmedContent = content.replace(/\n$/, '');
      return <code className={className} {...props}>{trimmedContent}</code>;
    },
  };

  return (
    <div className="prose prose-slate prose-sm max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:my-2 prose-p:leading-snug prose-ul:my-2 prose-li:my-0.5 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-gray-800 prose-pre:px-3 prose-pre:py-3 prose-pre:text-white prose-pre:text-xs prose-pre:leading-normal prose-pre:shadow-none prose-pre:my-2 [&_pre_code]:bg-transparent [&_pre_code]:text-white [&_pre_code]:p-0 [&_pre_code]:shadow-none [&_pre_code]:font-mono [&_pre_code]:leading-normal [&_pre_code]:block">
      <ReactMarkdown components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
