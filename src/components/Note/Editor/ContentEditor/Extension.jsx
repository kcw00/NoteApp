import { StarterKit } from '@tiptap/starter-kit'
import { Highlight } from '@tiptap/extension-highlight'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { Placeholder } from '@tiptap/extension-placeholder'


export const mainExtensions = [
    StarterKit.configure({ history: false }),
    Highlight,
    TaskList,
    TaskItem,
    CharacterCount.extend().configure({ limit: 10000 }),
    Placeholder.configure({
        placeholder: ({ node }) => {
            if (node.type.name === 'heading') {
                return 'Heading'
            }
            if (node.type.name === 'paragraph') {
                return 'Write something...'
            }
        },
        includeChildren: true,
        showOnlyWhenEditable: true,
    }),
]

export const collabExtensions = ({ hocuspocusProvider, currentUser, ydoc }) => [
    Collaboration.configure({ document: ydoc }),
    CollaborationCursor.configure({
        provider: hocuspocusProvider,
        user: {
            name: currentUser.name,
            color: currentUser.color,
        }
    })
]