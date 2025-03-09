import { useContext, useEffect } from "react"
import Note from "./Note"
import NoteForm from "./NoteForm"
import Togglable from "./Togglable"
import noteContext from "../context/NoteContext"
import LoginForm from "./LoginForm"

const Notes = () => {
    const { getNotes, showAll, setShowAll, user, handleLogout, addNote, notesToShow,
        toggleImportanceOf, deleteNoteOf, getLoggedUser, loginVisible, setLoginVisible,
        setUsername, setPassword, handleLogin, username, password, noteFormRef } = useContext(noteContext)

    useEffect(() => {
        getNotes()
    }, [])

    useEffect(() => {
        getLoggedUser()
    }, [])

    const noteForm = () => {
        return (
            <Togglable buttonLabel='new note' ref={noteFormRef}>
                <NoteForm createNote={addNote} />
            </Togglable>
        )
    }


    return (

        <div>
            <div>
                <button onClick={() => setShowAll(!showAll)}>
                    show {showAll ? 'important' : 'all'}
                </button>
            </div>
            <ul>
                {notesToShow.map((note, id) =>
                    <Note
                        key={id}
                        note={note}
                        toggleImportance={() => toggleImportanceOf(note.id)}
                        deleteNote={() => deleteNoteOf(note.id)}
                    />
                )}
            </ul>
            {noteForm()}
        </div>


    )
}

export default Notes