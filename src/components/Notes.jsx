import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import socket from "../redux/socket"

import { fetchNotes, addNote, setActiveNote, setActiveUsers, setSharedNotes, fetchSharedNotes } from "../redux/notesSlice"
import notesService from "../services/notes"
import NoteEditor from "./NoteEditor"
import Sidebar from "./Sidebar"

const Notes = () => {
    const dispatch = useDispatch()

    const notes = useSelector(state => state.notes.entities)
    const notesArray = useMemo(() => Object.values(notes), [notes])



    const activeNoteId = useSelector(state => state.notes.activeNoteId)
    const note = useSelector(state => state.notes.entities[activeNoteId])

    const user = useSelector(state => state.auth.user)

    console.log("Component re-rendered") // check when component is re-rendered
    console.log('Notes:', notesArray)
    console.log('notes length:', notesArray.length)
    console.log('Active Note:', note)



    useEffect(() => {
        // check when useEffect is called
        console.log("useEffect called")

        // Avoid running the effect if the user is not authenticated
        if (!user?.token || !user?.userId) return

        console.log('Fetching notes...')




        // Only fetch notes if the notes are not already fetched or if notesArray is empty
        if (notesArray.length === 0) {
            notesService.setToken(user.token)
            // Set active users
            socket.on('activeUsers', (data) => {
                console.log('socket')
                console.log('socket listen ----- Logged user:', data)
                dispatch(setActiveUsers(data))
            })
            socket.on('noteShared', (data) => {
                console.log('socket listen ----- Note shared:', data)
                dispatch(setSharedNotes(data))
            })

            socket.on('sharedNotesFetched', (sharedNotes) => {
                console.log('socket listen ----- Shared notes fetched:', sharedNotes)
                dispatch(setSharedNotes(sharedNotes))
            })
            
            dispatch(fetchNotes(user.userId)).then((result) => {
                const fetchedNotes = result.payload
                if (fetchedNotes.length === 0) {
                    // Only add a new empty note if no notes exist
                    dispatch(addNote({
                        title: '',
                        content: '',
                        creator: user.userId,
                        collaborators: {},
                        important: false,
                    }))
                    console.log('Adding new empty note')
                }
            })
        }

        // Only set the active note if there is no active note or if the active note was deleted
        if (!activeNoteId && notesArray.length > 0) {
            dispatch(setActiveNote(notesArray[notesArray.length - 1]?.id)) // Default to the last note
            console.log('Setting active note')
        } else if (activeNoteId && !notesArray.some(note => note?.id === activeNoteId)) {
            dispatch(setActiveNote(notesArray[notesArray.length - 1]?.id)) // Default to the last note if active note is deleted
        }

    }, [user?.token, user?.userId, notesArray, activeNoteId])



    return (
        <div id="notes-app">
            <Sidebar />
            {note ? (
                <NoteEditor key={note.id} noteId={note.id} note={note} notes={notesArray} />
            ) : (
                <NoteEditor key="null" noteId="null" note="null" notes="null" />
            )}

        </div>

    )
}

export default Notes
