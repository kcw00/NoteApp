import { StarterKit } from '@tiptap/starter-kit'
import { Highlight } from '@tiptap/extension-highlight'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'


export const mainExtensions = [
    StarterKit.configure({ history: false }),
    Highlight,
    TaskList,
    TaskItem,
    CharacterCount.extend().configure({ limit: 10000 }),
    Placeholder.configure({
        placeholder: ({ node }) => {
            if (node.type.name === 'paragraph') {
                return 'Write, press / for commands...'
            }
        },
        includeChildren: true,
        showOnlyWhenEditable: true,
    }),
]
