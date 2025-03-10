import { useContext, useEffect } from "react"
import Note from "./Note"
import NoteForm from "./NoteForm"
import Togglable from "./Togglable"
import noteContext from "../context/NoteContext"

const Notes = () => {
    const { getNotes, showAll, setShowAll, addNote, notesToShow,
        toggleImportanceOf, deleteNoteOf, getLoggedUser,
        noteFormRef, user } = useContext(noteContext)

    useEffect(() => {
        getLoggedUser()
    }, [])

    useEffect(() => {
        if (user)
            getNotes()
    }, [user])

    const noteForm = () => {
        return (
            <Togglable buttonLabel='new note' ref={noteFormRef}>
                <NoteForm createNote={addNote} user={user?.id}/>
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