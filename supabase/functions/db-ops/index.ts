import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface CreateOperation {
  operation: "create";
  table: "todos" | "countries" | "messages";
  data: any;
}

interface ReadOperation {
  operation: "read";
  table: "todos" | "countries" | "messages";
  filters?: Record<string, any>;
}

interface UpdateOperation {
  operation: "update";
  table: "todos" | "countries" | "messages";
  id: number | string;
  data: any;
}

interface DeleteOperation {
  operation: "delete";
  table: "todos" | "countries" | "messages";
  id: number | string;
}

type DbOperation = CreateOperation | ReadOperation | UpdateOperation | DeleteOperation;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with user's auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Parse request body
    const body: DbOperation = await req.json();

    if (!body.operation) {
      return new Response(
        JSON.stringify({ error: "Missing 'operation' field" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Route to appropriate operation
    let result;
    switch (body.operation) {
      case "create":
        result = await handleCreate(supabase, body);
        break;
      case "read":
        result = await handleRead(supabase, body);
        break;
      case "update":
        result = await handleUpdate(supabase, body);
        break;
      case "delete":
        result = await handleDelete(supabase, body);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${(body as any).operation}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleCreate(supabase: any, operation: CreateOperation) {
  if (!operation.table) {
    throw new Error("Missing 'table' field");
  }
  if (!operation.data) {
    throw new Error("Missing 'data' field");
  }

  const { data, error } = await supabase
    .from(operation.table)
    .insert(operation.data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
}

async function handleRead(supabase: any, operation: ReadOperation) {
  if (!operation.table) {
    throw new Error("Missing 'table' field");
  }

  let query = supabase.from(operation.table).select("*");

  // Apply filters if provided
  if (operation.filters) {
    for (const [key, value] of Object.entries(operation.filters)) {
      query = query.eq(key, value);
    }
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return { success: true, data };
}

async function handleUpdate(supabase: any, operation: UpdateOperation) {
  if (!operation.table) {
    throw new Error("Missing 'table' field");
  }
  if (operation.id === undefined) {
    throw new Error("Missing 'id' field");
  }
  if (!operation.data) {
    throw new Error("Missing 'data' field");
  }

  const { data, error } = await supabase
    .from(operation.table)
    .update(operation.data)
    .eq("id", operation.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
}

async function handleDelete(supabase: any, operation: DeleteOperation) {
  if (!operation.table) {
    throw new Error("Missing 'table' field");
  }
  if (operation.id === undefined) {
    throw new Error("Missing 'id' field");
  }

  const { data, error } = await supabase
    .from(operation.table)
    .delete()
    .eq("id", operation.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  CREATE:
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/db-ops' \
    --header 'Authorization: Bearer [ANON_KEY]' \
    --header 'Content-Type: application/json' \
    --data '{"operation":"create","table":"todos","data":{"task":"Test task","user_id":"test-user-123"}}'

  READ:
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/db-ops' \
    --header 'Authorization: Bearer [ANON_KEY]' \
    --header 'Content-Type: application/json' \
    --data '{"operation":"read","table":"todos"}'

  UPDATE:
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/db-ops' \
    --header 'Authorization: Bearer [ANON_KEY]' \
    --header 'Content-Type: application/json' \
    --data '{"operation":"update","table":"todos","id":1,"data":{"is_complete":true}}'

  DELETE:
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/db-ops' \
    --header 'Authorization: Bearer [ANON_KEY]' \
    --header 'Content-Type: application/json' \
    --data '{"operation":"delete","table":"todos","id":1}'

*/
