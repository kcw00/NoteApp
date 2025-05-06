import { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useEditor, EditorContent } from '@tiptap/react'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { mainExtensions } from '../extensions/Extension'
import { Collaboration } from '@tiptap/extension-collaboration'
import "../../styles/editor.css"
import suggestion from '../extensions/SlashMenu/suggestion'
import Commands from '../extensions/SlashMenu/commands'

const DefaultEditor = ({ noteId }) => {
    const collabToken = useSelector(state => state.auth.collabToken)
    const theme = useSelector(state => state.ui.theme)

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
            Commands.configure({
                suggestion,
                editor: editorInstance,
            }),
            Collaboration.configure({
                document: ydoc,
                field: "content",
            })
        ],
        editorProps: {
            attributes: {
                class: 'editor',
            },
        },
        autofocus: true,
        onCreate: ({ editor }) => {
            console.log('[Editor] Created')
            editor.storage.theme = theme
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
            <EditorContent editor={unsharedEditor} className="main-group" />
        </div>
    )
}

export default DefaultEditor
