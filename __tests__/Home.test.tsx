import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mocking components that might cause issues in jsdom or require complex setup
jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}))

describe('Home Page', () => {
  it('renders the main landing titles', () => {
    render(<Home />)
    
    // Check for main headline parts
    expect(screen.getByText(/Play\. Win\./i)).toBeInTheDocument()
    
    // Use getAllByText as "Give Back" appears in both headline and footer
    const giveBackElements = screen.getAllByText(/Give Back\./i)
    expect(giveBackElements.length).toBeGreaterThan(0)
  })

  it('renders a "Get Started" link', () => {
    render(<Home />)
    
    const getStartedLink = screen.getByRole('link', { name: /get started/i })
    expect(getStartedLink).toBeInTheDocument()
    expect(getStartedLink).toHaveAttribute('href', '/signup')
  })
})
