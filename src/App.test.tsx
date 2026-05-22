import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Cine Studio workspace', () => {
  it('renders the local MVP shell', async () => {
    render(<App />)

    expect(screen.getByText('Cine Studio')).toBeInTheDocument()
    expect(screen.getByText('AI Script Writer')).toBeInTheDocument()
    expect(screen.getByText('Media Bin')).toBeInTheDocument()
    expect(screen.getByText('Omniclip Timeline Bridge')).toBeInTheDocument()
  })
})
