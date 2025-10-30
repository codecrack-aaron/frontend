'use client';

import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';

const LANGUAGES = {
  python: { label: 'Python', extension: python() },
  javascript: { label: 'JavaScript', extension: javascript() },
  cpp: { label: 'C++', extension: cpp() },
  java: { label: 'Java', extension: java() },
  csharp: { label: 'C#', extension: java() }, // Use Java syntax for C#
  go: { label: 'Go', extension: cpp() }, // Use C++ syntax for Go
} as const;

type Language = keyof typeof LANGUAGES;

interface CodeEditorProps {
  starterCode: Record<Language, string>;
  onExecute: (language: Language, code: string) => void;
  isExecuting: boolean;
}

export default function CodeEditor({ starterCode, onExecute, isExecuting }: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python');
  const [code, setCode] = useState(starterCode.python);

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    setCode(starterCode[lang]);
  };

  const handleExecute = () => {
    onExecute(selectedLanguage, code);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-4 flex justify-between items-center">
        <div className="flex gap-2">
          {Object.entries(LANGUAGES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => handleLanguageChange(key as Language)}
              className={`px-4 py-2 rounded ${
                selectedLanguage === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isExecuting ? 'Running...' : 'Run'}
        </button>
      </div>

      <CodeMirror
        value={code}
        height="400px"
        theme={oneDark}
        extensions={[LANGUAGES[selectedLanguage].extension]}
        onChange={(value) => setCode(value)}
      />
    </div>
  );
}
