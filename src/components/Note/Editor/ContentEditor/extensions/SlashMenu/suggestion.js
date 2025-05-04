import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import SlashMenu from './SlashMenu'

const suggestion = {
                items: ({ query }) => {
                    return [
                        {
                            title: 'Heading 1',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
                            },
                        },
                        {
                            title: 'Heading 2',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
                            },
                        },
                        {
                            title: 'Heading 3',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
                            },
                        },
                        {
                            title: 'Paragraph',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).setNode('paragraph').run()
                            },
                        },
                        {
                            title: 'Bold',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).toggleBold().run()
                            },
                        },
                        {
                            title: 'Italic',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).toggleItalic().run()
                            },
                        },
                        {
                            title: 'Strike',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).toggleStrike().run()
                            },
                        },
                        {
                            title: 'Inline Code',
                            description: 'Toggle inline code',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).toggleCode().run()
                            },
                        },
                        {
                            title: 'Clear Marks',
                            description: 'Remove bold/italic/strike etc.',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).unsetAllMarks().run()
                            },
                        },
                        {
                            title: 'Clear Nodes',
                            description: 'Remove all block formatting',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).clearNodes().run()
                            },
                        },
                        {
                            title: 'Code Block',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
                            },
                        },
                        {
                            title: 'Bullet List',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).toggleBulletList().run()
                            },
                        },
                        {
                            title: 'Ordered List',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
                            },
                        },
                    ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
                },

                render: () => {
                    let component
                    let popup

                    return {
                        onStart: (props) => {
                            component = new ReactRenderer(SlashMenu, {
                                props: {
                                    ...props,
                                    theme: props.editor.storage.theme,
                                },
                                editor: props.editor,
                                ref: (instance) => {
                                    component.ref = instance
                                },
                            })

                            popup = tippy('body', {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                            })
                        },
                        onUpdate: (props) => {
                            component.updateProps({
                                ...props,
                                theme: props.editor.storage.theme,
                            })
                            if (!props.clientRect) {
                                return
                            }
                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
                            })
                        },
                        onKeyDown: (props) => {
                            if (props.event.key === 'Escape') {
                                popup[0].hide()
                                return true
                            }
                            return component.ref?.onKeyDown?.(props.event) || false
                        },
                        onExit() {
                            popup[0].destroy()
                            component.destroy()
                        },
                    }
                },
}

export default suggestion
