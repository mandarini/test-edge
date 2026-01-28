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
  const [loading, setLoading] = useState<{ helloWorld: boolean; testCors: boolean; dbOps: boolean }>({
    helloWorld: false,
    testCors: false,
    dbOps: false
  })

  // DB Operations state
  const [dbOpsResponse, setDbOpsResponse] = useState<any>(null)
  const [todoTask, setTodoTask] = useState('')
  const [todoUserId, setTodoUserId] = useState('user-123')
  const [updateTodoId, setUpdateTodoId] = useState('')
  const [deleteTodoId, setDeleteTodoId] = useState('')
  const [todos, setTodos] = useState<any[]>([])

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
        body: { message: 'Testing CORS from React', name: 'React User' }
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

  // DB Operations handlers
  const createTodo = async () => {
    if (!todoTask.trim()) {
      alert('Please enter a task')
      return
    }

    setLoading(prev => ({ ...prev, dbOps: true }))
    try {
      const { data, error } = await supabase.functions.invoke('db-ops', {
        body: {
          operation: 'create',
          table: 'todos',
          data: {
            task: todoTask,
            user_id: todoUserId
          }
        }
      })

      if (error) throw error
      setDbOpsResponse(data)
      setTodoTask('')
      await readTodos() // Refresh list
    } catch (err) {
      console.error('Create error:', err)
      setDbOpsResponse({ error: String(err) })
    } finally {
      setLoading(prev => ({ ...prev, dbOps: false }))
    }
  }

  const readTodos = async () => {
    setLoading(prev => ({ ...prev, dbOps: true }))
    try {
      const { data, error } = await supabase.functions.invoke('db-ops', {
        body: {
          operation: 'read',
          table: 'todos'
        }
      })

      if (error) throw error
      setDbOpsResponse(data)
      setTodos(data.data || [])
    } catch (err) {
      console.error('Read error:', err)
      setDbOpsResponse({ error: String(err) })
    } finally {
      setLoading(prev => ({ ...prev, dbOps: false }))
    }
  }

  const updateTodo = async () => {
    if (!updateTodoId) {
      alert('Please enter a Todo ID')
      return
    }

    setLoading(prev => ({ ...prev, dbOps: true }))
    try {
      const { data, error } = await supabase.functions.invoke('db-ops', {
        body: {
          operation: 'update',
          table: 'todos',
          id: parseInt(updateTodoId),
          data: {
            is_complete: true
          }
        }
      })

      if (error) throw error
      setDbOpsResponse(data)
      await readTodos() // Refresh list
    } catch (err) {
      console.error('Update error:', err)
      setDbOpsResponse({ error: String(err) })
    } finally {
      setLoading(prev => ({ ...prev, dbOps: false }))
    }
  }

  const deleteTodo = async () => {
    if (!deleteTodoId) {
      alert('Please enter a Todo ID')
      return
    }

    setLoading(prev => ({ ...prev, dbOps: true }))
    try {
      const { data, error } = await supabase.functions.invoke('db-ops', {
        body: {
          operation: 'delete',
          table: 'todos',
          id: parseInt(deleteTodoId)
        }
      })

      if (error) throw error
      setDbOpsResponse(data)
      setDeleteTodoId('')
      await readTodos() // Refresh list
    } catch (err) {
      console.error('Delete error:', err)
      setDbOpsResponse({ error: String(err) })
    } finally {
      setLoading(prev => ({ ...prev, dbOps: false }))
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

      <div className="card">
        <h2>📝 Database CRUD Operations (db-ops)</h2>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #333', borderRadius: '8px' }}>
          <h3>Create Todo</h3>
          <input
            type="text"
            placeholder="Enter task..."
            value={todoTask}
            onChange={(e) => setTodoTask(e.target.value)}
            style={{ width: '250px', padding: '8px', marginRight: '10px' }}
          />
          <input
            type="text"
            placeholder="User ID"
            value={todoUserId}
            onChange={(e) => setTodoUserId(e.target.value)}
            style={{ width: '100px', padding: '8px', marginRight: '10px' }}
          />
          <button onClick={createTodo} disabled={loading.dbOps}>
            {loading.dbOps ? 'Creating...' : 'Create Todo'}
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #333', borderRadius: '8px' }}>
          <h3>Read Todos</h3>
          <button onClick={readTodos} disabled={loading.dbOps}>
            {loading.dbOps ? 'Loading...' : 'Get All Todos'}
          </button>
          {todos.length > 0 && (
            <div style={{ marginTop: '10px', textAlign: 'left' }}>
              <h4>Todos List:</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {todos.map((todo: any) => (
                  <li key={todo.id} style={{
                    padding: '8px',
                    margin: '5px 0',
                    background: '#1a1a1a',
                    borderRadius: '4px',
                    textDecoration: todo.is_complete ? 'line-through' : 'none'
                  }}>
                    <strong>ID {todo.id}:</strong> {todo.task}
                    {todo.is_complete && ' ✅'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #333', borderRadius: '8px' }}>
          <h3>Update Todo (Mark Complete)</h3>
          <input
            type="number"
            placeholder="Todo ID"
            value={updateTodoId}
            onChange={(e) => setUpdateTodoId(e.target.value)}
            style={{ width: '100px', padding: '8px', marginRight: '10px' }}
          />
          <button onClick={updateTodo} disabled={loading.dbOps}>
            {loading.dbOps ? 'Updating...' : 'Mark Complete'}
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #333', borderRadius: '8px' }}>
          <h3>Delete Todo</h3>
          <input
            type="number"
            placeholder="Todo ID"
            value={deleteTodoId}
            onChange={(e) => setDeleteTodoId(e.target.value)}
            style={{ width: '100px', padding: '8px', marginRight: '10px' }}
          />
          <button onClick={deleteTodo} disabled={loading.dbOps} style={{ background: '#d32f2f' }}>
            {loading.dbOps ? 'Deleting...' : 'Delete Todo'}
          </button>
        </div>

        {dbOpsResponse && (
          <div style={{ marginTop: '20px' }}>
            <h4>Response:</h4>
            <pre style={{ textAlign: 'left', background: '#1a1a1a', padding: '15px', borderRadius: '8px' }}>
              {JSON.stringify(dbOpsResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <p className="read-the-docs">
        Click the buttons above to test your Edge Functions and Database Operations
      </p>
    </>
  )
}

export default App
