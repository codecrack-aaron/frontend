'use client';

import { TestResult } from '@/lib/api';

interface TestResultsProps {
  results: TestResult[];
  error?: string;
}

export default function TestResults({ results, error }: TestResultsProps) {
  if (error) {
    return (
      <div className="border rounded-lg p-6 bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-700 font-mono text-sm">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  const passedCount = results.filter((r) => r.success).length;
  const totalCount = results.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={`p-4 ${passedCount === totalCount ? 'bg-green-50' : 'bg-red-50'}`}>
        <h3 className="text-lg font-semibold">
          Test Results: {passedCount}/{totalCount} passed
        </h3>
      </div>

      <div className="divide-y">
        {results.map((result, idx) => (
          <div
            key={result.id}
            className={`p-4 ${result.success ? 'bg-white' : 'bg-red-50'}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Test {idx + 1}</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.success
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {result.success ? 'Passed' : 'Failed'}
              </span>
            </div>
            <div className="font-mono text-sm bg-gray-100 p-3 rounded">
              <div className="text-gray-600 mb-1">Output:</div>
              <div>{result.stdout || '(no output)'}</div>
              {result.stderr && (
                <>
                  <div className="text-red-600 mt-2 mb-1">Error:</div>
                  <div className="text-red-700">{result.stderr}</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
