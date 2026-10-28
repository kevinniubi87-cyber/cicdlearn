import { useState, useEffect } from 'react'

function App() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    fetch('/todos')
      .then(res => res.json())
      .then(setTodos)
  }, [])

  const addTodo = async () => {
    if (!input.trim()) return
    const res = await fetch('/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input }),
    })
    const todo = await res.json()
    setTodos([...todos, todo])
    setInput('')
  }

  const toggleTodo = async (id, completed) => {
    const res = await fetch(`/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    })
    const updated = await res.json()
    setTodos(todos.map(t => t.id === id ? updated : t))
  }

  const deleteTodo = async (id) => {
    await fetch(`/todos/${id}`, { method: 'DELETE' })
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Todo App</h1>
      <div>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务..."
          style={{ padding: '8px', width: '80%' }}
        />
        <button onClick={addTodo} style={{ padding: '8px 16px', marginLeft: 8 }}>
          添加
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id, todo.completed)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', flex: 1 }}>
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
