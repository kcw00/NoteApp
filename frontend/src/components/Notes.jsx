import { useEffect } from "react"
import { useDispatch, useSelector} from "react-redux"

import { fetchNotes, addNote, setActiveNote } from "../redux/notesSlice"
import NoteEditor from "./NoteEditor"
import Sidebar from "./Sidebar"

const Notes = () => {

    const dispatch = useDispatch()


    const notes = useSelector(state => Object.values(state.notes.entities) || [])
    const favorites = notes.filter(note => note.important)
    const others = notes.filter(note => !note.important)

    const activeNoteId = useSelector(state => state.notes.activeNoteId)
    const note = useSelector(state => state.notes.entities[activeNoteId])

    const user = useSelector(state => state.auth.user)

    console.log('favorites:', favorites)
    console.log('others:', others)

    console.log('user:', user)
    console.log('notes:', notes)


    useEffect(() => {
        if (user?.userId) {
            dispatch(fetchNotes(user.userId))
        }
    }, [dispatch, user?.userId])

    useEffect(() => {
        if (notes.length === 0 && user?.userId) {
            dispatch(addNote({ title: '', content: '', userId: user.userId })) // New note for new user
        } else if (!activeNoteId) {
            dispatch(setActiveNote(notes[notes.length - 1]?.id)) // Default to the last note
        } else if (!notes.find(note => note?.id === activeNoteId)) {
            dispatch(setActiveNote(notes[0]?.id)) // Default to the first note if active note is deleted
        }
    }, [activeNoteId, notes, dispatch])


    return (
        <div id="notes-app">
            <Sidebar favorites={favorites} others={others} user={user}/>
            {note ? (
                <NoteEditor key={note.id} noteId={note.id} note={note} />
            ) : (
                <NoteEditor key="null" noteId="null" note="null" />
            )}

        </div>

    )
}

export default Notes
