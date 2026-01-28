# Edge Functions Playground

A React + TypeScript + Vite application demonstrating various Supabase Edge Functions patterns, including database operations, file uploads with presigned URLs, and CORS handling.

## Features

This playground demonstrates:

- **Edge Function Invocations**: Call Supabase Edge Functions from a React frontend
- **Database CRUD Operations**: Create, Read, Update, and Delete operations through edge functions
- **File Uploads**: Upload files to Supabase Storage using presigned URLs
- **CORS Configuration**: Proper handling of CORS preflight requests in edge functions
- **HTTP DELETE Method**: Demonstrates the fix for GitHub Issue #1466 - using actual HTTP DELETE with proper CORS headers

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

### 5. `delete-method`
Demonstrates using actual HTTP DELETE method with proper CORS configuration. This function showcases the fix for [GitHub Issue #1466](https://github.com/supabase/supabase-js/issues/1466) where DELETE requests failed due to missing `Access-Control-Allow-Methods` header.

### 6. `all-http-methods`
Comprehensive demonstration of all HTTP methods (GET, POST, PUT, PATCH, DELETE) in a single function. Shows the difference between "simple" methods (GET, POST) that don't require `Access-Control-Allow-Methods` and "non-simple" methods (PUT, PATCH, DELETE) that require it for CORS preflight to succeed.

## Project Structure

```
├── src/
│   ├── App.tsx              # Main UI with all feature demos
│   ├── supabaseClient.ts    # Supabase client configuration
│   └── ...
├── supabase/
│   ├── functions/
│   │   ├── _shared/
│   │   │   └── cors.ts      # Shared CORS configuration with Access-Control-Allow-Methods
│   │   ├── hello-world/
│   │   ├── test-cors/
│   │   ├── db-ops/
│   │   ├── generate-upload-url/
│   │   ├── delete-method/       # HTTP DELETE method demo (Issue #1466 fix)
│   │   └── all-http-methods/    # Complete HTTP methods CORS demonstration
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
supabase functions deploy delete-method
supabase functions deploy all-http-methods
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

## HTTP DELETE Method & GitHub Issue #1466

This project also demonstrates the fix for [GitHub Issue #1466](https://github.com/supabase/supabase-js/issues/1466), where users reported CORS errors when using actual HTTP DELETE methods with Supabase Edge Functions.

**Root Cause**: The `Access-Control-Allow-Methods` header was missing from CORS configuration. This header is required for "non-simple" HTTP methods like DELETE, PUT, and PATCH.

**The Fix**: Updated `supabase/functions/_shared/cors.ts` to include:
```typescript
'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
```

**Two Valid Approaches**:
1. **POST with operation type** (simpler CORS) - Used in `db-ops` function
2. **Actual HTTP DELETE method** (more RESTful) - Demonstrated in `delete-method` function

Both approaches work, but they have different CORS requirements. See `DELETE-CORS-FIX.md` for a comprehensive explanation.

**Complete HTTP Methods Testing**: The `all-http-methods` function provides a comprehensive demonstration of all HTTP methods:
- **Simple methods** (GET, POST): Work with basic CORS headers
- **Non-simple methods** (PUT, PATCH, DELETE): Require `Access-Control-Allow-Methods` header

This clearly shows why the CORS fix is necessary for non-simple methods.

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
