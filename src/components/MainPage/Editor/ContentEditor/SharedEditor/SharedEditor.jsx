import { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { useLayoutEffect } from 'react'
import EditorWithCursor from "./EditorWithCursor"
import "../../styles/editor.css"
import "../../styles/collab.css"


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
    const navigate = useNavigate()

    // const noteId = useSelector(state => state.notes.activeNoteId)
    // console.log('NOTE ID from sharedEditor: ', noteId)
    // const note = useSelector(state => state.notes.entities[noteId])
    const activeUsers = useSelector(state => state.notes.activeUsers)
    const user = useSelector(state => state.auth.user)
    const collabToken = useSelector(state => state.auth.collabToken)
    // console.log('[SharedEditor]collabToken:', collabToken)

    // const getRandomName = () => getRandomElement(activeUsersNames)

    const currentUser = useMemo(() => ({
        name: user?.username,
        color: getRandomColor()
    }), [user])

    const userRole = useMemo(() => {
        if (!note || !user) return null
        if (note.creator === user.userId) return 'creator'
        const match = note.collaborators.find(c => c.userId === user.userId)
        return match?.userType || null
    }, [note, user])


    const ydoc = useMemo(() => new Y.Doc(), [noteId])

    const [isSynced, setSynced] = useState(false)
    const [isCursorReady, setCursorReady] = useState(false)


    const provider = useMemo(() => {
        if (!collabToken || !noteId) return

        const p = new HocuspocusProvider({
            url: `${import.meta.env.VITE_BACKEND_COLLAB_URL}`,
            name: noteId,
            document: ydoc,
            token: collabToken,
            connect: false,
            preserveConnection: false,
            onAuthenticationFailed: (error) => {
                console.log('[SharedEditor] Authentication failed:', error)
                if (error === 'Invalid token') {
                    console.log('[SharedEditor] Invalid token, redirecting to login')
                    // Redirect to login or show an error message
                    navigate('/login')
                }
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
            setCursorReady(true)

            const xml = ydoc.getXmlFragment('content')
            const isEmpty = xml.toString().trim() === ''
            if (isEmpty && note?.content) {
                const hydratedDoc = TiptapTransformer.toYdoc(note.content, 'content')
                const update = Y.encodeStateAsUpdate(hydratedDoc)
                Y.applyUpdate(ydoc, update)
                //console.log('[SharedEditor] Injected note content into Yjs')
            }

        })

        return p
    }, [collabToken, noteId])

    useLayoutEffect(() => {
        if (!provider) return

        provider.connect()
        provider.on('connect', () => {
            console.log('[SharedProvider] Connected')
            setSynced(true)
            provider.awareness.setLocalStateField('user', {
                name: currentUser.name,
                color: currentUser.color,
            })
        })
        provider.awareness.on('update', () => {
            const states = provider.awareness.getStates()
            //console.log('[Cursor] Awareness updated:', states)
            /*
            for (const [clientId, state] of states.entries()) {
                console.log(`[Cursor] Client ${clientId}:`, state.user)
            }
            */
        })
        return () => {
            setSynced(false)
            provider.destroy()
        }
    }, [provider])


    useEffect(() => {
        if (provider) {
            const interval = setInterval(() => {
                //console.log('[Manual Save] Calling provider.storeDocument()')
                provider.storeDocument?.()
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [provider])




    if (!isCursorReady) {
        return <p>Loading real-time collaborative editor...</p>
    }


    return (
        <EditorWithCursor
            provider={provider}
            ydoc={ydoc}
            currentUser={currentUser}
            readOnly={userRole === 'viewer' ? "viewer" : ""}
        />
    )


}

export default SharedEditor