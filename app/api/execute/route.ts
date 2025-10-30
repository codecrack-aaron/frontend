import { NextRequest, NextResponse } from 'next/server';

const CODE_EXECUTION_API = 'https://sa2xj6mvwdd5eduvf64hpqha7m0cbcgb.lambda-url.us-east-1.on.aws/';

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

    const response = await fetch(CODE_EXECUTION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language, problem_id, code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Execution failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Execute API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
