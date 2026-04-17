'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'

interface Props {
  name: string
  label: string
  defaultValue?: string
}

const BTN =
  'rounded border border-neutral-300 px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-neutral-100 data-[active=true]:bg-neutral-800 data-[active=true]:text-white dark:border-neutral-600 dark:hover:bg-neutral-800'

export default function RichTextEditor({ name, label, defaultValue = '' }: Props) {
  const [html, setHtml] = useState(defaultValue)

  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'tiptap-editor min-h-[220px] rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-neutral-400/40 dark:border-neutral-600',
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.getHTML())
    },
  })

  if (!editor) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="min-h-[220px] rounded-md border border-neutral-300 bg-background px-3 py-2 text-sm text-neutral-500 dark:border-neutral-600">
          Ładowanie edytora…
        </div>
        <input type="hidden" name={name} value={html} readOnly />
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo; Quote
        </button>
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  )
}
