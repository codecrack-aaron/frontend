// API client functions for backend services

const PROBLEM_CONTENT_API = process.env.NEXT_PUBLIC_PROBLEM_CONTENT_API || 'https://gg5ex36tne.execute-api.us-east-1.amazonaws.com';

export interface ProblemContent {
  description: string;
  starterCode: {
    python: string;
    javascript: string;
    cpp: string;
    java: string;
    csharp: string;
    go: string;
  };
}

export interface TestResult {
  id: string;
  stdout: string;
  success: boolean;
  stderr?: string;
}

export async function fetchProblemContent(problemId: string): Promise<ProblemContent> {
  const res = await fetch(`${PROBLEM_CONTENT_API}/problems/${problemId}`, {
    cache: 'force-cache', // Cache problem content
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch problem: ${res.status}`);
  }

  return res.json();
}

export async function executeCode(
  language: string,
  problemId: string,
  code: string
): Promise<TestResult[]> {
  const res = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, problem_id: problemId, code }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Execution failed');
  }

  const data = await res.json();

  if (data.status === 'compilation_error' || data.status === 'internal_error') {
    throw new Error(data.message || 'Execution failed');
  }

  return data.test_results;
}
