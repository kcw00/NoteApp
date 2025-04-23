import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEditor, EditorContent, EditorProvider } from '@tiptap/react'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { updateNote } from '../redux/notesSlice'
// import { ySocket } from '../redux/socket'
import MenuBar from './Menubar'
import { mainExtensions } from './Extension'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { TiptapTransformer } from '@hocuspocus/transformer'
import { useLayoutEffect } from 'react'


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
    // console.log('[SharedEditor]collabToken:', collabToken)

    const timeoutRef = useRef(null)

    const currentUser = useMemo(() => ({
        name: user?.username || "Anonymous",
        color: getRandomColor()
    }), [user])


    const ydoc = useMemo(() => new Y.Doc(), [noteId])

    const [isSynced, setSynced] = useState(false)
    const [isCollabReady, setIsCollabReady] = useState(false)
    const [editorInstance, setEditorInstance] = useState(null)


    const provider = useMemo(() => {
        if (!collabToken || !noteId) return

        const p = new HocuspocusProvider({
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
                    console.log('[Hocuspocus] Connected')
                }
            },
        })

        p.on('synced', () => {
            console.log('[Hocuspocus] Synced')
            setSynced(true)
            
            const xml = ydoc.getXmlFragment('default')
            const isEmpty = xml.toString().trim() === ''
            if (isEmpty && editorInstance && note?.content?.default) {
                const hydratedDoc = TiptapTransformer.toYdoc(note.content.default, 'default')
                const update = Y.encodeStateAsUpdate(hydratedDoc)
                Y.applyUpdate(ydoc, update)
                console.log('[SharedEditor] Injected note content into Yjs')
            }
            

        })

        return p
    }, [collabToken, noteId])

    useLayoutEffect(() => {
        provider.connect()
        provider.on('connect', () => {
            console.log('[SharedProvider] Connected')
            setSynced(true)
        })
        return () => {
            setSynced(false)
            provider.destroy()
        }
    }, [provider])

    const extensions = useMemo(() => {
        if (!provider || !isSynced) {
            console.log(`[SharedEditor] Provider ${provider.status}`, isSynced)
            console.log('[SharedEditor] provider:', provider)
            return [...mainExtensions, Collaboration.configure({ document: ydoc })]
        }

        return [
            ...mainExtensions,
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({
                provider,
                user: {
                    name: currentUser.name,
                    color: currentUser.color,
                },
            }),
        ]
    }, [provider, currentUser, ydoc, noteId])



    const editor = useEditor({
        enableContentCheck: true,
        onContentError: ({ disableCollaboration }) => {
            disableCollaboration()
        },
        immediatelyRender: true,
        shouldRerenderOnTransaction: true,
        extensions,
        autofocus: true,
        onCreate: ({ editor }) => {
            console.log('[Shared Editor] Created')
            setEditorInstance(editor)
        },
        onUpdate: async ({ editor }) => {
            if (editor.isEmpty) return
            const editorContent = editor.getJSON()
            console.log('[Shared Editor] JSON update:', editorContent)
            console.log('[Shared Editor] is synced:', isSynced)
            console.log('[Shared Editor] Yjs XML:', ydoc.getXmlFragment('default').toString())
            //debouncedUpdateContent(editorContent)
        }
    })

    useEffect(() => {
        if (provider) {
            const interval = setInterval(() => {
                console.log('[Manual Save] Calling provider.storeDocument()')
                provider.storeDocument?.()
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [provider])



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
    }, [provider?.status, provider])


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
