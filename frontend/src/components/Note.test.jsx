import { render, screen } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
    const note = {
        content: 'Component testing',
        important: true
    }

    render(<Note note={note} />)

    // screen.debug() -> print the HTML of components in terminal

    const element = screen.getByText('Component testing')

    screen.debug(element)

    expect(element).toBeDefined()
})