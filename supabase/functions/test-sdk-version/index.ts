import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

console.log("SDK Version Test Function");

Deno.serve(async (req) => {
  try {
    // Test 1: Import works
    const importTest = {
      success: true,
      message: "@supabase/supabase-js imported successfully",
    };

    // Test 2: Create client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseKey);

    const clientTest = {
      success: true,
      message: "Supabase client created successfully",
      hasClient: !!supabase,
    };

    // Test 3: Check version info
    // Try to extract version from package (if available)
    let versionInfo = "Version info not directly available in client";
    try {
      // @ts-ignore - checking for version property
      if (supabase.constructor?.version) {
        // @ts-ignore
        versionInfo = supabase.constructor.version;
      }
    } catch (e) {
      // Version not available, that's ok
    }

    // Test 4: Simple functionality test (auth)
    let functionalityTest;
    try {
      const { data, error } = await supabase.auth.getSession();
      functionalityTest = {
        success: !error,
        message: error ? error.message : "Auth methods callable",
        hasSession: !!data?.session,
      };
    } catch (e) {
      functionalityTest = {
        success: false,
        message: String(e),
      };
    }

    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        tests: {
          import: importTest,
          clientCreation: clientTest,
          functionality: functionalityTest,
        },
        info: {
          expectedVersion: "2.95.0",
          versionInfo,
          denoVersion: Deno.version.deno,
          importSource: "npm:@supabase/supabase-js@2.95.0",
        },
      }, null, 2),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: true,
        message: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
