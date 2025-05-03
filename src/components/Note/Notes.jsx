import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { socket } from "../../socket"
import { createCollabToken } from "../../redux/authSlice"
import { fetchNotes, addNote, setActiveNote, setActiveUsers, setSharedNotes, fetchSharedNotes, noteDeletedRealtime, setCollaborators } from "../../redux/notesSlice"
import notesService from "../../services/notes"
import NoteEditor from "./Editor/NoteEditor"
import Sidebar from "./Sidebar"

const Notes = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { noteId: routeNoteId } = useParams()

    const [loading, setLoading] = useState(true) // Track loading state

    const notes = useSelector(state => state.notes.entities)
    const notesArray = useMemo(() => Object.values(notes), [notes])



    const activeNoteId = useSelector(state => state.notes.activeNoteId)
    const note = useSelector(state => state.notes.entities[activeNoteId])
    const user = useSelector(state => state.auth.user)

    const isType = note?.collaborators ? note?.collaborators.find(collab => collab?.userId === user?.userId)?.userType : "editor"




    console.log("Component re-rendered") // check when component is re-rendered
    console.log('Notes:', notesArray)
    console.log('notes length:', notesArray.length)
    console.log('Active Note:', note)

    useEffect(() => {
        console.log("main useEffect called")

        // Avoid running the effect if the user is not authenticated
        if (!user?.token || !user?.userId) return

        console.log('Fetching notes...')


        // Fetch shared notes and regular notes concurrently
        const fetchNotesData = async () => {
            try {                // Fetch regular notes
                notesService.setToken(user.token)
                const fetchedNotesResult = await dispatch(fetchNotes(user.userId))
                const fetchedNotes = fetchedNotesResult.payload
                console.log('Fetched notes:', fetchedNotes)
                if (fetchedNotes.length === 0) {
                    // Add a new empty note if no notes exist
                    await dispatch(addNote({
                        title: '',
                        content: {
                            type: 'doc',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [{ type: 'text', text: 'create your notes' }],
                                },
                            ],
                        },
                        creator: user?.userId,
                        collaborators: [],
                        important: false,
                    }))
                    console.log('Adding new empty note')
                }



                // Fetch shared notes
                const sharedNotesResult = await dispatch(fetchSharedNotes(user?.userId))
                const sharedNotes = sharedNotesResult.payload || []

                console.log('Shared notes:', sharedNotes)


                dispatch(setSharedNotes(sharedNotes))
                console.log('notes after setting shared notes:', notes)


            } catch (error) {
                console.error('Error fetching notes:', error)
            } finally {
                // Set loading to false after fetching
                setLoading(false)
            }


        }
        if (user?.token && user?.userId) {
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
        }


    }, [user])

    // Redirect if routeNoteId is deleted
    useEffect(() => {
        if (!routeNoteId) return // No route noteId, do nothing
        const noteExists = Boolean(notes[routeNoteId])
        console.log('noteExists:', noteExists)
        console.log('routeNoteId:', routeNoteId)

 
        if (!noteExists && Object.keys(notes).length > 0) {
            const fallbackNoteId = Object.keys(notes).at(-1) // fallback to most recent
            dispatch(setActiveNote(fallbackNoteId))
            navigate(`/notes/${fallbackNoteId}`, { replace: true })
        }
    }, [routeNoteId, notes])


    // Set collab token when active note changes
    useEffect(() => {
        console.log('collab useEffect called')

        if (activeNoteId) {// set collab token
            dispatch(createCollabToken({
                noteId: activeNoteId,
                userId: user?.userId,
                permissions: isType === 'viewer' ? 'read' : 'write',
            }))
        }
    }, [activeNoteId, user?.userId])

    if (loading) {
        return <div>Loading...</div> // Display loading state until data is fetched
    }


    return (
        <div id="notes-app">
            <Sidebar />
            {note ? (
                <NoteEditor key={activeNoteId} noteId={activeNoteId} note={note} notes={notesArray} />
            ) : (
                <NoteEditor key="null" noteId="null" note="null" notes="null" />
            )}

        </div>

    )
}

export default Notes
