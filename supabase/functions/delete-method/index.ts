import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"
import { corsHeaders } from '../_shared/cors.ts'

console.log("Delete Method Function - Using HTTP DELETE")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow DELETE method
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({
      error: 'Method not allowed. Use DELETE method.'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Allow': 'DELETE, OPTIONS'
      },
      status: 405
    })
  }

  console.log('Handling DELETE request')

  try {
    // Create Supabase client with user's auth token
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Parse request body to get todo ID
    const body = await req.json()
    const todoId = body.id

    if (!todoId) {
      return new Response(
        JSON.stringify({ error: "Missing 'id' field in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    console.log(`Deleting todo with ID: ${todoId}`)

    // Delete the todo from the database
    const { data, error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.details,
          hint: error.hint,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Return success response with deleted todo data
    const response = {
      success: true,
      message: `Todo with ID ${todoId} deleted successfully using HTTP DELETE method`,
      method: req.method,
      timestamp: new Date().toISOString(),
      deletedTodo: data
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200
      }
    )
  } catch (error: any) {
    console.error('Error handling DELETE:', error)
    return new Response(
      JSON.stringify({
        error: error?.message || 'Internal server error',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase functions serve delete-method`
  2. Make an HTTP request:

  Using curl with DELETE method:
  curl -i --location --request DELETE 'http://127.0.0.1:54321/functions/v1/delete-method' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODQ5NjgxMDN9.LNd0adquHRXP5bKMcz8fxYcXxB925C-EiNRBzUTXO4lrqRjFiVNBKUvB9rWTXJyfkXphKYMVtPggQBLBzMoGIw' \
    --header 'Content-Type: application/json' \
    --data '{"id": 1}'

  Using supabase-js:
  const { data, error } = await supabase.functions.invoke('delete-method', {
    method: 'DELETE',
    body: { id: 1 }
  })

*/
