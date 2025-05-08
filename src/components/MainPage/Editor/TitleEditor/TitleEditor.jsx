import { useEditor, EditorContent } from '@tiptap/react'
import { useMemo, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Text from '@tiptap/extension-text'
import Collaboration from '@tiptap/extension-collaboration'
import Placeholder from '@tiptap/extension-placeholder'
import { titleUpdated } from '../../../../redux/notesSlice'
import "../styles/editor.css"

const TitleEditor = ({ noteId, note }) => {
    const dispatch = useDispatch()

    const collabToken = useSelector(state => state.auth.collabToken)
    const user = useSelector(state => state.auth.user)

    const ydoc = useMemo(() => new Y.Doc(), [noteId])

    const [isSynced, setSynced] = useState(false)

    const userRole = useMemo(() => {
        if (!note || !user) return null
        if (note.creator === user.userId) return 'creator'
        const match = note.collaborators.find(c => c.userId === user.userId)
        return match?.userType || null
    }, [note, user])

    useEffect(() => {
        if (!noteId || !collabToken) return

        const p = new HocuspocusProvider({
            url: `ws://${import.meta.env.VITE_BACKEND_ADDRESS}:1234`,
            name: noteId,
            document: ydoc,
            token: collabToken,
            connect: false,
            preserveConnection: false,
            onAuthenticationFailed: (error) => {
                console.error('[TitleEditor] Authentication failed:', error)
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

        return () => {
            p.destroy()
        }
    }, [noteId, collabToken])

    const editor = useEditor({
        immediatelyRender: true,
        shouldRerenderOnTransaction: false,
        editable: userRole === 'viewer' ? false : true,
        extensions: [
            Document.extend({
                content: 'heading',
            }),
            Heading.configure({
                levels: [1],
            }),
            Text,
            Placeholder.configure({
                placeholder: 'Untitled',
                showOnlyWhenEditable: false,
            }),
            Collaboration.configure({
                document: ydoc,
                field: 'title', // add title field
            }),
        ],
        onCreate: () => {
            console.log('[TitleEditor] Created')
        },
        onUpdate: ({ editor }) => {
            if (editor.isEmpty) return
            const titleJSON = editor.getJSON()
            const titleText = editor.getText().trim()
            console.log('[TitleEditor] JSON update:', titleJSON)
            console.log('[TitleEditor] is synced:', isSynced)
            console.log('[TitleEditor] Yjs XML:', ydoc.getXmlFragment('title').toString())
            dispatch(titleUpdated({ noteId, title: titleText }))
        },
        editorProps: {
            attributes: {
              class: 'content-editor',
            },
          },
    })

    return <EditorContent editor={editor} />
}

export default TitleEditor
