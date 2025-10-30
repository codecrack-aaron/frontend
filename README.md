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

### Prerequisites

1. AWS CLI configured with appropriate credentials
2. GitHub repository at `codecrack-aaron/frontend` on `master` branch
3. CodeStar Connection to GitHub (for CodePipeline)

### Initial Setup

#### 1. Create GitHub Connection

Create a CodeStar connection to GitHub:

```cmd
aws codestar-connections create-connection --provider-type GitHub --connection-name frontend-github
```

Complete the OAuth flow in the AWS console to authorize the connection. Note the connection ARN.

#### 2. Create Lightsail Container Services

Create staging container service:

```cmd
aws lightsail create-container-service --service-name frontend-staging --power small --scale 1
```

Create production container service:

```cmd
aws lightsail create-container-service --service-name frontend-production --power small --scale 1
```

Wait for services to be active:

```cmd
aws lightsail get-container-services --service-name frontend-staging
aws lightsail get-container-services --service-name frontend-production
```

#### 3. Deploy CloudFormation Stack

Deploy the stack with your GitHub connection ARN:

```cmd
aws cloudformation create-stack --stack-name frontend --template-body file://stack.yaml --parameters ParameterKey=GitHubConnectionArn,ParameterValue=arn:aws:codeconnections:us-east-1:864899848735:connection/8086ee1a-9896-43cc-9ce0-e638fa4cc6f9 --capabilities CAPABILITY_NAMED_IAM
```

Wait for stack creation to complete:

```cmd
aws cloudformation wait stack-create-complete --stack-name frontend
```

#### 4. Trigger Initial Pipeline

The pipeline will automatically trigger on the first push to the `master` branch. You can also manually trigger it:

```cmd
aws codepipeline start-pipeline-execution --name frontend-pipeline
```

### Pipeline Stages

The pipeline consists of the following stages:

1. **Source** - Pulls code from `codecrack-aaron/frontend` repository on `master` branch
2. **Build** - Builds Docker image and pushes to ECR with `staging` tag
3. **DeployStaging** - Deploys to `frontend-staging` Lightsail container service
4. **Approval** - Manual approval gate (review staging environment)
5. **DeployProduction** - Tags staging image as production and deploys to `frontend-production` Lightsail container service

### Accessing Deployments

Get staging URL:

```cmd
aws lightsail get-container-services --service-name frontend-staging --query "containerServices[0].url" --output text
```

Get production URL:

```cmd
aws lightsail get-container-services --service-name frontend-production --query "containerServices[0].url" --output text
```

### Monitoring

View pipeline status:

```cmd
aws codepipeline get-pipeline-state --name frontend-pipeline
```

View Lightsail container logs:

```cmd
aws lightsail get-container-log --service-name frontend-staging --container-name app
aws lightsail get-container-log --service-name frontend-production --container-name app
```

### Updating the Deployment

Push changes to the `master` branch to trigger the pipeline automatically. After the staging deployment completes, review the staging environment and approve the manual approval gate in the AWS CodePipeline console to deploy to production.

### Custom Domain Setup

To use a custom domain with Lightsail:

1. Create a Lightsail static IP
2. Attach the static IP to your container service
3. Create a DNS A record pointing to the static IP
4. Enable HTTPS with Lightsail's built-in SSL/TLS certificate

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
