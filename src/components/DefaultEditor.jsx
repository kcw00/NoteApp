import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { updateNote } from '../redux/notesSlice'
import { socket } from '../redux/socket'
import MenuBar from './Menubar'

const DefaultEditor = () => {

    const dispatch = useDispatch()

    const noteId = useSelector(state => state.notes.activeNoteId)
    const note = useSelector(state => state.notes.entities[noteId])

    setCurrentUser({ name: 'User', color: getRandomColor() })

    // Initialize socket.io connection
    const initializeSocketIo = () => {
        socket.on('noteUpdated', (data) => {
            dispatch(updateNote({
                id: noteId,
                changes: data
            }))
        })
        console.log('Socket.io connected for unshared note')
    }

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ history: false }),
            Placeholder.configure({
                placeholder:
                    'Write something … \n\n',
            }),
        ],
        content: note.content,
    })

    useEffect(() => {
        initializeSocketIo()

        return () => {
            if (socket) {
                socket.off('noteUpdated')
            }
        }
    }, [])

    const handleEditorUpdate = useCallback((content) => {
        dispatch(updateNote({
            id: noteId,
            changes: { content }
        }))
        console.log('Unshared note content saved:', content)
    }, [dispatch, noteId])

    useEffect(() => {
        if (!editor) return
        editor.on('update', () => handleEditorUpdate(editor.getJSON()))
        return () => {
            if (editor) {
                editor.off('update', handleEditorUpdate)
            }
        }
    }, [editor, handleEditorUpdate])

    if (!editor) return null

    return (
        <div className="column-half">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="main-group" />
        </div>
    )
}

export default DefaultEditor
