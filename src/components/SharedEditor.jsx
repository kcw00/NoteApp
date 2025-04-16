import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEditor, EditorContent, EditorProvider } from '@tiptap/react'

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { HocuspocusProvider, WebSocketStatus } from '@hocuspocus/provider'
import { updateNote } from '../redux/notesSlice'
// import { ySocket } from '../redux/socket'
import MenuBar from './Menubar'
import * as awarenessProtocol from 'y-protocols/awareness'
import { setActiveUsers } from '../redux/notesSlice'
import { useAtom, atom } from 'jotai'
import { useLayoutEffect } from 'react'
import { collabExtensions, mainExtensions } from './Extension'
import { IndexeddbPersistence } from 'y-indexeddb'
import axios from 'axios'

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
    console.log('NOTE ID from sharedEditor: ', noteId)
    const note = useSelector(state => state.notes.entities[noteId])
    const activeUsers = useSelector(state => state.notes.activeUsers)
    const user = useSelector(state => state.auth.user)
    const isType = note.collaborators.find(collab => collab.userId === user.userId)?.userType


    const getRandomName = () => getRandomElement(activeUsers)

    const getInitialUser = () => {
        return {
            name: getRandomName(),
            color: getRandomColor(),
        }
    }


    const getCollabToken = async () => {
        const token = await axios.post('api/collab', {
            noteId: noteId,
            userId: user.userId,
            permissions: (isType === 'viewer') ? 'read' : 'write'
        })

        setToken(token.data.token)
        return token.data.token
    }

    const [token, setToken] = useState(getCollabToken())
    console.log('Token: ', token)

    const yjsConnectionStatusAtom = atom('')

    const ydoc = useMemo(() => new Y.Doc(), [noteId])
    const [currentUser, setCurrentUser] = useState(getInitialUser)
    const [isLocalSynced, setLocalSynced] = useState(false)
    const [isRemoteSynced, setRemoteSynced] = useState(false)
    const [yjsConnectionStatus, setYjsConnectionStatus] = useAtom(yjsConnectionStatusAtom)
    const [isCollabReady, setIsCollabReady] = useState(false)


    const localProvider = useMemo(() => {
        const provider = new IndexeddbPersistence(noteId, ydoc);

        provider.on("synced", () => {
            setLocalSynced(true);
        });

        return provider;
    }, [noteId, ydoc]);


    const remoteProvider = useMemo(() => {
        const provider = new HocuspocusProvider({
            url: 'ws://localhost:1234',
            name: noteId,
            document: ydoc,
            token: token,
            awareness: new awarenessProtocol.Awareness(ydoc),
            connect: false,
            preserveConnection: false,
            onStatus: (status) => {
                if (status.status === 'connected')
                    setYjsConnectionStatus(status.status)
            }
        })
        provider.on('synced', () => {
            setRemoteSynced(true)
        })
        provider.on('disconnect', () => {
            setYjsConnectionStatus(WebSocketStatus.Disconnected)
        })

        return provider
    }, [noteId, ydoc, token])

    useLayoutEffect(() => {
        console.log('useLayoutEffect called')
        remoteProvider.connect()

        return () => {
            setRemoteSynced(false)
            setLocalSynced(false)
            remoteProvider.destroy()
            localProvider.destroy()
        }
    }, [remoteProvider, localProvider])

    /*
    const awareness = remoteProvider.awareness
    awareness.setLocalStateField('user', {
        name: currentUser.name,
        color: currentUser.color,
    })
    awareness.on('update', () => {
        const states = awareness.getStates()
        const users = Object.values(states).map((state) => {
            const user = state.user
            return {
                name: user.name,
                color: user.color,
            }
        })
        dispatch(setActiveUsers(users))
    })
        */

    const extensions = useMemo(() => {
        return [
            ...mainExtensions,
            ...collabExtensions({
                provider: remoteProvider,
                user: currentUser,
            })
        ]

    }, [ydoc, noteId, remoteProvider, currentUser])


    const editor = useEditor({
        enableContentCheck: true,
        onContentError: ({ disableCollaboration }) => {
            disableCollaboration()
        },
        immediatelyRender: true,
        shouldRerenderOnTransaction: true,
        extensions: extensions,
        onCreate: ({ editor }) => {
            if (editor) {
                editor.commands.setContent(note.content)
                editor.storage.noteId = noteId
            }
        },
        onUpdate: async ({ editor }) => {
            if (editor.isEmpty) return;
            const editorContent = editor.getJSON()
            debouncedUpdateContent(editorContent)
        }
    })


    useEffect(() => {
        console.log('useEffect1 called')
        if (remoteProvider?.status === WebSocketStatus.Connecting) {
            const timeout = setTimeout(() => {
                setYjsConnectionStatus(WebSocketStatus.Disconnected);
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [remoteProvider.status]);

    const isSynced = isLocalSynced && isRemoteSynced;

    useEffect(() => {
        console.log('useEffect2 called')
        const collabReadyTimeout = setTimeout(() => {
            if (
                !isCollabReady &&
                isSynced &&
                remoteProvider?.status === WebSocketStatus.Connected
            ) {
                setIsCollabReady(true);
            }
        }, 5000);
        return () => clearTimeout(collabReadyTimeout);
    }, [isLocalSynced, isRemoteSynced, remoteProvider?.status, isCollabReady]);


    const debouncedUpdateContent = useCallback((content) => {
        if (!editor) return;

        // If the content is synced, we proceed with the timeout logic.
        if (isSynced) {
            // Clear any previous timeouts to prevent redundant API calls.
            clearTimeout(debouncedUpdateContent.timeout);

            // Set a new timeout for saving content (e.g., 3000 ms = 3 seconds).
            debouncedUpdateContent.timeout = setTimeout(() => {
                dispatch(updateNote({
                    id: noteId,
                    changes: { content }
                }));
                console.log('Shared note content saved:', content);
            }, 3000);  // Timeout set to 3 seconds
        }
    }, [editor, isLocalSynced, isRemoteSynced, noteId]);


    return (
        isCollabReady ? (<div>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="main-group" />
        </div>) : (<div>
            <EditorProvider extensions={mainExtensions} content={note?.content} className="main-group"></EditorProvider>
        </div>)
    )
}

export default SharedEditor
