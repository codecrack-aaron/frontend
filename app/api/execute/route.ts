import { NextRequest, NextResponse } from 'next/server';

// Code Execution Lambda API - internal URL (not publicly accessible via custom domain yet)
// Eventually this will be wrapped in a backend API with rate limiting and auth
const CODE_EXECUTION_API = process.env.CODE_EXECUTION_API || 'https://your-code-execution-api.execute-api.us-east-1.amazonaws.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language, problem_id, code } = body;

    if (!language || !problem_id || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Proxy request to Code Execution Lambda
    const response = await fetch(CODE_EXECUTION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language, problem_id, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Execution failed' },
        { status: response.status }
      );
    }

    // Parse the response body if it's a string
    const results = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Execute API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
