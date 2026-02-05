// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "@supabase/supabase-js/cors";

console.log("CORS SDK Demo Function");

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const scenario = url.searchParams.get("scenario") || "basic";

  // Handle different CORS scenarios based on query parameter
  switch (scenario) {
    case "basic":
      return handleBasicCors(req);

    default:
      return new Response(
        JSON.stringify({
          error: "Invalid scenario",
          available_scenarios: [
            "basic",
            "custom-origin",
            "with-credentials",
            "additional-headers",
            "multiple-origins",
          ],
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
  }
});

/**
 * Scenario 1: Basic CORS with wildcard origin
 * Uses the default corsHeaders exported from the SDK
 */
function handleBasicCors(req: Request): Response {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      scenario: "basic",
      description: "Default CORS headers with wildcard origin (*)",
      headers: corsHeaders,
      message: "This allows requests from any origin",
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    },
  );
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
