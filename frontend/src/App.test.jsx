import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

const mockTodos = [
  { id: 1, title: '学习 CI/CD', completed: false },
]

beforeEach(() => {
  global.fetch = vi.fn()
})

test('初始加载时显示 todos', async () => {
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve(mockTodos),
  })

  render(<App />)
  await waitFor(() => {
    expect(screen.getByText('学习 CI/CD')).toBeInTheDocument()
  })
})

test('可以添加新 todo', async () => {
  fetch
    .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
    .mockResolvedValueOnce({
      json: () => Promise.resolve({ id: 2, title: '新任务', completed: false }),
    })

  render(<App />)
  await waitFor(() => {})

  const input = screen.getByPlaceholderText('添加新任务...')
  fireEvent.change(input, { target: { value: '新任务' } })
  fireEvent.click(screen.getByText('添加'))

  await waitFor(() => {
    expect(screen.getByText('新任务')).toBeInTheDocument()
  })
})
