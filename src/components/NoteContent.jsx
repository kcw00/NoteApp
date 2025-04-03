import '../styles.css'
import { useEditor, EditorContent } from '@tiptap/react'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { setCollaborators, collaboratorRemoved } from '../redux/notesSlice'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import CharacterCount from '@tiptap/extension-character-count'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import StarterKit from '@tiptap/starter-kit'
import * as Y from 'yjs'
import socket from '../redux/socket'

const room = 'room-1'
const colors = ['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D']

const NoteContent = () => {
    const dispatch = useDispatch()
    const activeNoteId = useSelector(state => state.notes.activeNoteId)
    const note = useSelector(state => state.notes.entities[activeNoteId])
    const [status, setStatus] = useState('connecting')
    const [currentUser, setCurrentUser] = useState(null)

    const collaborators = note?.collaborators || []

    // Check if the current user can edit (they must be an editor)
    const isEditable = collaborators.some(collaborator => collaborator.userId === currentUser?.userId && collaborator.userType === 'editor')

    const ydoc = new Y.Doc()
    const websocketProvider = new TiptapCollabProvider({
        appId: 'zk5qovyk',
        name: room,
        document: ydoc,
    })

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ history: false }),
            CharacterCount.configure({ limit: 10000 }),
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({
                provider: websocketProvider,
            }),
        ],
        editable: isEditable, // Only allow editing if the user has 'editor' role
    })

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('loggedNoteappUser'))
        if (storedUser) {
            setCurrentUser(storedUser)
        } else {
            // Generate random name and color if no stored user
            const user = { name: 'Anonymous', color: colors[Math.floor(Math.random() * colors.length)] }
            setCurrentUser(user)
            localStorage.setItem('loggedNoteappUser', JSON.stringify(user))
        }

        if (editor && currentUser) {
            websocketProvider.updateUser(currentUser) // Update user in WebSocket provider
        }

        // Update status changes
        websocketProvider.on('status', event => {
            setStatus(event.status)
        })
    }, [editor, currentUser])

    // Handle collaborator changes (when a collaborator is added/removed)
    useEffect(() => {
        socket.on('collaboratorAdded', updatedNote => {
            if (updatedNote.id === activeNoteId) {
                dispatch(setCollaborators({
                    noteId: updatedNote.id,
                    collaborator: updatedNote.collaborator,
                }))
            }
        })

        socket.on('collaboratorRemoved', updatedNote => {
            if (updatedNote.id === activeNoteId) {
                dispatch(collaboratorRemoved({
                    noteId: updatedNote.id,
                    collaboratorId: updatedNote.collaboratorId,
                }))
            }
        })

        return () => {
            socket.off('collaboratorAdded')
            socket.off('collaboratorRemoved')
        }
    }, [dispatch, activeNoteId])


    return (
        <div className="editor">
            <div className="editor__header">
                <div className="dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
                <div className="editor__users">
                    <div className={`editor__status editor__status--${status}`}>
                        {status === 'connected'
                            ? `${editor.storage.collaborationCursor.users.length} user${editor.storage.collaborationCursor.users.length === 1 ? '' : 's'} online`
                            : 'offline'}
                    </div>
                </div>
            </div>
            <EditorContent className="editor__content" editor={editor} />
        </div>
    )
}

export default NoteContent
