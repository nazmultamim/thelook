'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Heading2, Heading3, Minus
} from 'lucide-react'

function ToolbarBtn({ active, onClick, children, title }) {
  return (
    <button type="button" title={title} onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] transition-colors border-none cursor-pointer
        ${active ? 'bg-[#d97845] text-white' : 'bg-transparent text-[#6b5244] hover:bg-[#f5ede4]'}`}>
      {children}
    </button>
  )
}

// Full list of editor content styles — Tailwind resets strip ul/ol/li
// by default, so we re-apply them using arbitrary variant selectors.
const EDITOR_CLASS = [
  'min-h-[220px] outline-none text-[14px] text-[#2c1a0e] leading-relaxed px-4 py-3',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2',
  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2',
  '[&_li]:my-1 [&_li]:pl-1',
  '[&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:text-[#2c1a0e] [&_h2]:my-3',
  '[&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-[#2c1a0e] [&_h3]:my-2',
  '[&_p]:my-1',
  '[&_hr]:my-4 [&_hr]:border-[#e8d9cc]',
  '[&_strong]:font-bold',
  '[&_em]:italic',
  '[&_u]:underline',
].join(' ')

export default function TipTapEditor({ value, onChange, placeholder = 'Write product details…' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: EDITOR_CLASS },
    },
  })
  const lastSyncedValue = useRef(value || '')

  useEffect(() => {
    if (!editor) return

    const nextValue = value || ''
    const currentValue = editor.getHTML()

    if (!nextValue && editor.isEmpty) {
      lastSyncedValue.current = nextValue
      return
    }

    if (nextValue === currentValue || nextValue === lastSyncedValue.current) {
      return
    }

    lastSyncedValue.current = nextValue
    editor.commands.setContent(nextValue, false)
  }, [editor, value])

  if (!editor) return null

  return (
    <div className="border border-[#e8d9cc] rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-[#f0e8e0] bg-[#fdf8f3]">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={14} />
        </ToolbarBtn>

        <div className="w-px h-5 bg-[#e8d9cc] mx-1" />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={14} />
        </ToolbarBtn>

        <div className="w-px h-5 bg-[#e8d9cc] mx-1" />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
          <ListOrdered size={14} />
        </ToolbarBtn>

        <div className="w-px h-5 bg-[#e8d9cc] mx-1" />

        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
          <AlignLeft size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
          <AlignCenter size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
          <AlignRight size={14} />
        </ToolbarBtn>

        <div className="w-px h-5 bg-[#e8d9cc] mx-1" />

        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus size={14} />
        </ToolbarBtn>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
