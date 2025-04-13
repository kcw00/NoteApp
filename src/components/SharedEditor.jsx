import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Highlight } from '@tiptap/extension-highlight'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { Placeholder } from '@tiptap/extension-placeholder'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { updateNote } from '../redux/notesSlice'
import { ySocket } from '../redux/socket'
import MenuBar from './Menubar'

// Define the colors for cursor display
const colors = [
    '#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB',
    '#B9F18D', '#C3E2C2', '#EAECCC', '#AFC8AD', '#EEC759', '#9BB8CD',
    '#FF90BC', '#FFC0D9', '#DC8686', '#7ED7C1', '#F3EEEA', '#89B9AD',
    '#D0BFFF', '#FFF8C9', '#CBFFA9', '#9BABB8', '#E3F4F4'
]


const getRandomElement = list => list[Math.floor(Math.random() * list.length)]
const getRandomColor = () => getRandomElement(colors)


const SharedEditor = () => {
    const dispatch = useDispatch()

    const noteId = useSelector(state => state.notes.activeNoteId)
    const note = useSelector(state => state.notes.entities[noteId])
    const activeUsers = useSelector(state => state.notes.activeUsers)
    const activeUsersNames = activeUsers.map(user => user.name)

    const getRandomName = () => getRandomElement(activeUsersNames)

    const getInitialUser = () => {
        return {
            name: getRandomName(),
            color: getRandomColor(),
        }
    }

    const [status, setStatus] = useState('connecting')
    const [currentUser, setCurrentUser] = useState(getInitialUser)

    const socketRef = useRef(null)
    const ydoc = useRef(new Y.Doc()) // Yjs document instance
    const provider = useRef(null) // y-websocket provider

    // Initialize y-websocket connection
    const initializeYWebSocket = () => {
        const socketWs = ySocket(noteId)
        socketRef.current = socketWs
        provider.current = new WebsocketProvider({
            url:`${socketRef.current}`, 
            name: `${noteId}`, 
            document: ydoc.current,
        })
        const awareness = provider.current.awareness
        awareness.setLocalStateField('user', currentUser)
        awareness.on('change', () => {
            const users = awareness.getStates()
        })
        provider.current.on('status', event => setStatus(event.status))
        console.log('Yjs WebSocket provider connected')
    }

    useEffect(() => {
        initializeYWebSocket()

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [noteId])

    const editor = useEditor({
        enableContentCheck: true,
        onContentError: ({ disableCollaboration }) => {
            disableCollaboration()
        },
        extensions: [
            StarterKit.configure({ history: false }),
            Highlight,
            TaskList,
            TaskItem,
            CharacterCount.extend().configure({ limit: 10000 }),
            Collaboration.extend().configure({ document: ydoc.current }),
            CollaborationCursor.extend().configure({
                provider: provider.current,
                user: currentUser,
            }),
            Placeholder.configure({
                placeholder:
                    'Write something … \n\n',
            }),
        ],
        content: note.content,
    })

    useEffect(() => {
        const statusHandler = (event) => {
            setStatus(event.status)
        }
        provider.current.on('status', statusHandler)

        return () => {
            provider.current.off('status', statusHandler)
        }
    }, [provider.current])

    useEffect(() => {
        if (editor && currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser))
            editor.chain().focus().updateUser(currentUser).run()
        }
    }, [editor, currentUser])

    const handleEditorUpdate = (content) => {
        dispatch(updateNote({ id: noteId, changes: { content } }))
        console.log('Shared note content saved:', content)
    }

    useEffect(() => {
        if (!editor) return
        editor.on('update', () => handleEditorUpdate(editor.getJSON()))
        return () => {
            if (editor) {
                editor.off('update', handleEditorUpdate)
            }
        }
    }, [editor])

    if (!editor) return null

    return (
        <div className="column-half">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="main-group" />
            <div className="collab-status-group" data-state={status === 'connected' ? 'online' : 'offline'}>
                <label>{status === 'connected' ? `${editor.storage.collaborationCursor.users.length} user${editor.storage.collaborationCursor.users.length === 1 ? '' : 's'} online` : 'offline'}</label>
            </div>
        </div>
    )
}

export default SharedEditor
