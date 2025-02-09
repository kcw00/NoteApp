import { render, screen } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
    const note = {
        content: 'Component testing',
        important: true
    }

    render(<Note note={note} />)

    const element = screen.getByText('Component testing')
    expect(element).toBeDefined()
})