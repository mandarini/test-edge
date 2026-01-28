# Edge Functions Playground

A React + TypeScript + Vite application demonstrating various Supabase Edge Functions patterns, including database operations, file uploads with presigned URLs, and CORS handling.

## Features

This playground demonstrates:

- **Edge Function Invocations**: Call Supabase Edge Functions from a React frontend
- **Database CRUD Operations**: Create, Read, Update, and Delete operations through edge functions
- **File Uploads**: Upload files to Supabase Storage using presigned URLs
- **CORS Configuration**: Proper handling of CORS preflight requests in edge functions

## Edge Functions

### 1. `hello-world`
A simple function that demonstrates basic edge function setup with proper CORS headers.

### 2. `test-cors`
Tests CORS configuration from the browser, using shared CORS headers.

### 3. `db-ops`
Performs database operations on the `todos` table:
- Create new todos
- Read all todos
- Update todo status
- Delete todos

### 4. `generate-upload-url`
Generates presigned URLs for direct file uploads to Supabase Storage, with automatic URL fixing for local development.

## Project Structure

```
├── src/
│   ├── App.tsx              # Main UI with all feature demos
│   ├── supabaseClient.ts    # Supabase client configuration
│   └── ...
├── supabase/
│   ├── functions/
│   │   ├── _shared/
│   │   │   └── cors.ts      # Shared CORS configuration
│   │   ├── hello-world/
│   │   ├── test-cors/
│   │   ├── db-ops/
│   │   └── generate-upload-url/
│   └── migrations/
│       ├── create_test_tables.sql
│       ├── create_test_uploads_bucket.sql
│       ├── add_todos_rls_policies.sql
│       └── remove_todos_user_fkey.sql
└── ...
```

## Setup

### Prerequisites
- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=npm) installed
- A Supabase project

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Start local Supabase:
```bash
supabase start
```

3. Apply migrations:
```bash
supabase db reset
```

4. Serve edge functions locally:
```bash
supabase functions serve
```

5. Start the dev server:
```bash
npm run dev
```

The app will run at `http://localhost:5173` and use the local Supabase instance.

## Deploying to Production

### Deploy Edge Functions
```bash
supabase functions deploy hello-world
supabase functions deploy test-cors
supabase functions deploy db-ops
supabase functions deploy generate-upload-url
```

### Push Migrations
```bash
supabase db push
```

### Switch to Production
To test against your production Supabase instance, rename `.env.local` to disable local configuration:
```bash
mv .env.local .env.local.backup
```

Then restart your dev server. The app will now use the production Supabase URL from `.env`.

To switch back to local:
```bash
mv .env.local.backup .env.local
```

## CORS Issue Discovery

During development, we discovered that edge functions require proper CORS handling to work from browser clients:

**Problem**: The `hello-world` function initially returned a 500 error on OPTIONS preflight requests because it:
- Didn't handle OPTIONS requests
- Didn't include CORS headers
- Tried to parse JSON from empty OPTIONS request bodies

**Solution**: All edge functions now:
1. Check for OPTIONS requests and return early with CORS headers
2. Import shared CORS configuration from `_shared/cors.ts`
3. Include CORS headers in all responses

## Related Issues

This project was created to investigate [supabase-js issue #1662](https://github.com/supabase/supabase-js/issues/1662) regarding CORS with presigned upload URLs. While the issue described CORS problems with direct file uploads, we found that:
- Local and production Supabase Storage properly handle CORS for presigned URLs
- The actual CORS issues were in edge functions that didn't handle OPTIONS requests
- Proper CORS configuration in edge functions is essential for browser clients

## Tech Stack

- React 19
- TypeScript
- Vite
- Supabase (Edge Functions, Storage, Database)
- @supabase/supabase-js
