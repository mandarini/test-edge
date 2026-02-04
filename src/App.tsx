import { useState, useEffect } from "react";
import supaLogo from "./assets/supabase-logo-icon.svg";
import "./App.css";
import { supabase } from "./supabaseClient";
import {
  FunctionsHttpError,
  FunctionsRelayError,
  FunctionsFetchError,
} from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

import { corsHeaders, createCorsHeaders } from '@supabase/supabase-js/cors'


function App() {
  const [helloWorldResponse, setHelloWorldResponse] = useState<any>(null);
  const [testCorsResponse, setTestCorsResponse] = useState<any>(null);
  const [loading, setLoading] = useState<{
    helloWorld: boolean;
    testCors: boolean;
    dbOps: boolean;
    fileUpload: boolean;
    deleteMethod: boolean;
    httpGet: boolean;
    httpPost: boolean;
    httpPut: boolean;
    httpPatch: boolean;
    httpDelete: boolean;
    auth: boolean;
    getClaims: boolean;
  }>({
    helloWorld: false,
    testCors: false,
    dbOps: false,
    fileUpload: false,
    deleteMethod: false,
    httpGet: false,
    httpPost: false,
    httpPut: false,
    httpPatch: false,
    httpDelete: false,
    auth: false,
    getClaims: false,
  });

  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [getClaimsResponse, setGetClaimsResponse] = useState<any>(null);

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  const headers = createCorsHeaders({
    origin: "https://supa-edge-test.netlify.app",
    credentials: true,
  });

  console.log("headers", headers);

  const otherHeadersDefault = corsHeaders;
  console.log("otherHeadersDefault", otherHeadersDefault);

  const otherHeaders = createCorsHeaders({
    origin: "https://supa-edge-test.netlify.app",
    credentials: true,
  });
  console.log("otherHeaders", otherHeaders);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // DELETE method test state
  const [deleteMethodResponse, setDeleteMethodResponse] = useState<any>(null);
  const [deleteMethodId, setDeleteMethodId] = useState("");

  // All HTTP Methods test state
  const [httpMethodResponse, setHttpMethodResponse] = useState<any>(null);
  const [httpMethodTask, setHttpMethodTask] = useState("");
  const [httpMethodTodoId, setHttpMethodTodoId] = useState("");
  const [httpMethodComplete, setHttpMethodComplete] = useState(false);

  // CORS SDK Demo state
  const [corsScenario, setCorsScenario] = useState<string>("basic");
  const [corsSdkResponse, setCorsSdkResponse] = useState<any>(null);
  const [corsSdkLoading, setCorsSdkLoading] = useState(false);

  // DB Operations state
  const [dbOpsResponse, setDbOpsResponse] = useState<any>(null);
  const [todoTask, setTodoTask] = useState("");
  const [todoUserId, setTodoUserId] = useState(
    "00000000-0000-0000-0000-000000000001",
  );
  const [updateTodoId, setUpdateTodoId] = useState("");
  const [deleteTodoId, setDeleteTodoId] = useState("");
  const [todos, setTodos] = useState<any[]>([]);

  // Auth functions
  const signUp = async () => {
    if (!authEmail || !authPassword) {
      setAuthError("Please enter email and password");
      return;
    }
    setLoading((prev) => ({ ...prev, auth: true }));
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) throw error;
      setAuthError("Check your email for the confirmation link!");
    } catch (err: any) {
      setAuthError(err.message || String(err));
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  const signIn = async () => {
    if (!authEmail || !authPassword) {
      setAuthError("Please enter email and password");
      return;
    }
    setLoading((prev) => ({ ...prev, auth: true }));
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || String(err));
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  const signOut = async () => {
    setLoading((prev) => ({ ...prev, auth: true }));
    try {
      await supabase.auth.signOut();
      setGetClaimsResponse(null);
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  // Call get-claims-demo function
  const invokeGetClaims = async () => {
    setLoading((prev) => ({ ...prev, getClaims: true }));
    setGetClaimsResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("get-claims-demo", {
        method: "GET",
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          const errorMessage = await error.context.json();
          console.error("Function returned an error", errorMessage);
          setGetClaimsResponse({ error: errorMessage });
        } else if (error instanceof FunctionsRelayError) {
          console.error("Relay error:", error.message);
          setGetClaimsResponse({ error: error.message });
        } else if (error instanceof FunctionsFetchError) {
          console.error("Fetch error:", error.message);
          setGetClaimsResponse({ error: error.message });
        }
      } else {
        setGetClaimsResponse(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setGetClaimsResponse({ error: String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, getClaims: false }));
    }
  };

  const invokeHelloWorld = async () => {
    setLoading((prev) => ({ ...prev, helloWorld: true }));
    try {
      const { data, error } = await supabase.functions.invoke("hello-world", {
        body: { name: "React User" },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          const errorMessage = await error.context.json();
          console.error("Function returned an error", errorMessage);
          setHelloWorldResponse({ error: errorMessage });
        } else if (error instanceof FunctionsRelayError) {
          console.error("Relay error:", error.message);
          setHelloWorldResponse({ error: error.message });
        } else if (error instanceof FunctionsFetchError) {
          console.error("Fetch error:", error.message);
          setHelloWorldResponse({ error: error.message });
        }
      } else {
        setHelloWorldResponse(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setHelloWorldResponse({ error: String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, helloWorld: false }));
    }
  };

  const invokeTestCors = async () => {
    setLoading((prev) => ({ ...prev, testCors: true }));
    try {
      const { data, error } = await supabase.functions.invoke("test-cors", {
        body: { message: "Testing CORS from React", name: "React User" },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          const errorMessage = await error.context.json();
          console.error("Function returned an error", errorMessage);
          setTestCorsResponse({ error: errorMessage });
        } else if (error instanceof FunctionsRelayError) {
          console.error("Relay error:", error.message);
          setTestCorsResponse({ error: error.message });
        } else if (error instanceof FunctionsFetchError) {
          console.error("Fetch error:", error.message);
          setTestCorsResponse({ error: error.message });
        }
      } else {
        setTestCorsResponse(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setTestCorsResponse({ error: String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, testCors: false }));
    }
  };

  // DB Operations handlers
  const createTodo = async () => {
    if (!todoTask.trim()) {
      alert("Please enter a task");
      return;
    }

    setLoading((prev) => ({ ...prev, dbOps: true }));
    try {
      const { error } = await supabase.functions.invoke("db-ops", {
        body: {
          operation: "create",
          table: "todos",
          data: {
            task: todoTask,
            user_id: todoUserId,
          },
        },
      });

      if (error) throw error;
      setDbOpsResponse(null);
      setTodoTask("");
      await readTodos(); // Refresh list
    } catch (err) {
      console.error("Create error:", err);
      setDbOpsResponse({ error: String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, dbOps: false }));
    }
  };

  const readTodos = async () => {
    setLoading((prev) => ({ ...prev, dbOps: true }));
    try {
      const { data, error } = await supabase.functions.invoke("db-ops", {
        body: {
          operation: "read",
          table: "todos",
        },
      });

      if (error) throw error;
      setDbOpsResponse(null);
      setTodos(data.data || []);
    } catch (err) {
      console.error("Read error:", err);
      setDbOpsResponse({ error: String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, dbOps: false }));
    }
  };

  const updateTodo = async () => {
    if (!updateTodoId) {
      alert("Please enter a Todo ID");
      return;
    }

    setLoading((prev) => ({ ...prev, dbOps: true }));
    try {
      const { error } = await supabase.functions.invoke("db-ops", {
        body: {
          operation: "update",
          table: "todos",
          id: parseInt(updateTodoId),
          data: {
            is_complete: true,
          },
        },
      });

      if (error) throw error;
      setDbOpsResponse(null);
      await readTodos(); // Refresh list
    } catch (err) {
      console.error("Update error:", err);
      setDbOpsResponse({ error: String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, dbOps: false }));
    }
  };

  const deleteTodo = async () => {
    if (!deleteTodoId) {
      alert("Please enter a Todo ID");
      return;
    }

    setLoading((prev) => ({ ...prev, dbOps: true }));
    try {
      const { error } = await supabase.functions.invoke("db-ops", {
        body: {
          operation: "delete",
          table: "todos",
          id: parseInt(deleteTodoId),
        },
      });

      if (error) throw error;
      setDbOpsResponse(null);
      setDeleteTodoId("");
      await readTodos(); // Refresh list
    } catch (err) {
      console.error("Delete error:", err);
      setDbOpsResponse({ error: String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, dbOps: false }));
    }
  };

  // File upload with presigned URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadResponse(null);
      setUploadError(null);
    }
  };

  const uploadFileWithPresignedUrl = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setLoading((prev) => ({ ...prev, fileUpload: true }));
    setUploadError(null);
    setUploadResponse(null);

    try {
      // Step 1: Get presigned URL from edge function
      const { data: urlData, error: urlError } =
        await supabase.functions.invoke("generate-upload-url", {
          body: {
            fileName: selectedFile.name,
            bucketName: "test-uploads",
          },
        });

      if (urlError) {
        throw new Error(`Failed to get presigned URL: ${urlError.message}`);
      }

      console.log("Presigned URL data:", urlData);
      setUploadResponse({ step: "Got presigned URL", data: urlData });

      // Step 2: Upload file using presigned URL
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("cacheControl", "3600");

      const uploadUrl = new URL(urlData.signedUrl);

      console.log("Uploading to:", uploadUrl.toString());

      const uploadResponse = await fetch(uploadUrl.toString(), {
        method: "PUT",
        body: formData,
        headers: {
          "x-upsert": "false",
        },
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResponse.ok) {
        setUploadResponse({
          step: "Upload successful!",
          data: urlData,
          uploadResult,
        });
      } else {
        setUploadError(`Upload failed: ${JSON.stringify(uploadResult)}`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || String(err));
    } finally {
      setLoading((prev) => ({ ...prev, fileUpload: false }));
    }
  };

  // Test HTTP DELETE method
  const testDeleteMethod = async () => {
    if (!deleteMethodId) {
      alert("Please enter a Todo ID");
      return;
    }

    setLoading((prev) => ({ ...prev, deleteMethod: true }));
    setDeleteMethodResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("delete-method", {
        method: "DELETE",
        body: {
          id: parseInt(deleteMethodId),
        },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          const errorMessage = await error.context.json();
          console.error("Function returned an error", errorMessage);
          setDeleteMethodResponse({ error: errorMessage });
        } else if (error instanceof FunctionsRelayError) {
          console.error("Relay error:", error.message);
          setDeleteMethodResponse({ error: error.message });
        } else if (error instanceof FunctionsFetchError) {
          console.error("Fetch error:", error.message);
          setDeleteMethodResponse({ error: error.message });
        }
      } else {
        setDeleteMethodResponse(data);
        setDeleteMethodId("");
        // Refresh todos list if it's loaded
        if (todos.length > 0) {
          await readTodos();
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setDeleteMethodResponse({ error: String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, deleteMethod: false }));
    }
  };

  // HTTP Methods Testing Functions
  const testHttpGet = async () => {
    setLoading((prev) => ({ ...prev, httpGet: true }));
    setHttpMethodResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("all-http-methods", {
        method: "GET",
      });

      if (error) throw error;
      setHttpMethodResponse(data);
      if (data.data) {
        setTodos(data.data);
      }
    } catch (err: any) {
      console.error("GET error:", err);
      setHttpMethodResponse({ error: err.message || String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, httpGet: false }));
    }
  };

  const testHttpPost = async () => {
    if (!httpMethodTask.trim()) {
      alert("Please enter a task");
      return;
    }

    setLoading((prev) => ({ ...prev, httpPost: true }));
    setHttpMethodResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("all-http-methods", {
        method: "POST",
        body: { task: httpMethodTask },
      });

      if (error) throw error;
      setHttpMethodResponse(data);
      setHttpMethodTask("");
      if (todos.length > 0) {
        await testHttpGet(); // Refresh list
      }
    } catch (err: any) {
      console.error("POST error:", err);
      setHttpMethodResponse({ error: err.message || String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, httpPost: false }));
    }
  };

  const testHttpPut = async () => {
    if (!httpMethodTodoId) {
      alert("Please enter a Todo ID");
      return;
    }

    setLoading((prev) => ({ ...prev, httpPut: true }));
    setHttpMethodResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("all-http-methods", {
        method: "PUT",
        body: {
          id: parseInt(httpMethodTodoId),
          is_complete: httpMethodComplete,
        },
      });

      if (error) throw error;
      setHttpMethodResponse(data);
      if (todos.length > 0) {
        await testHttpGet(); // Refresh list
      }
    } catch (err: any) {
      console.error("PUT error:", err);
      setHttpMethodResponse({ error: err.message || String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, httpPut: false }));
    }
  };

  const testHttpPatch = async () => {
    if (!httpMethodTodoId) {
      alert("Please enter a Todo ID");
      return;
    }

    setLoading((prev) => ({ ...prev, httpPatch: true }));
    setHttpMethodResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("all-http-methods", {
        method: "PATCH",
        body: {
          id: parseInt(httpMethodTodoId),
          is_complete: httpMethodComplete,
        },
      });

      if (error) throw error;
      setHttpMethodResponse(data);
      if (todos.length > 0) {
        await testHttpGet(); // Refresh list
      }
    } catch (err: any) {
      console.error("PATCH error:", err);
      setHttpMethodResponse({ error: err.message || String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, httpPatch: false }));
    }
  };

  const testHttpDeleteMethod = async () => {
    if (!httpMethodTodoId) {
      alert("Please enter a Todo ID");
      return;
    }

    setLoading((prev) => ({ ...prev, httpDelete: true }));
    setHttpMethodResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("all-http-methods", {
        method: "DELETE",
        body: { id: parseInt(httpMethodTodoId) },
      });

      if (error) throw error;
      setHttpMethodResponse(data);
      setHttpMethodTodoId("");
      if (todos.length > 0) {
        await testHttpGet(); // Refresh list
      }
    } catch (err: any) {
      console.error("DELETE error:", err);
      setHttpMethodResponse({ error: err.message || String(err) });
    } finally {
      setLoading((prev) => ({ ...prev, httpDelete: false }));
    }
  };

  // CORS SDK Demo test
  const testCorsSdkScenario = async () => {
    setCorsSdkLoading(true);
    setCorsSdkResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        `cors-sdk-demo?scenario=${corsScenario}`,
        {
          method: "GET",
        }
      );

      if (error) {
        if (error instanceof FunctionsHttpError) {
          const errorMessage = await error.context.json();
          console.error("Function returned an error", errorMessage);
          setCorsSdkResponse({ error: errorMessage });
        } else if (error instanceof FunctionsRelayError) {
          console.error("Relay error:", error.message);
          setCorsSdkResponse({ error: error.message });
        } else if (error instanceof FunctionsFetchError) {
          console.error("Fetch error:", error.message);
          setCorsSdkResponse({ error: error.message });
        }
      } else {
        setCorsSdkResponse(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setCorsSdkResponse({ error: String(err) });
    } finally {
      setCorsSdkLoading(false);
    }
  };

  return (
    <>
      <div>
        <a href="https://supabase.com" target="_blank">
          <img src={supaLogo} className="logo supabase" alt="Supabase logo" />
        </a>
      </div>
      <h1>Edge Functions Playground</h1>

      <div className="card">
        <h2>🔐 Authentication & getClaims Demo</h2>
        <p style={{ fontSize: "14px", color: "#888", marginBottom: "15px" }}>
          Sign in to get a JWT token, then test the get-claims-demo Edge Function.
        </p>

        {session ? (
          <div>
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #4CAF50",
                borderRadius: "8px",
                background: "rgba(76, 175, 80, 0.1)",
              }}
            >
              <h3 style={{ color: "#4CAF50", marginTop: 0 }}>
                ✅ Signed in as: {session.user.email}
              </h3>
              <p style={{ fontSize: "12px", color: "#aaa", margin: "10px 0" }}>
                <strong>User ID:</strong> {session.user.id}
              </p>
              <button
                onClick={signOut}
                disabled={loading.auth}
                style={{ background: "#666" }}
              >
                {loading.auth ? "Signing out..." : "Sign Out"}
              </button>
            </div>

            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #9C27B0",
                borderRadius: "8px",
                background: "rgba(156, 39, 176, 0.1)",
              }}
            >
              <h3 style={{ color: "#9C27B0", marginTop: 0 }}>
                🧪 Test getClaims Function
              </h3>
              <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>
                This calls the <code>get-claims-demo</code> Edge Function which uses{" "}
                <code>supabase.auth.getClaims(token)</code> to verify your JWT and extract claims.
              </p>
              <button
                onClick={invokeGetClaims}
                disabled={loading.getClaims}
                style={{ width: "100%", padding: "12px", fontSize: "16px" }}
              >
                {loading.getClaims ? "Calling..." : "🔍 Invoke get-claims-demo"}
              </button>
            </div>

            {getClaimsResponse && (
              <div style={{ marginTop: "15px" }}>
                <h4>
                  {getClaimsResponse.error
                    ? "❌ Error Response:"
                    : "✅ Success Response:"}
                </h4>
                <pre
                  style={{
                    textAlign: "left",
                    background: getClaimsResponse.error ? "#d32f2f" : "#1a1a1a",
                    padding: "15px",
                    borderRadius: "8px",
                    maxHeight: "400px",
                    overflow: "auto",
                    fontSize: "12px",
                  }}
                >
                  {JSON.stringify(getClaimsResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: "15px",
              border: "1px solid #FF9800",
              borderRadius: "8px",
              background: "rgba(255, 152, 0, 0.1)",
            }}
          >
            <h3 style={{ color: "#FF9800", marginTop: 0 }}>
              Sign In or Sign Up
            </h3>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="email"
                placeholder="Email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  background: "#1a1a1a",
                  color: "#fff",
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  background: "#1a1a1a",
                  color: "#fff",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={signIn}
                disabled={loading.auth}
                style={{ flex: 1 }}
              >
                {loading.auth ? "Signing in..." : "Sign In"}
              </button>
              <button
                onClick={signUp}
                disabled={loading.auth}
                style={{ flex: 1, background: "#666" }}
              >
                {loading.auth ? "Signing up..." : "Sign Up"}
              </button>
            </div>
            {authError && (
              <p
                style={{
                  marginTop: "10px",
                  color: authError.includes("Check your email") ? "#4CAF50" : "#f44336",
                  fontSize: "14px",
                }}
              >
                {authError}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Edge Function Invokers</h2>

        <div style={{ marginBottom: "20px" }}>
          <button onClick={invokeHelloWorld} disabled={loading.helloWorld}>
            {loading.helloWorld ? "Calling..." : "Invoke hello-world"}
          </button>
          {helloWorldResponse && (
            <pre style={{ textAlign: "left", marginTop: "10px" }}>
              {JSON.stringify(helloWorldResponse, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <button onClick={invokeTestCors} disabled={loading.testCors}>
            {loading.testCors ? "Calling..." : "Invoke test-cors"}
          </button>
          {testCorsResponse && (
            <pre style={{ textAlign: "left", marginTop: "10px" }}>
              {JSON.stringify(testCorsResponse, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="card">
        <h2>📝 Database CRUD Operations (db-ops)</h2>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #333",
            borderRadius: "8px",
          }}
        >
          <h3>Create Todo</h3>
          <input
            type="text"
            placeholder="Enter task..."
            value={todoTask}
            onChange={(e) => setTodoTask(e.target.value)}
            style={{ width: "250px", padding: "8px", marginRight: "10px" }}
          />
          <input
            type="text"
            placeholder="User ID"
            value={todoUserId}
            onChange={(e) => setTodoUserId(e.target.value)}
            style={{ width: "100px", padding: "8px", marginRight: "10px" }}
          />
          <button onClick={createTodo} disabled={loading.dbOps}>
            {loading.dbOps ? "Creating..." : "Create Todo"}
          </button>
        </div>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #333",
            borderRadius: "8px",
          }}
        >
          <h3>Read Todos</h3>
          <button onClick={readTodos} disabled={loading.dbOps}>
            {loading.dbOps ? "Loading..." : "Get All Todos"}
          </button>
          {todos.length > 0 && (
            <div style={{ marginTop: "10px", textAlign: "left" }}>
              <h4>Todos List:</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {todos.map((todo: any) => (
                  <li
                    key={todo.id}
                    style={{
                      padding: "8px",
                      margin: "5px 0",
                      background: "#1a1a1a",
                      borderRadius: "4px",
                      textDecoration: todo.is_complete
                        ? "line-through"
                        : "none",
                    }}
                  >
                    <strong>ID {todo.id}:</strong> {todo.task}
                    {todo.is_complete && " ✅"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #333",
            borderRadius: "8px",
          }}
        >
          <h3>Update Todo (Mark Complete)</h3>
          <input
            type="number"
            placeholder="Todo ID"
            value={updateTodoId}
            onChange={(e) => setUpdateTodoId(e.target.value)}
            style={{ width: "100px", padding: "8px", marginRight: "10px" }}
          />
          <button onClick={updateTodo} disabled={loading.dbOps}>
            {loading.dbOps ? "Updating..." : "Mark Complete"}
          </button>
        </div>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #333",
            borderRadius: "8px",
          }}
        >
          <h3>Delete Todo</h3>
          <input
            type="number"
            placeholder="Todo ID"
            value={deleteTodoId}
            onChange={(e) => setDeleteTodoId(e.target.value)}
            style={{ width: "100px", padding: "8px", marginRight: "10px" }}
          />
          <button
            onClick={deleteTodo}
            disabled={loading.dbOps}
            style={{ background: "#d32f2f" }}
          >
            {loading.dbOps ? "Deleting..." : "Delete Todo"}
          </button>
        </div>

        {dbOpsResponse?.error && (
          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              background: "#d32f2f",
              borderRadius: "8px",
            }}
          >
            <h4>❌ DB Operation Error:</h4>
            <pre
              style={{
                textAlign: "left",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {dbOpsResponse.error}
            </pre>
          </div>
        )}
      </div>

      <div className="card">
        <h2>📤 File Upload with Presigned URL</h2>
        <p style={{ fontSize: "14px", color: "#888", marginBottom: "15px" }}>
          Upload files directly to Supabase Storage using presigned URLs.
        </p>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #333",
            borderRadius: "8px",
          }}
        >
          <input
            type="file"
            onChange={handleFileChange}
            style={{ marginBottom: "10px" }}
          />
          {selectedFile && (
            <p style={{ fontSize: "14px", color: "#666" }}>
              Selected: {selectedFile.name} (
              {(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
          <button
            onClick={uploadFileWithPresignedUrl}
            disabled={!selectedFile || loading.fileUpload}
            style={{ marginTop: "10px" }}
          >
            {loading.fileUpload ? "Uploading..." : "Upload with Presigned URL"}
          </button>
        </div>

        {uploadError && (
          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              background: "#d32f2f",
              borderRadius: "8px",
            }}
          >
            <h4>❌ Upload Error:</h4>
            <pre
              style={{
                textAlign: "left",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {uploadError}
            </pre>
          </div>
        )}

        {uploadResponse && (
          <div style={{ marginTop: "15px" }}>
            <h4>✅ Response:</h4>
            <pre
              style={{
                textAlign: "left",
                background: "#1a1a1a",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              {JSON.stringify(uploadResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="card">
        <h2>🔬 HTTP DELETE Method Test</h2>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #FF9800",
            borderRadius: "8px",
            background: "rgba(255, 152, 0, 0.1)",
          }}
        >
          <h3 style={{ color: "#FF9800", marginTop: 0 }}>
            🔧 HTTP DELETE Method (New Approach)
          </h3>
          <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "10px" }}>
            <strong>How it works:</strong> Uses actual HTTP DELETE method to delete a todo from the database
            <br />
            <strong>CORS requirement:</strong> Requires
            Access-Control-Allow-Methods header
            <br />
            <strong>Note:</strong> Load todos above to see available IDs to delete
          </p>
          <div
            style={{
              background: "#1a1a1a",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "10px",
            }}
          >
            <code style={{ fontSize: "12px", color: "#FF9800" }}>
              supabase.functions.invoke('delete-method', {"{"} method: 'DELETE', body: {"{"} id {"}"} {"}"})
            </code>
          </div>
          <input
            type="number"
            placeholder="Todo ID"
            value={deleteMethodId}
            onChange={(e) => setDeleteMethodId(e.target.value)}
            style={{ width: "120px", padding: "8px", marginRight: "10px" }}
          />
          <button onClick={testDeleteMethod} disabled={loading.deleteMethod}>
            {loading.deleteMethod ? "Deleting..." : "Delete Todo with HTTP DELETE"}
          </button>
        </div>

        {deleteMethodResponse && (
          <div style={{ marginTop: "20px" }}>
            <h4>
              {deleteMethodResponse.error
                ? "❌ Error Response:"
                : "✅ Success Response:"}
            </h4>
            <pre
              style={{
                textAlign: "left",
                background: deleteMethodResponse.error ? "#d32f2f" : "#1a1a1a",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              {JSON.stringify(deleteMethodResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="card">
        <h2>🌐 All HTTP Methods Test (Complete CORS Demonstration)</h2>
        <p style={{ fontSize: "14px", color: "#888", marginBottom: "15px" }}>
          Test all HTTP methods in one function. Shows which methods are "simple" vs "non-simple" for CORS.
        </p>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #4CAF50",
            borderRadius: "8px",
            background: "rgba(76, 175, 80, 0.1)",
          }}
        >
          <h3 style={{ color: "#4CAF50", marginTop: 0 }}>
            ✅ Simple Methods (No Access-Control-Allow-Methods needed)
          </h3>

          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ marginBottom: "8px" }}>GET - Read All Todos</h4>
            <p style={{ fontSize: "12px", color: "#aaa", margin: "5px 0" }}>
              GET is a simple HTTP method that doesn't trigger CORS preflight
            </p>
            <button onClick={testHttpGet} disabled={loading.httpGet}>
              {loading.httpGet ? "Loading..." : "🔍 Test GET Method"}
            </button>
          </div>

          <div>
            <h4 style={{ marginBottom: "8px" }}>POST - Create New Todo</h4>
            <p style={{ fontSize: "12px", color: "#aaa", margin: "5px 0" }}>
              POST is a simple HTTP method (with certain content types)
            </p>
            <input
              type="text"
              placeholder="Task name..."
              value={httpMethodTask}
              onChange={(e) => setHttpMethodTask(e.target.value)}
              style={{ width: "200px", padding: "8px", marginRight: "10px" }}
            />
            <button onClick={testHttpPost} disabled={loading.httpPost}>
              {loading.httpPost ? "Creating..." : "➕ Test POST Method"}
            </button>
          </div>
        </div>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #FF9800",
            borderRadius: "8px",
            background: "rgba(255, 152, 0, 0.1)",
          }}
        >
          <h3 style={{ color: "#FF9800", marginTop: 0 }}>
            ⚠️ Non-Simple Methods (REQUIRE Access-Control-Allow-Methods)
          </h3>
          <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "15px" }}>
            These methods trigger CORS preflight and require the <code>Access-Control-Allow-Methods</code> header!
          </p>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              <strong>Todo ID to modify:</strong>
            </label>
            <input
              type="number"
              placeholder="Enter Todo ID"
              value={httpMethodTodoId}
              onChange={(e) => setHttpMethodTodoId(e.target.value)}
              style={{ width: "150px", padding: "8px", marginRight: "10px" }}
            />
            <label style={{ marginLeft: "10px" }}>
              <input
                type="checkbox"
                checked={httpMethodComplete}
                onChange={(e) => setHttpMethodComplete(e.target.checked)}
                style={{ marginRight: "5px" }}
              />
              Mark as complete
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={testHttpPut}
              disabled={loading.httpPut}
              style={{ background: "#FF9800" }}
            >
              {loading.httpPut ? "Updating..." : "🔄 Test PUT Method"}
            </button>

            <button
              onClick={testHttpPatch}
              disabled={loading.httpPatch}
              style={{ background: "#FF9800" }}
            >
              {loading.httpPatch ? "Patching..." : "📝 Test PATCH Method"}
            </button>

            <button
              onClick={testHttpDeleteMethod}
              disabled={loading.httpDelete}
              style={{ background: "#f44336" }}
            >
              {loading.httpDelete ? "Deleting..." : "🗑️ Test DELETE Method"}
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "15px",
            border: "1px solid #2196F3",
            borderRadius: "8px",
            background: "rgba(33, 150, 243, 0.1)",
          }}
        >
          <h4 style={{ color: "#2196F3", marginTop: 0 }}>
            📚 CORS Classification
          </h4>
          <div style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.8" }}>
            <p>
              <strong>Simple Methods (work with basic CORS):</strong>
              <br />
              • GET, HEAD, POST (with simple content-types)
              <br />
              • Don't require <code>Access-Control-Allow-Methods</code> header
            </p>
            <p>
              <strong>Non-Simple Methods (require full CORS):</strong>
              <br />
              • PUT, PATCH, DELETE, and custom methods
              <br />
              • MUST have <code>Access-Control-Allow-Methods</code> in preflight response
              <br />
              • Browser will block these requests without proper CORS headers!
            </p>
          </div>
        </div>

        {httpMethodResponse && (
          <div style={{ marginTop: "20px" }}>
            <h4>
              {httpMethodResponse.error
                ? "❌ Error Response:"
                : "✅ Success Response:"}
            </h4>
            <pre
              style={{
                textAlign: "left",
                background: httpMethodResponse.error ? "#d32f2f" : "#1a1a1a",
                padding: "15px",
                borderRadius: "8px",
                maxHeight: "400px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(httpMethodResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="card">
        <h2>🎯 CORS SDK Demo - All Scenarios</h2>
        <p style={{ fontSize: "14px", color: "#888", marginBottom: "15px" }}>
          Test the new @supabase/supabase-js/cors module with different configurations.
          This demonstrates how the SDK automatically includes all required CORS headers.
        </p>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #9C27B0",
            borderRadius: "8px",
            background: "rgba(156, 39, 176, 0.1)",
          }}
        >
          <h3 style={{ color: "#9C27B0", marginTop: 0 }}>
            Select CORS Scenario
          </h3>

          <div style={{ marginBottom: "15px" }}>
            <select
              value={corsScenario}
              onChange={(e) => setCorsScenario(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "14px",
                borderRadius: "4px",
                border: "1px solid #555",
                background: "#1a1a1a",
                color: "#fff",
              }}
            >
              <option value="basic">Basic - Wildcard origin (*)</option>
              <option value="custom-origin">Custom Origin - Specific domain</option>
              <option value="with-credentials">With Credentials - Cookies & auth headers</option>
              <option value="additional-headers">Additional Headers - Custom headers & methods</option>
              <option value="multiple-origins">Multiple Origins - Allowlist validation</option>
            </select>
          </div>

          <div
            style={{
              background: "#1a1a1a",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              fontSize: "12px",
              color: "#aaa",
            }}
          >
            <strong>Scenario Description:</strong>
            <br />
            {corsScenario === "basic" && (
              <>
                Uses default <code>corsHeaders</code> - allows any origin with all Supabase SDK headers.
              </>
            )}
            {corsScenario === "custom-origin" && (
              <>
                Uses <code>createCorsHeaders()</code> to restrict access to a specific origin (https://myapp.com).
              </>
            )}
            {corsScenario === "with-credentials" && (
              <>
                Enables credentials with <code>createCorsHeaders({"{"}origin: 'https://myapp.com', credentials: true{"}"})</code>.
              </>
            )}
            {corsScenario === "additional-headers" && (
              <>
                Adds custom headers beyond Supabase defaults: x-custom-header, x-api-version, x-request-id.
              </>
            )}
            {corsScenario === "multiple-origins" && (
              <>
                Validates request origin against an allowlist and returns specific origin for credentials support.
              </>
            )}
          </div>

          <button
            onClick={testCorsSdkScenario}
            disabled={corsSdkLoading}
            style={{ width: "100%", padding: "12px", fontSize: "16px" }}
          >
            {corsSdkLoading ? "Testing..." : `🧪 Test ${corsScenario} Scenario`}
          </button>
        </div>

        {corsSdkResponse && (
          <div style={{ marginTop: "20px" }}>
            <h4>
              {corsSdkResponse.error
                ? "❌ Error Response:"
                : "✅ Success Response:"}
            </h4>
            <pre
              style={{
                textAlign: "left",
                background: corsSdkResponse.error ? "#d32f2f" : "#1a1a1a",
                padding: "15px",
                borderRadius: "8px",
                maxHeight: "500px",
                overflow: "auto",
                fontSize: "12px",
              }}
            >
              {JSON.stringify(corsSdkResponse, null, 2)}
            </pre>
          </div>
        )}

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #2196F3",
            borderRadius: "8px",
            background: "rgba(33, 150, 243, 0.1)",
          }}
        >
          <h4 style={{ color: "#2196F3", marginTop: 0 }}>
            📚 About @supabase/supabase-js/cors
          </h4>
          <div style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.8" }}>
            <p>
              <strong>What it does:</strong>
              <br />
              Automatically includes all headers sent by Supabase client libraries (authorization, x-client-info, apikey, etc.)
              and stays synchronized with SDK updates.
            </p>
            <p>
              <strong>Usage in your code:</strong>
              <br />
              <code style={{ color: "#9C27B0" }}>
                import {"{"}corsHeaders, createCorsHeaders{"}"} from '@supabase/supabase-js/cors'
              </code>
            </p>
            <p>
              <strong>Benefits:</strong>
              <br />
              • No more manual CORS header maintenance
              <br />
              • Automatically updated when SDK adds new headers
              <br />
              • Prevents CORS errors in Edge Functions
              <br />
              • Type-safe with TypeScript support
            </p>
          </div>
        </div>
      </div>

      <p className="read-the-docs">
        Click the buttons above to test your Edge Functions and Database
        Operations
      </p>
    </>
  );
}

export default App;
