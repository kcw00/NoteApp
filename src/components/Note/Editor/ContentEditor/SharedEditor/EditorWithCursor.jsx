import { useEditor, EditorContent } from '@tiptap/react'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { mainExtensions } from '../Extension'
import MenuBar from '../Menubar'

const EditorWithCursor = ({ noteId, note, provider, ydoc, currentUser }) => {
  const extensions = [
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
      console.log('[Shared Editor] Created with cursor')
      console.log('[Extensions]', editor.extensionManager.extensions.map(ext => ext.name))
    },
    onUpdate: ({ editor }) => {
        if (editor.isEmpty) return
        const editorContent = editor.getJSON()
        console.log('[Shared Editor] JSON update:', editorContent)
    },
  })

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default EditorWithCursor
