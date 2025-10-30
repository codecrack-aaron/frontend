# Frontend Architecture

## Overview

Next.js application deployed on AWS Lightsail Container Service. Uses Server Components and middleware to protect problem content from being exposed in client bundle. Problem list is stored in the frontend codebase, allowing backend problems to exist before being surfaced on the site.

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **CodeMirror 6** (code editor)
- **React Markdown** (problem descriptions)

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── problems/
│   │   ├── page.tsx              # Problem list (static list in code)
│   │   └── [id]/
│   │       └── page.tsx          # Problem detail + code editor (Server Component)
│   ├── api/
│   │   └── execute/route.ts      # Proxy to Code Execution Lambda
│   └── middleware.ts             # Auth protection (Phase 2)
├── components/
│   ├── CodeEditor.tsx            # CodeMirror 6 wrapper
│   ├── ProblemDescription.tsx    # Markdown renderer
│   └── TestResults.tsx           # Test execution results display
├── lib/
│   ├── problems.ts               # Static problem list (id, title, difficulty)
│   ├── auth.ts                   # JWT validation (Phase 2)
│   └── api.ts                    # API client functions
└── Dockerfile
```

## Problem List Management

The problem list is stored as a static TypeScript constant in `lib/problems.ts`:

```typescript
// lib/problems.ts
export const PROBLEMS = [
  { id: 'two_sum', title: 'Two Sum', difficulty: 'Easy' },
  { id: 'add_list', title: 'Add Numbers', difficulty: 'Easy' },
  // New problems can be added to backend but not shown here until ready
] as const;
```

This allows:
- Adding problems to test_sets_repo and deploying them to Problem Content Lambda
- Testing new problems internally without exposing them publicly
- Controlling exactly when new problems appear on the site (via code deploy)

## Route Protection

Next.js middleware runs server-side before any route is accessed. In Phase 1, middleware is a no-op. In Phase 2, it validates JWT.

```typescript
// middleware.ts - Phase 1
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// middleware.ts - Phase 2
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');

  if (request.nextUrl.pathname.startsWith('/problems/')) {
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
```

## Server Components

Problem detail page is a Server Component that fetches content from Problem Content Lambda on the server. Problem descriptions and starter code never appear in client JavaScript bundle.

```typescript
// app/problems/[id]/page.tsx
export default async function ProblemPage({ params }: { params: { id: string } }) {
  // Fetched server-side, not exposed to client
  const problem = await fetch(`https://api.codecrack.org/problems/${params.id}`).then(r => r.json());

  return (
    <div>
      <ProblemDescription markdown={problem.description} />
      <CodeEditor initialCode={problem.starterCode} />
    </div>
  );
}
```

## Docker Build

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## Deployment

CloudFormation stack creates:
- ECR repository: `codecrack-frontend`
- Lightsail Container Service (staging and production)
- CodePipeline with 5 stages

### Pipeline Stages

**1. Source**
- GitHub repository as source
- Triggers on push to main branch

**2. Build**
- Build Next.js application (`npm run build`)
- Build Docker image
- Push image to ECR with commit hash tag
- Upload to S3 for deploy stages

**3. DeployStaging**
- Deploy to staging Lightsail Container Service
- Available at internal AWS URL: `codecrack-frontend-staging.[...].cs.amazonlightsail.com`

**4. Approval**
- Manual approval required before production deployment

**5. DeployProduction**
- Deploy to production Lightsail Container Service
- Available at `codecrack.org`

### Buildspec

```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_URI
  build:
    commands:
      - echo Building Next.js application...
      - docker build -t $ECR_REPOSITORY_URI:$CODEBUILD_RESOLVED_SOURCE_VERSION .
  post_build:
    commands:
      - echo Pushing Docker image...
      - docker push $ECR_REPOSITORY_URI:$CODEBUILD_RESOLVED_SOURCE_VERSION
artifacts:
  files:
    - '**/*'
```

### Lightsail Configuration

Lightsail container definition:
```json
{
  "frontend": {
    "image": "<ECR_IMAGE_URI>:<COMMIT_HASH>",
    "ports": {
      "3000": "HTTP"
    },
    "environment": {
      "NODE_ENV": "production",
      "PROBLEM_CONTENT_API": "https://api.codecrack.org",
      "CODE_EXECUTION_API_INTERNAL": "https://<internal-api-gateway-url>"
    }
  }
}
```

Service configuration:
- Power: Nano (512MB RAM, 0.25 vCPU) to start
- Scale: 1 container (can increase later)
- Public endpoint: Enabled with HTTPS
- Custom domains:
  - Production: `codecrack.org` (see DOMAIN_SETUP.md)
  - Staging: Internal AWS URL (no custom domain)

## Environment Variables

- `PROBLEM_CONTENT_API`: `https://api.codecrack.org` (production) or `https://[...].execute-api.us-east-1.amazonaws.com` (staging)
- `CODE_EXECUTION_API_INTERNAL`: Internal API Gateway URL (not publicly accessible, eventually will be wrapped)
- `NODE_ENV`: Set to `production`

## Custom Domain Setup

See [DOMAIN_SETUP.md](../DOMAIN_SETUP.md) for complete guide on:
- Setting up `codecrack.org` for production frontend
- Setting up `api.codecrack.org` with path-based routing to multiple Lambdas
- Route 53 and ACM certificate configuration

## Data Flow

```
User Browser → Lightsail (Next.js)
                    ↓
    Server Component fetches problem → api.codecrack.org/problems/* → Problem Content Lambda
                    ↓
    Client submits code → /api/execute → Code Execution Lambda (internal URL)
```

Problem content is fetched server-side in Server Components, so it never appears in client bundle. Code submissions go through Next.js API route that proxies to Code Execution Lambda.
