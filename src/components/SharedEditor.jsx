import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEditor, EditorContent, EditorProvider } from '@tiptap/react'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { updateNote } from '../redux/notesSlice'
// import { ySocket } from '../redux/socket'
import MenuBar from './Menubar'
import { collabExtensions, mainExtensions } from './Extension'


// Define the colors for cursor display
const colors = [
    '#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB',
    '#B9F18D', '#C3E2C2', '#EAECCC', '#AFC8AD', '#EEC759', '#9BB8CD',
    '#FF90BC', '#FFC0D9', '#DC8686', '#7ED7C1', '#F3EEEA', '#89B9AD',
    '#D0BFFF', '#FFF8C9', '#CBFFA9', '#9BABB8', '#E3F4F4'
]


const getRandomElement = list => list[Math.floor(Math.random() * list.length)]
const getRandomColor = () => getRandomElement(colors)


const SharedEditor = ({ noteId, note }) => {
    const dispatch = useDispatch()

    // const noteId = useSelector(state => state.notes.activeNoteId)
    // console.log('NOTE ID from sharedEditor: ', noteId)
    // const note = useSelector(state => state.notes.entities[noteId])
    const activeUsers = useSelector(state => state.notes.activeUsers)
    const activeUsersNames = activeUsers.map(user => user.username)
    const user = useSelector(state => state.auth.user)
    const collabToken = useSelector(state => state.auth.collabToken)

    const timeoutRef = useRef(null)

    const getRandomName = () => getRandomElement(activeUsersNames)

    const getInitialUser = () => {
        return {
            name: getRandomName(),
            color: getRandomColor(),
        }
    }


    const ydoc = useMemo(() => new Y.Doc(), [noteId])
    const [currentUser, setCurrentUser] = useState(getInitialUser)
    const [status, setStatus] = useState('connecting')
    const [isSynced, setSynced] = useState(false)
    const [isCollabReady, setIsCollabReady] = useState(false)




    const provider = useMemo(() => {
        if (!collabToken) return null

        return new HocuspocusProvider({
            url: 'ws://localhost:1234',
            name: noteId,
            document: ydoc,
            token: collabToken,
            connect: false,
            preserveConnection: false,
            onAuthenticationFailed: (error) => {
                console.error('Authentication failed:', error)
            },
            onStatus: (status) => {
                if (status === "connected") {
                    console.log('Connected to provider')
                }
            },
        })
    }, [collabToken, noteId, ydoc])

    provider.on('synced', () => {
        console.log('Synced with remote provider')
        setSynced(true)
    })


    useEffect(() => {
        if (!provider || !collabToken) return
        provider.connect()
        console.log('Provider connected:', provider)
        return () => {
            provider.destroy()
            console.log('Provider disconnected:', provider)
        }
    }, [provider, collabToken])



    const extensions = useMemo(() => {
        return [
            ...mainExtensions,
            ...collabExtensions({
                provider: provider,
                user: {
                    name: currentUser.name,
                    color: currentUser.color,
                },
            })
        ]

    }, [provider, currentUser])


    const editor = useEditor({
        enableContentCheck: true,
        onContentError: ({ disableCollaboration }) => {
            disableCollaboration()
        },
        immediatelyRender: true,
        shouldRerenderOnTransaction: true,
        extensions,
        onCreate: ({ editor }) => {
            const xml = ydoc.getXmlFragment('default')

            // Don't apply note.content if Yjs document already has synced data
            if (editor && xml.length === 0) {
                editor.commands.setContent(note.content.default)
                editor.storage.noteId = noteId
            }
        },
        onUpdate: async ({ editor }) => {
            if (editor.isEmpty) return
            const editorContent = editor.getJSON()
            console.log('Editor content:', editorContent)
            //debouncedUpdateContent(editorContent)
        }
    })



    useEffect(() => {
        console.log('useEffect2 called')
        const collabReadyTimeout = setTimeout(() => {
            if (
                !isCollabReady &&
                isSynced &&
                provider?.status === 'connected' ||
                provider?.status === 'connecting'
            ) {
                setIsCollabReady(true)
            }
        }, 500)
        return () => clearTimeout(collabReadyTimeout)
    }, [provider?.status])


    // const debouncedUpdateContent = useCallback((content) => {
    //     if (!editor || !isSynced) return


    //     // Clear the last timeout if one exists
    //     if (timeoutRef.current) {
    //         clearTimeout(timeoutRef.current)
    //     }

    //     // Set a new timeout
    //     timeoutRef.current = setTimeout(() => {
    //         dispatch(updateNote({
    //             id: noteId,
    //             changes: { content }
    //         }))
    //         console.log('Shared note content saved:', content)
    //     }, 300)
    // }, [editor, noteId, ydoc])


    return (
        isCollabReady ? (<div>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="main-group" />
        </div>) : (<div>
            <p>loadding...</p>
            <p>Remote provider status: {provider?.status}</p>
        </div>)
    )
}

export default SharedEditor
