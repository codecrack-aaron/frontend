'use client';

import { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
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
  problemId: string;
}

function getStorageKey(problemId: string, language: Language): string {
  return `codecrack_code_${problemId}_${language}`;
}

function getCursorKey(problemId: string, language: Language): string {
  return `codecrack_cursor_${problemId}_${language}`;
}

function findLongestWhitespaceLine(code: string): number {
  const lines = code.split('\n');
  let longestLine = 0;
  let maxLength = -1;

  lines.forEach((line, index) => {
    if (line.trim() === '' && line.length > maxLength) {
      maxLength = line.length;
      longestLine = index;
    }
  });

  return longestLine;
}

export default function CodeEditor({ starterCode, onExecute, isExecuting, problemId }: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python');
  const [codeByLanguage, setCodeByLanguage] = useState<Record<Language, string>>(() => {
    const initial: Partial<Record<Language, string>> = {};
    Object.keys(LANGUAGES).forEach((lang) => {
      const key = lang as Language;
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(getStorageKey(problemId, key));
        initial[key] = saved || starterCode[key];
      } else {
        initial[key] = starterCode[key];
      }
    });
    return initial as Record<Language, string>;
  });
  const [code, setCode] = useState(codeByLanguage.python);
  const editorViewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && code) {
      localStorage.setItem(getStorageKey(problemId, selectedLanguage), code);
      const updated = { ...codeByLanguage, [selectedLanguage]: code };
      setCodeByLanguage(updated);

      if (editorViewRef.current) {
        const cursorPos = editorViewRef.current.state.selection.main.head;
        localStorage.setItem(getCursorKey(problemId, selectedLanguage), cursorPos.toString());
      }
    }
  }, [code, selectedLanguage, problemId]);

  const handleLanguageChange = (lang: Language) => {
    if (lang === selectedLanguage) return;

    const newCode = codeByLanguage[lang];

    if (editorViewRef.current && typeof window !== 'undefined') {
      const view = editorViewRef.current;
      const savedCursor = localStorage.getItem(getCursorKey(problemId, lang));

      let cursorPos: number;
      if (savedCursor) {
        cursorPos = Math.min(parseInt(savedCursor, 10), newCode.length);
      } else {
        const targetLine = findLongestWhitespaceLine(newCode);
        const lines = newCode.split('\n');
        let pos = 0;
        for (let i = 0; i < targetLine && i < lines.length; i++) {
          pos += lines[i].length + 1;
        }
        if (targetLine < lines.length) {
          pos += lines[targetLine].length;
        }
        cursorPos = pos;
      }

      // Update content and cursor in a single atomic transaction
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: newCode
        },
        selection: { anchor: cursorPos },
        scrollIntoView: true
      });
      view.focus();
    }

    setSelectedLanguage(lang);
    setCode(newCode);
  };

  const handleExecute = () => {
    onExecute(selectedLanguage, code);
  };

  const handleReset = () => {
    const defaultCode = starterCode[selectedLanguage];
    setCode(defaultCode);
    const updated = { ...codeByLanguage, [selectedLanguage]: defaultCode };
    setCodeByLanguage(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(problemId, selectedLanguage), defaultCode);
    }

    setTimeout(() => {
      if (editorViewRef.current) {
        const targetLine = findLongestWhitespaceLine(defaultCode);
        const pos = editorViewRef.current.state.doc.line(targetLine + 1).to;
        editorViewRef.current.dispatch({
          selection: { anchor: pos },
          scrollIntoView: true,
        });
        editorViewRef.current.focus();
      }
    }, 50);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-4 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              disabled={isExecuting}
              className="pl-3 pr-10 py-2 rounded bg-white text-gray-700 border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
            {Object.entries(LANGUAGES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={isExecuting}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isExecuting ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      <CodeMirror
        value={code}
        height="400px"
        theme={oneDark}
        extensions={[LANGUAGES[selectedLanguage].extension]}
        onChange={(value) => setCode(value)}
        onCreateEditor={(view) => {
          editorViewRef.current = view;
        }}
      />
    </div>
  );
}
