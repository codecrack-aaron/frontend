# CodeCrack Frontend

Next.js web application for the CodeCrack coding challenge platform.

## Tech Stack

- **Next.js 14.2.15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **CodeMirror 6** - Code editor with multi-language support
- **React Markdown** - Markdown rendering for problem descriptions

## Architecture

- **Server Components** - Problem content fetched server-side (never exposed to client bundle)
- **Static Problem List** - Problem list stored in code, not fetched from API
- **API Proxy** - `/api/execute` route proxies code execution requests to backend Lambda
- **Client Components** - Problem detail page with code editor and test results

## Environment Variables

Create `.env.local` file:

```
PROBLEM_CONTENT_API=https://gg5ex36tne.execute-api.us-east-1.amazonaws.com
CODE_EXECUTION_API=https://your-code-execution-lambda-url.amazonaws.com
```

## Local Development

Install dependencies:
```cmd
npm install
```

Run development server:
```cmd
npm run dev
```

Open http://localhost:3000

## Production Build

Build application:
```cmd
npm run build
```

Start production server:
```cmd
npm start
```

## Docker Deployment

Build Docker image:
```cmd
docker build -t codecrack-frontend .
```

Run container:
```cmd
docker run -p 3000:3000 -e PROBLEM_CONTENT_API=https://gg5ex36tne.execute-api.us-east-1.amazonaws.com -e CODE_EXECUTION_API=https://your-code-execution-lambda-url.amazonaws.com codecrack-frontend
```

## Deployment to AWS Lightsail

1. Build and push Docker image to container registry
2. Create Lightsail container service
3. Deploy container with environment variables
4. Configure custom domain (if desired)

## Supported Languages

- Python
- JavaScript
- C++
- Java
- C#
- Go

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── problems/
│   │   ├── page.tsx            # Problem list page
│   │   └── [id]/
│   │       └── page.tsx        # Problem detail page (client component)
│   └── api/
│       └── execute/
│           └── route.ts        # Code execution proxy
├── components/
│   ├── ProblemDescription.tsx  # Markdown problem description
│   ├── CodeEditor.tsx          # CodeMirror editor with language switching
│   └── TestResults.tsx         # Test results display
├── lib/
│   ├── problems.ts             # Static problem list
│   └── api.ts                  # API client functions
└── public/                     # Static assets
```
