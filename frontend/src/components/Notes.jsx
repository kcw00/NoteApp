import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { fetchNotes, addNote, setActiveNote } from "../redux/notesSlice"
import notesService from "../services/notes"
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



    useEffect(() => {
        if (user?.token) {
            notesService.setToken(user.token)
            dispatch(fetchNotes(user.userId))
        }
    }, [dispatch, user?.token, user?.userId])


    useEffect(() => {
        if (notes.length === 0 && user?.userId) {
            console.log('Adding new empty note')
            dispatch(addNote({ title: '', content: '', userId: user.userId })) // New note for new user
        } else if (!activeNoteId && notes.length > 0) {
            dispatch(setActiveNote(notes[notes.length - 1]?.id)) // Default to the last note
        } else if (activeNoteId && !notes.find(note => note?.id === activeNoteId)) {
            dispatch(setActiveNote(notes[notes.length - 1]?.id)) // Default to the last note if active note is deleted
        }
    }, [activeNoteId, notes, user?.userId, dispatch])


    return (
        <div id="notes-app">
            <Sidebar favorites={favorites} others={others} user={user} />
            {note ? (
                <NoteEditor key={note.id} noteId={note.id} note={note} notes={notes} />
            ) : (
                <NoteEditor key="null" noteId="null" note="null" notes="null" />
            )}

        </div>

    )
}

export default Notes
