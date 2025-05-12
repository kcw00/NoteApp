import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FiTrash2, FiSun, FiMoreHorizontal } from "react-icons/fi"
import { toggleTheme } from '../../redux/uiSlice'
import { deleteNote, setActiveNote } from '../../redux/notesSlice'
import noteService from '../../services/notes'

const NoteOption = ({ noteId }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()


    const user = useSelector(state => state.auth.user)
    const notes = useSelector(state => state.notes.entities)
    const notesArray = useMemo(() => Object.values(notes), [notes])
    const userId = user?.userId

    console.log('userId:', userId)




    const handleDelete = async () => {
        // user must have at least one of unshared notes
        // Check if the user has any unshared notes
        const hasUnsharedNotes = notesArray.filter(note => note.id !== noteId && note.collaborators.length === 0)
        if (!hasUnsharedNotes.length === 0) {
            // If no unshared notes, prevent deletion
            alert("You must have at least one unshared note.")
            return
        }
        // Proceed with deletion
        noteService.setToken(user?.token)
        await dispatch(deleteNote({ id: noteId, userId: userId }))
        console.log('DELETED NOTE:', noteId)

        // After deletion, find fallback note
        const remainingNotes = notesArray.filter(note => note.id !== noteId)
        if (remainingNotes.length > 0) {
            const fallbackNoteId = remainingNotes[0].id
            dispatch(setActiveNote(fallbackNoteId))
            navigate(`/notes/${fallbackNoteId}`, { replace: true })
        } else {
            // No notes left – handle clean slate or navigate to a blank state
            dispatch(setActiveNote(null))
            navigate('/notes', { replace: true })
        }
    }

    return (
        <div className="dropdown_2">
            <button
                className="option-button"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            ><FiMoreHorizontal />
            </button>
            <ul className="dropdown-menu">
                <li><a className="dropdown-item" onClick={() => dispatch(toggleTheme())}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiSun style={{ marginRight: '8px' }} />
                        <span>theme</span>
                    </div>
                </a>
                </li>
                <li><a className="dropdown-item" onClick={handleDelete}>
                    <div style={{ display: 'flex', alignItems: 'center', color: 'red' }}>
                        <FiTrash2 style={{ marginRight: '8px' }} />
                        <span>delete</span>
                    </div>
                </a>
                </li>
            </ul>
        </div>
    )
}

export default NoteOption