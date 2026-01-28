# GitHub Issue #1466 - DELETE CORS Errors: Root Cause and Fix

## 🔍 The Problem

When using actual HTTP DELETE methods with Supabase Edge Functions, users encounter CORS errors:

```
Access to fetch at 'https://[project].supabase.co/functions/v1/delete-self' from origin 'https://[app].com'
has been blocked by CORS policy: Method DELETE is not allowed by Access-Control-Allow-Methods in preflight response.
```

## 🎯 Root Cause

The issue is a **missing CORS header** required for non-simple HTTP methods.

### CORS Method Classification

**Simple Methods** (no preflight required):
- GET
- HEAD
- POST (with certain content types)

**Non-Simple Methods** (preflight required):
- DELETE ❌
- PUT ❌
- PATCH ❌
- Custom methods ❌

### What Happens with DELETE

1. Browser sees DELETE request → triggers CORS preflight
2. Browser sends: `OPTIONS /functions/v1/your-function`
3. Browser expects these headers in response:
   - ✅ `Access-Control-Allow-Origin`
   - ✅ `Access-Control-Allow-Headers`
   - ❌ `Access-Control-Allow-Methods` ← **THIS IS MISSING!**
4. Browser rejects: "Method DELETE is not allowed"
5. Actual DELETE request never happens

## 🔧 The Fix

### Before (Incomplete CORS - Causes DELETE to fail)

```typescript
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  // Missing: Access-Control-Allow-Methods
}
```

### After (Complete CORS - DELETE works!)

```typescript
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', // ← ADDED THIS
}
```

## 📊 Two Valid Approaches

### Approach 1: POST with Operation Type (Simpler CORS)

**How it works:**
```typescript
// Client
supabase.functions.invoke('db-ops', {
  // method defaults to POST
  body: {
    operation: 'delete',
    table: 'todos',
    id: 123
  }
})

// Server
const { operation } = await req.json()
switch (operation) {
  case 'delete':
    // handle delete
    break
}
```

**Pros:**
- ✅ Works with basic CORS headers (no `Access-Control-Allow-Methods` needed)
- ✅ Single endpoint handles all CRUD operations
- ✅ Simpler CORS configuration

**Cons:**
- ❌ Less RESTful (HTTP method doesn't match operation intent)
- ❌ Must parse body to determine operation

### Approach 2: Actual HTTP DELETE Method (More RESTful)

**How it works:**
```typescript
// Client
supabase.functions.invoke('delete-self', {
  method: 'DELETE',
  body: { id: 123 }
})

// Server
if (req.method !== 'DELETE') {
  return new Response('Method not allowed', { status: 405 })
}
// handle DELETE logic
```

**Pros:**
- ✅ Semantically correct (DELETE method for delete operations)
- ✅ Better HTTP semantics
- ✅ Clearer API design

**Cons:**
- ❌ Requires `Access-Control-Allow-Methods` header
- ❌ More complex CORS configuration

## 🧪 Testing the Fix

### 1. Start Supabase Functions Locally

```bash
supabase start
# or just functions:
supabase functions serve
```

### 2. Test with React App

Start the development server:
```bash
npm run dev
```

Open the app at `http://localhost:5173` and test:

1. **HTTP DELETE Method Test** section - Shows the specific DELETE method implementation
2. **All HTTP Methods Test** section - Comprehensive testing of all HTTP methods:
   - ✅ Simple methods (GET, POST) - Work with basic CORS
   - ⚠️ Non-simple methods (PUT, PATCH, DELETE) - Require `Access-Control-Allow-Methods`

This clearly demonstrates why the CORS header is needed for non-simple methods.

### 3. Test with curl

```bash
# Test OPTIONS preflight
curl -i --request OPTIONS 'http://127.0.0.1:54321/functions/v1/delete-method' \
  --header 'Access-Control-Request-Method: DELETE'

# Should return Access-Control-Allow-Methods header including DELETE

# Test actual DELETE
curl -i --request DELETE 'http://127.0.0.1:54321/functions/v1/delete-method' \
  --header 'Authorization: Bearer eyJhbGc...' \
  --header 'Content-Type: application/json' \
  --data '{"id": 123}'
```

### 4. Test with supabase-js

```javascript
const { data, error } = await supabase.functions.invoke('delete-method', {
  method: 'DELETE',
  body: { id: 123 }
})

if (error) {
  console.error('Failed:', error)
} else {
  console.log('Success:', data)
}
```

## 📝 Implementation Examples

### Comprehensive HTTP Methods Function

See: `supabase/functions/all-http-methods/index.ts`

This single function handles all HTTP methods and clearly demonstrates the CORS requirements for each:

- **GET**: Simple method - retrieves all todos
- **POST**: Simple method - creates a new todo
- **PUT**: Non-simple method - updates a todo (requires Access-Control-Allow-Methods)
- **PATCH**: Non-simple method - partially updates a todo (requires Access-Control-Allow-Methods)
- **DELETE**: Non-simple method - deletes a todo (requires Access-Control-Allow-Methods)

Each response includes the method type classification to show which methods need the additional CORS header.

### Complete Edge Function with DELETE Support

See: `supabase/functions/delete-method/index.ts`

Key points:
1. Import shared CORS headers
2. Handle OPTIONS preflight
3. Validate HTTP method
4. Return CORS headers in all responses (success and error)

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Validate method
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    })
  }

  // Handle DELETE logic
  try {
    const body = await req.json()

    // Your delete logic here

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
```

## 🚀 Deploying the Fix

### 1. Update CORS Headers

```bash
# Edit supabase/functions/_shared/cors.ts
# Add Access-Control-Allow-Methods header
```

### 2. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy delete-method
```

### 3. Verify in Production

Use browser DevTools Network tab to check preflight response includes:
```
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

## 🎓 Key Takeaways

1. **POST vs DELETE**: POST is "simple" and doesn't need `Access-Control-Allow-Methods`, but DELETE does
2. **Required for non-simple methods**: DELETE, PUT, PATCH all need the `Access-Control-Allow-Methods` header
3. **Both approaches are valid**: Choose based on your preference for simplicity vs REST semantics
4. **Always handle OPTIONS**: CORS preflight requires proper OPTIONS handler
5. **Return CORS headers everywhere**: Include in success responses, error responses, and OPTIONS responses

## 📚 Additional Resources

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN: Simple Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [GitHub Issue #1466](https://github.com/supabase/supabase-js/issues/1466)

## ✅ Verification Checklist

- [ ] Updated `_shared/cors.ts` with `Access-Control-Allow-Methods`
- [ ] Tested OPTIONS preflight returns correct headers
- [ ] Tested DELETE request succeeds
- [ ] Verified in browser DevTools Network tab
- [ ] Tested in production environment
- [ ] Updated any existing functions that use non-simple methods

---

**Issue Status:** ✅ RESOLVED

The root cause was a missing `Access-Control-Allow-Methods` header in the CORS configuration. This header is required for non-simple HTTP methods like DELETE to pass the browser's CORS preflight check.
