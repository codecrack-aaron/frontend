'use client';

import { useState, useEffect } from 'use';
import { use } from 'react';
import Link from 'next/link';
import { fetchProblemContent, executeCode, type ProblemContent, type TestResult } from '@/lib/api';
import ProblemDescription from '@/components/ProblemDescription';
import CodeEditor from '@/components/CodeEditor';
import TestResults from '@/components/TestResults';

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [problem, setProblem] = useState<ProblemContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  useEffect(() => {
    fetchProblemContent(id)
      .then((data) => {
        setProblem(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleExecute = async (language: string, code: string) => {
    setIsExecuting(true);
    setExecutionError(null);
    setTestResults([]);

    try {
      const results = await executeCode(language, id, code);
      setTestResults(results);
    } catch (err: any) {
      setExecutionError(err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/problems" className="text-blue-600 hover:underline mb-4 block">
            ← Back to Problems
          </Link>
          <div className="text-red-600">Error: {error || 'Problem not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/problems" className="text-blue-600 hover:underline">
            ← Back to Problems
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-6 capitalize">{id.replace(/_/g, ' ')}</h1>
            <ProblemDescription markdown={problem.description} />
          </div>

          <div className="space-y-6">
            <CodeEditor
              starterCode={problem.starterCode}
              onExecute={handleExecute}
              isExecuting={isExecuting}
            />

            <TestResults results={testResults} error={executionError || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
