import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import socket from "../redux/socket"

import { fetchNotes, addNote, setActiveNote, setActiveUsers, setSharedNotes, fetchSharedNotes, noteDeletedRealtime, setCollaborators } from "../redux/notesSlice"
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
        console.log("useEffect called")
    
        // Avoid running the effect if the user is not authenticated
        if (!user?.token || !user?.userId) return
    
        console.log('Fetching notes...')
    
        // Only fetch notes if the notesArray is empty
        if (notesArray.length === 0) {
            notesService.setToken(user.token)
    
            console.log('Logged user:', user)
    
            // Fetch shared notes and regular notes concurrently
            const fetchNotesData = async () => {
                // Fetch regular notes
                const fetchedNotesResult = await dispatch(fetchNotes(user.userId))
                const fetchedNotes = fetchedNotesResult.payload
                if (fetchedNotes.length === 0) {
                    // Add a new empty note if no notes exist
                    dispatch(addNote({
                        title: '',
                        content: '',
                        creator: user.userId,
                        collaborators: {},
                        important: false,
                    }))
                    console.log('Adding new empty note')
                }
    
                // Fetch shared notes
                const sharedNotesResult = await dispatch(fetchSharedNotes(user.userId))
                const sharedNotes = sharedNotesResult.payload
                console.log('Shared notes:', sharedNotes)
    
                // Update shared notes only if there are any
                if (sharedNotes.length > 0) {
                    dispatch(setSharedNotes(sharedNotes))
                    console.log('notes after setting shared notes:', notes)
                }
    
                // Set the active note (if none exists)
                if (!activeNoteId) {
                    const noteToSet = fetchedNotes[fetchedNotes.length - 1] // Use the last fetched note
                    if (noteToSet) {
                        dispatch(setActiveNote(noteToSet.id)) // Set active note
                        console.log('Setting active note to:', noteToSet)
                    }
                }
            }
    
            fetchNotesData()
    
            // Set up socket listeners only once
            socket.on('activeUsers', (data) => {
                console.log('socket listen ----- Logged user:', data)
                dispatch(setActiveUsers(data))
            })
    
            socket.on('noteDeleted', (data) => {
                console.log('socket listen ----- Note deleted:', data)
                dispatch(noteDeletedRealtime(data))
            })
    
            socket.on('collaboratorAdded', (data) => {
                console.log('socket listen ----- Collaborator added:', data)
                dispatch(setCollaborators(data))
            })
    
            socket.on('noteShared', (data) => {
                console.log('socket listen ----- Note shared:', data)
                dispatch(setSharedNotes(data))
            })
        } else if (activeNoteId && !notesArray.some(note => note?.id === activeNoteId)) {
            // If active note is not found, default to the last note
            dispatch(setActiveNote(notesArray[notesArray.length - 1]?.id))
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
