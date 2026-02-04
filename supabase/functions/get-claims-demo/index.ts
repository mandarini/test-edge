// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

// Create Supabase client using environment variables
// Note: SB_PUBLISHABLE_KEY needs to be manually exposed as a secret with the SB_ prefix
// until these keys are made available by default
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SB_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!
)

console.log("getClaims demo function loaded!")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Extract the JWT token from the Authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return Response.json(
        { error: "Missing Authorization header" },
        { status: 401, headers: corsHeaders }
      )
    }

    const token = authHeader.replace("Bearer ", "")

    // Verify the JWT and get claims using getClaims
    const { data, error } = await supabase.auth.getClaims(token)

    if (error) {
      console.error("JWT verification failed:", error.message)
      return Response.json(
        { error: "Invalid JWT", details: error.message },
        { status: 401, headers: corsHeaders }
      )
    }

    // Extract user information from claims
    const claims = data?.claims
    const userEmail = claims?.email
    const userId = claims?.sub
    const userRole = claims?.role

    if (!claims) {
      return Response.json(
        { error: "No claims found in token" },
        { status: 401, headers: corsHeaders }
      )
    }

    // Return user information from the verified JWT
    return Response.json(
      {
        message: `Hello ${userEmail || "user"}!`,
        user: {
          id: userId,
          email: userEmail,
          role: userRole,
        },
        claims: claims,
      },
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Unexpected error:", err)
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request with a valid JWT:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/get-claims-demo' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json'

  To get a valid JWT, you can sign in a user and use their access_token.

*/
