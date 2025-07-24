import { render, screen } from '@testing-library/react'
import { Logo } from '../Logo'

describe('Logo', () => {
  it('renders logo with default small size', () => {
    render(<Logo />)
    
    const logo = screen.getByAltText('BOOQS')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src')
    expect(logo.getAttribute('src')).toContain('icon.png')
    expect(logo).toHaveAttribute('width', '32')
    expect(logo).toHaveAttribute('height', '32')
  })

  it('renders logo with large size', () => {
    render(<Logo size="large" />)
    
    const logo = screen.getByAltText('BOOQS')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('width', '64')
    expect(logo).toHaveAttribute('height', '64')
  })

  it('applies custom styles', () => {
    const customStyle = { opacity: 0.5 }
    render(<Logo style={customStyle} />)
    
    const logo = screen.getByAltText('BOOQS')
    expect(logo).toHaveStyle({ opacity: '0.5' })
  })
})