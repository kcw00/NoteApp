import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { socket } from "../../socket/socket"
import { createCollabToken } from "../../redux/authSlice"
import { fetchNotes, addNote, setActiveNote, setSharedNotes, fetchSharedNotes } from "../../redux/notesSlice"
import notesService from "../../services/notes"
import NoteEditor from "./Editor/NoteEditor"
import Sidebar from "./Sidebar"
import { useParams } from "react-router-dom"
import Alert from "../Alert/Alert"

const Notes = () => {
    const dispatch = useDispatch()
    const params = useParams()

    const [loading, setLoading] = useState(true) // Track loading state
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")

    const notes = useSelector(state => state.notes.entities)
    const notesArray = useMemo(() => Object.values(notes), [notes])


    const activeNoteId = useSelector(state => state.notes.activeNoteId)
    const note = useSelector(state => state.notes.entities[activeNoteId])
    const user = useSelector(state => state.auth.user)

    const isType = note?.collaborators ? note?.collaborators.find(collab => collab?.userId === user?.userId)?.userType : "editor"

    /*
    console.log("Component re-rendered") // check when component is re-rendered
    console.log('Notes:', notesArray)
    console.log('notes length:', notesArray.length)
    console.log('Active Note:', note)
    console.log('noteId from routes', params.id)
    */
    useEffect(() => {
        // console.log("main useEffect called")

        // Avoid running the effect if the user is not authenticated
        if (!user?.token || !user?.userId) return

        // console.log('Fetching notes...')

        // Fetch shared notes and regular notes concurrently
        const fetchNotesData = async () => {
            try {                // Fetch regular notes
                notesService.setToken(user.token)
                const fetchedNotesResult = await dispatch(fetchNotes(user.userId))
                const fetchedNotes = fetchedNotesResult.payload
                // console.log('Fetched notes:', fetchedNotes)
                if (fetchedNotes.length === 0) {
                    // Add a new empty note if no notes exist
                    await dispatch(addNote({
                        title: '',
                        content: {
                            type: 'doc',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: '',
                                },
                            ],
                        },
                        creator: user?.userId,
                        collaborators: [],
                        important: false,
                    }))
                    dispatch(setActiveNote(fetchedNotes[0]?.id))
                    // console.log('Adding new empty note')

                } else if (fetchedNotes.length > 0 && !params.id) {
                    // Set the active note to the first unshared note once user logged in
                    const unsharedNotes = fetchedNotes.filter(note => note.collaborators.length === 0)
                    dispatch(setActiveNote(unsharedNotes[0]?.id))
                    // console.log('Setting active note to:', unsharedNotes[0]?.id)

                } else if (fetchedNotes.length > 0 && params.id) {
                    // Keep the current active note after page refresh
                    dispatch(setActiveNote(params.id))
                    // console.log('active note not changed')
                }



                // Fetch shared notes
                const sharedNotesResult = await dispatch(fetchSharedNotes(user?.userId))
                const sharedNotes = sharedNotesResult.payload || []

                // console.log('Shared notes:', sharedNotes)


                await dispatch(setSharedNotes(sharedNotes))
                // console.log('notes after setting shared notes:', notes)


            } catch (error) {
                console.error('Error fetching notes:', error)
            } finally {
                // Set loading to false after fetching
                setLoading(false)
            }


        }
        if (user?.token && user?.userId) {
            fetchNotesData()

        }


    }, [user])

    // Set collab token when active note changes
    useEffect(() => {
        //console.log('collab useEffect called')
        if (!user?.userId || !note) return

        const fetchCollabToken = async () => {
            try {
                dispatch(createCollabToken({
                    noteId: activeNoteId,
                    userId: user?.userId,
                    permissions: isType === 'viewer' ? 'read' : 'write',
                }))
            }
            catch (error) {
                console.error('Error fetching collab token:', error)
            }
        }
        fetchCollabToken()
    }, [activeNoteId, user?.userId, params.id])


    // show alert when note is deleted
    useEffect(() => {
        socket.on('noteDeleted', ({ id }) => {
            //console.log('socket listen ----- Note deleted:', id)
            setAlertMessage("Note deleted")
            setShowAlert(true)

            setTimeout(() => {
                setShowAlert(false)
            }, 3000)
        })

        return () => {
            socket.off('noteDeleted')
        }
    }, [])


    if (loading) {
        return <div>Loading...</div> // Display loading state until data is fetched
    }


    return (
        <div id="notes-app">
            <Sidebar />
            {note ? (
                <NoteEditor key={activeNoteId} noteId={activeNoteId} note={note} />
            ) : (
                <NoteEditor key="null" noteId="null" note="null" />
            )}
            {showAlert && <Alert message={alertMessage} onClose={() => setShowAlert(false)} />}
        </div>

    )
}

export default Notes
