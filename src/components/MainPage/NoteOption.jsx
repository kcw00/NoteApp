import jsPDF from 'jspdf'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiTrash2, FiSun, FiMoreHorizontal } from "react-icons/fi"
import { TfiUpload } from "react-icons/tfi"
import { toggleTheme } from '../../redux/uiSlice'
import { deleteNote, noteDeletedRealtime, setActiveNote } from '../../redux/notesSlice'
import noteService from '../../services/notes'

const NoteOption = ({ noteId }) => {
    const dispatch = useDispatch()


    const user = useSelector(state => state.auth.user)
    const notes = useSelector(state => state.notes.entities)
    const notesArray = useMemo(() => Object.values(notes), [notes])
    const activeNoteId = useSelector(state => state.notes.activeNoteId)
    const userId = user?.userId

    console.log('userId:', userId)




    const handleDelete = async () => {
        // user must have at least one of unshared notes
        // Check if the user has any unshared notes
        const hasUnsharedNotes = notesArray.filter(note => note.collaborators.length === 0)
        if (!hasUnsharedNotes) {
            // If no unshared notes, prevent deletion
            alert("You must have at least one unshared note.")
            return
        }
        // Proceed with deletion
        noteService.setToken(user?.token)
        await dispatch(deleteNote({ id: noteId, userId: userId }))
        console.log('DELETED NOTE:', noteId)
    }

    const exportToPDF = (note) => {
        // Export note to PDF
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [210, 297],
        }
        )

        const noteElement = document.getElementById('input-container')

        console.log('noteElement:', noteElement)

        doc.html(noteElement, {
            callback: function (doc) {
                doc.save(`${note.title}.pdf`)
            },
            margin: [10, 10, 10, 10],
            x: 5,
            y: 10,
            width: 270,
            windowWidth: 1000,
            html2canvas: {
                scale: 0.3,
                useCORS: true,
                logging: true,
            }
        })
        console.log('Exported to PDF')

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
                <li><a className="dropdown-item" onClick={() => exportToPDF(note)}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TfiUpload style={{ marginRight: '8px' }} />
                        <span>export</span>
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