import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"
import { corsHeaders } from '../_shared/cors.ts'

console.log("All HTTP Methods Function - Demonstrating CORS with different HTTP methods")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  const method = req.method
  console.log(`Handling ${method} request`)

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

    // Classify the method for CORS purposes
    const isSimpleMethod = ['GET', 'HEAD', 'POST'].includes(method)
    const methodType = isSimpleMethod ? 'simple' : 'non-simple'

    // Handle different HTTP methods
    switch (method) {
      case 'GET': {
        // GET - Read all todos (simple method, no preflight needed)
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .order('id', { ascending: true })

        if (error) throw new Error(error.message)

        return new Response(
          JSON.stringify({
            success: true,
            method: 'GET',
            methodType: 'simple - no Access-Control-Allow-Methods needed',
            message: 'Retrieved todos using HTTP GET',
            timestamp: new Date().toISOString(),
            data: data,
            corsNote: 'GET is a simple method and works with basic CORS headers'
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        )
      }

      case 'POST': {
        // POST - Create a new todo (simple method, no preflight needed)
        const body = await req.json()

        if (!body.task) {
          return new Response(
            JSON.stringify({ error: "Missing 'task' field" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          )
        }

        const { data, error } = await supabase
          .from('todos')
          .insert({
            task: body.task,
            user_id: body.user_id || '00000000-0000-0000-0000-000000000001'
          })
          .select()
          .single()

        if (error) throw new Error(error.message)

        return new Response(
          JSON.stringify({
            success: true,
            method: 'POST',
            methodType: 'simple - no Access-Control-Allow-Methods needed',
            message: 'Created todo using HTTP POST',
            timestamp: new Date().toISOString(),
            data: data,
            corsNote: 'POST is a simple method and works with basic CORS headers'
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 201
          }
        )
      }

      case 'PUT': {
        // PUT - Update a todo (non-simple method, requires Access-Control-Allow-Methods)
        const body = await req.json()

        if (!body.id) {
          return new Response(
            JSON.stringify({ error: "Missing 'id' field" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          )
        }

        const updateData: any = {}
        if (body.task !== undefined) updateData.task = body.task
        if (body.is_complete !== undefined) updateData.is_complete = body.is_complete

        const { data, error } = await supabase
          .from('todos')
          .update(updateData)
          .eq('id', body.id)
          .select()
          .single()

        if (error) throw new Error(error.message)

        return new Response(
          JSON.stringify({
            success: true,
            method: 'PUT',
            methodType: 'non-simple - REQUIRES Access-Control-Allow-Methods',
            message: `Updated todo ${body.id} using HTTP PUT`,
            timestamp: new Date().toISOString(),
            data: data,
            corsNote: 'PUT requires Access-Control-Allow-Methods header in CORS preflight!'
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        )
      }

      case 'PATCH': {
        // PATCH - Partial update of a todo (non-simple method, requires Access-Control-Allow-Methods)
        const body = await req.json()

        if (!body.id) {
          return new Response(
            JSON.stringify({ error: "Missing 'id' field" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          )
        }

        const updateData: any = {}
        if (body.task !== undefined) updateData.task = body.task
        if (body.is_complete !== undefined) updateData.is_complete = body.is_complete

        const { data, error } = await supabase
          .from('todos')
          .update(updateData)
          .eq('id', body.id)
          .select()
          .single()

        if (error) throw new Error(error.message)

        return new Response(
          JSON.stringify({
            success: true,
            method: 'PATCH',
            methodType: 'non-simple - REQUIRES Access-Control-Allow-Methods',
            message: `Patched todo ${body.id} using HTTP PATCH`,
            timestamp: new Date().toISOString(),
            data: data,
            corsNote: 'PATCH requires Access-Control-Allow-Methods header in CORS preflight!'
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        )
      }

      case 'DELETE': {
        // DELETE - Delete a todo (non-simple method, requires Access-Control-Allow-Methods)
        const body = await req.json()

        if (!body.id) {
          return new Response(
            JSON.stringify({ error: "Missing 'id' field" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          )
        }

        const { data, error } = await supabase
          .from('todos')
          .delete()
          .eq('id', body.id)
          .select()
          .single()

        if (error) throw new Error(error.message)

        return new Response(
          JSON.stringify({
            success: true,
            method: 'DELETE',
            methodType: 'non-simple - REQUIRES Access-Control-Allow-Methods',
            message: `Deleted todo ${body.id} using HTTP DELETE`,
            timestamp: new Date().toISOString(),
            data: data,
            corsNote: 'DELETE requires Access-Control-Allow-Methods header in CORS preflight!'
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        )
      }

      default: {
        return new Response(
          JSON.stringify({
            error: `Method ${method} not supported`,
            supportedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Allow': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            },
            status: 405
          }
        )
      }
    }
  } catch (error: any) {
    console.error(`Error handling ${req.method}:`, error)
    return new Response(
      JSON.stringify({
        error: error?.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase functions serve all-http-methods`
  2. Test different HTTP methods:

  GET (simple method):
  curl -i --request GET 'http://127.0.0.1:54321/functions/v1/all-http-methods' \
    --header 'Authorization: Bearer eyJhbGc...'

  POST (simple method):
  curl -i --request POST 'http://127.0.0.1:54321/functions/v1/all-http-methods' \
    --header 'Authorization: Bearer eyJhbGc...' \
    --header 'Content-Type: application/json' \
    --data '{"task": "New todo"}'

  PUT (non-simple method - requires Access-Control-Allow-Methods):
  curl -i --request PUT 'http://127.0.0.1:54321/functions/v1/all-http-methods' \
    --header 'Authorization: Bearer eyJhbGc...' \
    --header 'Content-Type: application/json' \
    --data '{"id": 1, "is_complete": true}'

  PATCH (non-simple method - requires Access-Control-Allow-Methods):
  curl -i --request PATCH 'http://127.0.0.1:54321/functions/v1/all-http-methods' \
    --header 'Authorization: Bearer eyJhbGc...' \
    --header 'Content-Type: application/json' \
    --data '{"id": 1, "is_complete": true}'

  DELETE (non-simple method - requires Access-Control-Allow-Methods):
  curl -i --request DELETE 'http://127.0.0.1:54321/functions/v1/all-http-methods' \
    --header 'Authorization: Bearer eyJhbGc...' \
    --header 'Content-Type: application/json' \
    --data '{"id": 1}'

  Using supabase-js:

  // GET
  await supabase.functions.invoke('all-http-methods', { method: 'GET' })

  // POST
  await supabase.functions.invoke('all-http-methods', {
    method: 'POST',
    body: { task: 'New todo' }
  })

  // PUT
  await supabase.functions.invoke('all-http-methods', {
    method: 'PUT',
    body: { id: 1, is_complete: true }
  })

  // PATCH
  await supabase.functions.invoke('all-http-methods', {
    method: 'PATCH',
    body: { id: 1, is_complete: true }
  })

  // DELETE
  await supabase.functions.invoke('all-http-methods', {
    method: 'DELETE',
    body: { id: 1 }
  })

*/
