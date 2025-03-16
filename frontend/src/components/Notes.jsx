import { useContext, useEffect } from "react"
import Note from "./Note"
import NoteEditor from "./NoteEditor"
import Togglable from "./Togglable"
import noteContext from "../context/NoteContext"
import Sidebar from "./Sidebar"

const Notes = () => {
    const { getNotes, addNote, notes,
        toggleImportanceOf, deleteNoteOf, getLoggedUser,
        noteFormRef, user } = useContext(noteContext)

    useEffect(() => {
        getLoggedUser()
    }, [])

    useEffect(() => {
        if (user)
            getNotes()
    }, [user])

    // const noteForm = () => {
    //     return (
    //         <Togglable buttonLabel='new note' ref={noteFormRef}>
    //             <NoteForm createNote={addNote} user={user?.id} />
    //         </Togglable>
    //     )
    // }


    return (
        <div id="notes-app">
            <Sidebar />
                <NoteEditor createNote={addNote} user={user?.id} />

                
            </div>
        
    )
}

export default Notes

/*
                <ul className="note">
                    {notes.map((note, id) =>
                        <Note
                            key={id}
                            note={note}
                            toggleImportance={() => toggleImportanceOf(note.id)}
                            deleteNote={() => deleteNoteOf(note.id)}
                        />
                    )}
                </ul>
*/