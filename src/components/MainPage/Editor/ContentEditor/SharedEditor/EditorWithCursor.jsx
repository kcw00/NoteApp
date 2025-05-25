import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { mainExtensions } from '../extensions/Extension'
import suggestion from '../extensions/SlashMenu/suggestion'
import Commands from '../extensions/SlashMenu/commands'

const EditorWithCursor = ({ provider, ydoc, currentUser, readOnly }) => {

  const [editorInstance, setEditorInstance] = useState(null)

  const extensions = [
    ...mainExtensions,
    Commands.configure({
      suggestion,
      editor: editorInstance,
    }),
    Collaboration.configure({
      document: ydoc,
      field: "content"
    }),
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
    editable: readOnly ? false : true,
    extensions,
    autofocus: true,
    onCreate: ({ editor }) => {
      console.log('[Shared Editor] Created with cursor')
      setEditorInstance(editor)
      //console.log('[Extensions]', editor.extensionManager.extensions.map(ext => ext.name))
    },
    onUpdate: ({ editor }) => {
      if (editor.isEmpty) return
      const editorContent = editor.getJSON()
      //console.log('[Shared Editor] JSON update:', editorContent)
    },
    editorProps: {
      attributes: {
        class: 'content-editor',
      },
    },
  })

  return (
    <div className="editor-container">
      <EditorContent editor={editor} />
    </div>
  )
}

export default EditorWithCursor
