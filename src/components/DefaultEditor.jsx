import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEditor, EditorContent, EditorProvider } from '@tiptap/react'
import * as Y from 'yjs'
import { HocuspocusProvider, WebSocketStatus } from '@hocuspocus/provider'
import { updateNote } from '../redux/notesSlice'
// import { ySocket } from '../redux/socket'
import MenuBar from './Menubar'
import { mainExtensions } from './Extension'

const DefaultEditor = ({ noteId, note }) => {
    const dispatch = useDispatch()


    const collabToken = useSelector(state => state.auth.collabToken)




    const ydoc = useMemo(() => new Y.Doc(), [noteId])
    const [isSynced, setSynced] = useState(false)



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

    const unsharedEditor = useEditor({
        extensions: mainExtensions,
        immediatelyRender: true,
        shouldRerenderOnTransaction: true,
        onCreate: ({ editor }) => {
            const xml = ydoc.getXmlFragment('content')
            console.log('XML Fragment:', xml.toString())

            // Don't apply note.content if Yjs document already has synced data
            if (editor && xml.length === 0) {
                editor.commands.setContent(note.content?.default)
                editor.storage.noteId = noteId
            }
        },
        onUpdate: async ({ editor }) => {
            if (editor.isEmpty) return
            const editorContent = editor.getJSON()
            console.log('Editor content:', editorContent)
        }
    })




    // const debouncedUpdateunSharedContent = useCallback((content) => {
    //     if (!unsharedEditor) return

    //     // If the content is synced, we proceed with the timeout logic.
    //     if (isSynced) {
    //         // Clear any previous timeouts to prevent redundant API calls.
    //         clearTimeout(debouncedUpdateunSharedContent.timeout)

    //         // Set a new timeout for saving content (e.g., 3000 ms = 3 seconds).
    //         debouncedUpdateunSharedContent.timeout = setTimeout(() => {
    //             dispatch(updateNote({
    //                 id: noteId,
    //                 changes: { content }
    //             }))
    //             console.log('Shared note content saved:', content)
    //         }, 300)  // Timeout set to 3 seconds
    //     }
    // }, [unsharedEditor, noteId, isSynced, ydoc])


    return (
        <div>
            <MenuBar editor={unsharedEditor} />
            <EditorContent editor={unsharedEditor} className="main-group" />
        </div>
    )
}

export default DefaultEditor
