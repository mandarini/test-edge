import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { fileName, bucketName = 'test-uploads' } = await req.json();

    if (!fileName) {
      throw new Error('fileName is required');
    }

    // Generate a unique path for the file - sanitize filename to avoid spaces and special chars
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${crypto.randomUUID()}-${sanitizedFileName}`;

    // Create a signed upload URL
    const { data, error } = await supabaseClient
      .storage
      .from(bucketName)
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Error creating signed URL:', error);
      throw error;
    }

    // Fix the URL for local development - replace kong:8000 with localhost:54321
    let signedUrl = data.signedUrl;
    if (signedUrl.includes('kong:8000')) {
      signedUrl = signedUrl.replace('http://kong:8000', 'http://localhost:54321');
    }

    return new Response(
      JSON.stringify({
        signedUrl: signedUrl,
        path: data.path,
        token: data.token,
        bucketName,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-upload-url' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODQ5NjI5MDl9.b2-QgBvM9Nf8xPdFyDQDxUjW_eRlCcdBxJ8G_1TRZqc55oq0G6TubTmVf-JSW5kCN6FdYabiy77x1Oj4WdM-Dg' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
