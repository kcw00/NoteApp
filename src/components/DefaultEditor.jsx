import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEditor, EditorContent, EditorProvider } from '@tiptap/react'
import * as Y from 'yjs'
import { HocuspocusProvider, WebSocketStatus } from '@hocuspocus/provider'
import { updateNote } from '../redux/notesSlice'
// import { ySocket } from '../redux/socket'
import MenuBar from './Menubar'
import { useAtom, atom } from 'jotai'
import { useLayoutEffect } from 'react'
import { collabExtensions, mainExtensions } from './Extension'
import { IndexeddbPersistence } from 'y-indexeddb'



const DefaultEditor = ({ noteId, note }) => {
    const dispatch = useDispatch()


    const collabToken = useSelector(state => state.auth.collabToken)
    


    const ydoc = useMemo(() => new Y.Doc(), [noteId])
    const [isSynced, setSynced] = useState(false)



    const provider = new HocuspocusProvider({
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

    provider.on('synced', () => {
        console.log('Synced with remote provider')
        setSynced(true)
    })

    provider.connect()


    const unsharedEditor = useEditor({
        extensions: mainExtensions,
        immediatelyRender: true,
        shouldRerenderOnTransaction: true,
        onCreate: ({ editor }) => {
            if (editor) {
                editor.commands.setContent(note.content)
                editor.storage.noteId = noteId
            }
        },
        onUpdate: async ({ editor }) => {
            if (editor.isEmpty) return
            const editorContent = editor.getJSON()
            debouncedUpdateunSharedContent(editorContent)
        }
    })




    const debouncedUpdateunSharedContent = useCallback((content) => {
        if (!unsharedEditor) return

        // If the content is synced, we proceed with the timeout logic.
        if (isSynced) {
            // Clear any previous timeouts to prevent redundant API calls.
            clearTimeout(debouncedUpdateContent.timeout)

            // Set a new timeout for saving content (e.g., 3000 ms = 3 seconds).
            debouncedUpdateContent.timeout = setTimeout(() => {
                dispatch(updateNote({
                    id: noteId,
                    changes: { content }
                }))
                console.log('Shared note content saved:', content)
            }, 3000)  // Timeout set to 3 seconds
        }
    }, [unsharedEditor, noteId])


    return (
       <div>
            <MenuBar editor={unsharedEditor} />
            <EditorContent editor={unsharedEditor} className="main-group" />
        </div>
    )
}

export default DefaultEditor
