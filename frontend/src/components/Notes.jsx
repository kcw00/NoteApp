import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"

import { fetchNotes } from "../redux/notesSlice"
import NoteEditor from "./NoteEditor"
import noteContext from "../context/NoteContext"
import Sidebar from "./Sidebar"

const Notes = () => {

    const dispatch = useDispatch()

    const notes = useSelector(state => Object.values(state.notes.entities))
    const favorites = notes.filter(note => note.important)
    const others = notes.filter(note => !note.important)

    const note = useSelector(state => state.notes.entities)
    


    console.log('favorites:', favorites)
    console.log('others:', others)


    useEffect(() => {

        dispatch(fetchNotes())
    }, [dispatch])


    // const noteForm = () => {
    //     return (
    //         <Togglable buttonLabel='new note' ref={noteFormRef}>
    //             <NoteForm createNote={addNote} user={user?.id} />
    //         </Togglable>
    //     )
    // }


    return (
        <div id="notes-app">
            <Sidebar favorites={favorites} others={others} />
            <NoteEditor key={note._id} noteId={note._id} note={note} />


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