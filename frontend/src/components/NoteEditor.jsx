import { useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from "react-router-dom"
import { updateNote, deleteNote, setActiveNote, resetErrorMessage } from '../redux/notesSlice'
import { setWindowWidth, toggleSidebar } from '../redux/uiSlice'


const NoteEditor = ({ noteId, note, notes }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { sidebarWidth, windowWidth, isSidebarOpen } = useSelector((state) => state.ui)

    const errorMessage = useSelector((state)=> state.notes.errorMessage)

    useEffect(() => {
        // Handle resize event
        const handleResize = () => {
            dispatch(setWindowWidth(window.innerWidth))
        }
        window.addEventListener('resize', handleResize)

        // Timeout to clear error message after 5 seconds
        if (errorMessage) {
            setTimeout(() => {
                dispatch(resetErrorMessage())
            }, 5000)
        }

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [dispatch, errorMessage])

    const handleToggleSidebar = () => {
        dispatch(toggleSidebar())
    }

    const handleDelete = () => {
        dispatch(deleteNote(noteId))

        const remainingNotes = Object.values(notes).filter(note => note.id !== noteId)
        if (remainingNotes.length > 0) {
            const newActiveNote = remainingNotes[remainingNotes.length - 1]
            dispatch(setActiveNote(newActiveNote.id))
            navigate(`/notes/${newActiveNote.id}`)
        } else {
            dispatch(setActiveNote(null))
            navigate('/notes')
        }
    }

    const handleImportance = () => {
        dispatch(updateNote({ id: noteId, changes: { important: !note.important } }))
    }

    const handleTitleChange = (e) => {
        dispatch(updateNote({ id: noteId, changes: { title: e.target.value } }))
    }

    const handleContentChange = (e) => {
        dispatch(updateNote({ id: noteId, changes: { content: e.target.value } }))
    }



    const icon = note.important ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
    </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-star" viewBox="0 0 16 16">
        <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
    </svg>

    return (
        <div className="note-container"
            style={{ width: isSidebarOpen ? `${windowWidth - sidebarWidth}px` : "100%" }}>
            {errorMessage && <div className="alert alert-danger">{JSON.stringify(errorMessage.error)}</div>}
            <header className="note-header d-flex align-items-center p-3">
                {!isSidebarOpen ? <button onClick={handleToggleSidebar}>{">>"}</button> : ""}
                <button className="ms-auto favorite-button 30px" onClick={handleImportance}>{icon}</button>
                <button className="share-button">share</button>
                <div className="dropdown">
                    <button 
                        className="option-button"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >...
                    </button>
                    <ul className="dropdown-menu">
                        <li><a className="dropdown-item" onClick={handleDelete}>delete</a></li>
                        <li><a className="dropdown-item">Export</a></li>
                        <li><a className="dropdown-item">option 3</a></li>
                    </ul>
                </div>
            </header>
            <div>

            </div>
            <div className="input-container">
                <div className="note-form d-flex flex-column align-items-center">
                    <div className="note-title-wrapper">
                        <input
                            name='title'
                            onChange={handleTitleChange}
                            placeholder='Untitled'
                            id='note-input'
                            className='note-title'
                            value={note.title}
                        />
                    </div>
                    <div className="note-content-wrapper">
                        <input
                            name='content'
                            onChange={handleContentChange}
                            placeholder='write note content here'
                            id='note-input'
                            className='note-content'
                            value={note.content}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}


export default NoteEditor