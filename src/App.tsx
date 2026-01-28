import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { supabase } from './supabaseClient'
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js'

function App() {
  const [count, setCount] = useState(0)
  const [helloWorldResponse, setHelloWorldResponse] = useState<any>(null)
  const [testCorsResponse, setTestCorsResponse] = useState<any>(null)
  const [loading, setLoading] = useState<{ helloWorld: boolean; testCors: boolean }>({
    helloWorld: false,
    testCors: false
  })

  const invokeHelloWorld = async () => {
    setLoading(prev => ({ ...prev, helloWorld: true }))
    try {
      const { data, error } = await supabase.functions.invoke('hello-world', {
        body: { name: 'React User' }
      })

      if (error) {
        if (error instanceof FunctionsHttpError) {
          const errorMessage = await error.context.json()
          console.error('Function returned an error', errorMessage)
          setHelloWorldResponse({ error: errorMessage })
        } else if (error instanceof FunctionsRelayError) {
          console.error('Relay error:', error.message)
          setHelloWorldResponse({ error: error.message })
        } else if (error instanceof FunctionsFetchError) {
          console.error('Fetch error:', error.message)
          setHelloWorldResponse({ error: error.message })
        }
      } else {
        setHelloWorldResponse(data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setHelloWorldResponse({ error: String(err) })
    } finally {
      setLoading(prev => ({ ...prev, helloWorld: false }))
    }
  }

  const invokeTestCors = async () => {
    setLoading(prev => ({ ...prev, testCors: true }))
    try {
      const { data, error } = await supabase.functions.invoke('test-cors', {
        body: { message: 'Testing CORS from React' }
      })

      if (error) {
        if (error instanceof FunctionsHttpError) {
          const errorMessage = await error.context.json()
          console.error('Function returned an error', errorMessage)
          setTestCorsResponse({ error: errorMessage })
        } else if (error instanceof FunctionsRelayError) {
          console.error('Relay error:', error.message)
          setTestCorsResponse({ error: error.message })
        } else if (error instanceof FunctionsFetchError) {
          console.error('Fetch error:', error.message)
          setTestCorsResponse({ error: error.message })
        }
      } else {
        setTestCorsResponse(data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setTestCorsResponse({ error: String(err) })
    } finally {
      setLoading(prev => ({ ...prev, testCors: false }))
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Supabase Edge Functions</h1>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>

      <div className="card">
        <h2>Edge Function Invokers</h2>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={invokeHelloWorld}
            disabled={loading.helloWorld}
          >
            {loading.helloWorld ? 'Calling...' : 'Invoke hello-world'}
          </button>
          {helloWorldResponse && (
            <pre style={{ textAlign: 'left', marginTop: '10px' }}>
              {JSON.stringify(helloWorldResponse, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <button
            onClick={invokeTestCors}
            disabled={loading.testCors}
          >
            {loading.testCors ? 'Calling...' : 'Invoke test-cors'}
          </button>
          {testCorsResponse && (
            <pre style={{ textAlign: 'left', marginTop: '10px' }}>
              {JSON.stringify(testCorsResponse, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <p className="read-the-docs">
        Click the buttons above to test your Edge Functions
      </p>
    </>
  )
}

export default App
