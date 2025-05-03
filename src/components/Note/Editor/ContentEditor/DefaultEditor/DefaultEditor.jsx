import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEditor, EditorContent, EditorProvider } from '@tiptap/react'
import * as Y from 'yjs'
import { HocuspocusProvider, WebSocketStatus } from '@hocuspocus/provider'
import { updateNote } from '../../../../../redux/notesSlice'
// import { ySocket } from '../redux/socket'
import MenuBar from '../Menubar'
import { mainExtensions } from '../Extension'
import { Collaboration } from '@tiptap/extension-collaboration'
import "../../styles/editor.css"

const DefaultEditor = ({ noteId, note }) => {
    const collabToken = useSelector(state => state.auth.collabToken)

    const ydoc = useMemo(() => new Y.Doc(), [noteId])

    const [isSynced, setSynced] = useState(false)
    const [provider, setProvider] = useState(null)
    const [editorInstance, setEditorInstance] = useState(null)

    useEffect(() => {
        if (!collabToken || !noteId) return

        const p = new HocuspocusProvider({
            url:`ws://${import.meta.env.VITE_BACKEND_ADDRESS}:1234`,
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

        })

        p.connect()
        setProvider(p)

        return () => {
            p.destroy()
            setProvider(null)
        }
    }, [collabToken, noteId])

    const unsharedEditor = useEditor({
        enableContentCheck: true,
        immediatelyRender: true,
        shouldRerenderOnTransaction: true,
        // content: note?.content?.default || '',
        extensions: [
            ...mainExtensions,
            Collaboration.configure({
                document: ydoc,
                field: "content",
            })
        ],
        autofocus: true,
        onCreate: ({ editor }) => {
            console.log('[Editor] Created')
            setEditorInstance(editor)
        },
        onUpdate: async ({ editor }) => {
            if (editor.isEmpty) return
            const editorContent = editor.getJSON()
            console.log('[Editor] JSON update:', editorContent)
            console.log('[Editor] is synced:', isSynced)
            console.log('[Editor] Yjs XML:', ydoc.getXmlFragment('content').toString())
        }
    })


    // this triggers onStoreDocument in backend/hocuspocus server
    // this is for manual saving
    // it will be called every 5 seconds
    useEffect(() => {
        if (provider) {
          const interval = setInterval(() => {
            console.log('[Manual Save] Calling provider.storeDocument()')
            provider.storeDocument?.()
          }, 5000)
          return () => clearInterval(interval)
        }
      }, [provider])


    return (
        <div>
            <MenuBar editor={unsharedEditor} />
            <EditorContent editor={unsharedEditor} className="main-group" />
        </div>
    )
}

export default DefaultEditor
