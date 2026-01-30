// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders, createCorsHeaders } from '@supabase/supabase-js/cors'

console.log("CORS SDK Demo Function")

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const scenario = url.searchParams.get('scenario') || 'basic'

  // Handle different CORS scenarios based on query parameter
  switch (scenario) {
    case 'basic':
      return handleBasicCors(req)

    case 'custom-origin':
      return handleCustomOrigin(req)

    case 'with-credentials':
      return handleWithCredentials(req)

    case 'additional-headers':
      return handleAdditionalHeaders(req)

    case 'multiple-origins':
      return handleMultipleOrigins(req)

    default:
      return new Response(
        JSON.stringify({
          error: 'Invalid scenario',
          available_scenarios: [
            'basic',
            'custom-origin',
            'with-credentials',
            'additional-headers',
            'multiple-origins'
          ]
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
  }
})

/**
 * Scenario 1: Basic CORS with wildcard origin
 * Uses the default corsHeaders exported from the SDK
 */
function handleBasicCors(req: Request): Response {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(
    JSON.stringify({
      scenario: 'basic',
      description: 'Default CORS headers with wildcard origin (*)',
      headers: corsHeaders,
      message: 'This allows requests from any origin'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  )
}

/**
 * Scenario 2: Custom origin
 * Restricts access to a specific origin
 */
function handleCustomOrigin(req: Request): Response {
  const customCorsHeaders = createCorsHeaders({
    origin: 'https://myapp.com'
  })

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: customCorsHeaders })
  }

  return new Response(
    JSON.stringify({
      scenario: 'custom-origin',
      description: 'CORS restricted to https://myapp.com',
      headers: customCorsHeaders,
      message: 'Only requests from https://myapp.com are allowed'
    }),
    {
      headers: { ...customCorsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  )
}

/**
 * Scenario 3: With credentials
 * Allows cookies and authorization headers with a specific origin
 */
function handleWithCredentials(req: Request): Response {
  const credentialsCorsHeaders = createCorsHeaders({
    origin: 'https://myapp.com',
    credentials: true
  })

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: credentialsCorsHeaders })
  }

  return new Response(
    JSON.stringify({
      scenario: 'with-credentials',
      description: 'CORS with credentials enabled for https://myapp.com',
      headers: credentialsCorsHeaders,
      message: 'Allows cookies and authorization headers',
      note: 'Cannot use credentials with wildcard origin'
    }),
    {
      headers: { ...credentialsCorsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  )
}

/**
 * Scenario 4: Additional custom headers
 * Adds extra headers beyond the Supabase defaults
 */
function handleAdditionalHeaders(req: Request): Response {
  const extendedCorsHeaders = createCorsHeaders({
    additionalHeaders: ['x-custom-header', 'x-api-version', 'x-request-id'],
    additionalMethods: ['HEAD']
  })

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: extendedCorsHeaders })
  }

  return new Response(
    JSON.stringify({
      scenario: 'additional-headers',
      description: 'CORS with additional custom headers and methods',
      headers: extendedCorsHeaders,
      message: 'Includes custom headers and HEAD method',
      customHeaders: ['x-custom-header', 'x-api-version', 'x-request-id']
    }),
    {
      headers: {
        ...extendedCorsHeaders,
        'Content-Type': 'application/json',
        'x-custom-header': 'example-value'
      },
      status: 200
    }
  )
}

/**
 * Scenario 5: Multiple origins validation
 * Validates request origin against an allowlist
 */
function handleMultipleOrigins(req: Request): Response {
  const allowedOrigins = [
    'https://app1.com',
    'https://app2.com',
    'https://staging.myapp.com'
  ]

  const requestOrigin = req.headers.get('Origin')

  // Validate origin manually
  if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
    return new Response(
      JSON.stringify({
        error: 'Origin not allowed',
        requestedOrigin: requestOrigin,
        allowedOrigins: allowedOrigins
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 403
      }
    )
  }

  // Create CORS headers with the validated origin
  const validatedCorsHeaders = createCorsHeaders({
    origin: requestOrigin || allowedOrigins[0],
    credentials: true
  })

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: validatedCorsHeaders })
  }

  return new Response(
    JSON.stringify({
      scenario: 'multiple-origins',
      description: 'Validates origin against allowlist and returns specific origin',
      allowedOrigins: allowedOrigins,
      requestOrigin: requestOrigin,
      headers: validatedCorsHeaders,
      message: 'Origin validated successfully',
      note: 'This pattern allows multiple origins while enabling credentials'
    }),
    {
      headers: { ...validatedCorsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  )
}

/* Test the function locally:

1. Start Supabase: `supabase start`

2. Test different scenarios:

# Basic CORS
curl -i 'http://127.0.0.1:54321/functions/v1/cors-sdk-demo?scenario=basic' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \

# Custom origin
curl -i 'http://127.0.0.1:54321/functions/v1/cors-sdk-demo?scenario=custom-origin' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \


# With credentials
curl -i 'http://127.0.0.1:54321/functions/v1/cors-sdk-demo?scenario=custom-origin' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \

# Additional headers
curl -i 'http://127.0.0.1:54321/functions/v1/cors-sdk-demo?scenario=additional-headers' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \

# Multiple origins validation
curl -i 'http://127.0.0.1:54321/functions/v1/cors-sdk-demo?scenario=multiple-origins' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Origin: https://app1.com'

# Test CORS preflight (OPTIONS)
curl -i -X OPTIONS 'http://127.0.0.1:54321/functions/v1/cors-sdk-demo?scenario=basic' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Origin: https://example.com' \
  --header 'Access-Control-Request-Method: POST'

*/
