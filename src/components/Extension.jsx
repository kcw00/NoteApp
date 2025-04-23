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
        placeholder:
            'Write something … \n\n',
    }),
]

export const collabExtensions = ({ hocuspocusProvider, currentUser }) => [
    Collaboration.extend().configure({ document: hocuspocusProvider.document }),
    CollaborationCursor.extend().configure({
        provider: hocuspocusProvider,
        user: {
            name: currentUser.name,
            color: currentUser.color,
        }
    })
]