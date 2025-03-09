import PropTypes from 'prop-types'
import { useState } from 'react'

const NoteForm = ({ createNote }) => {
    const [newNote, setNewNote] = useState('')

    const handleChange = (event) => {
        setNewNote(event.target.value)
    }

    const addNote = (event) => {
        event.preventDefault()
        createNote({
            content: newNote,
            important: false
        })

        setNewNote('')
    }
    return (
        <div className="formDiv">

            <form onSubmit={addNote}>
                <input
                    value={newNote}
                    onChange={handleChange}
                    placeholder='write note content here'
                    id='note-input'
                />
                <button type="submit">save</button>
            </form>
        </div>
    )
}

NoteForm.propTypes = {
    createNote: PropTypes.func.isRequired,
}

export default NoteForm