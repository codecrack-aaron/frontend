'use client';

import ReactMarkdown from 'react-markdown';

export default function ProblemDescription({ markdown }: { markdown: string }) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
