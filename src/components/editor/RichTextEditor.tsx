'use client'

import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Youtube from '@tiptap/extension-youtube'
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  Quote, Undo, Redo, Link as LinkIcon, Image, AlignLeft,
  AlignCenter, AlignRight, Video, Loader2,
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadingRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || 'Tulis konten di sini...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Youtube.configure({ inline: false, width: 640, height: 390 }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3 text-gray-200',
      },
    },
  })

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Masukkan URL:')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadingRef.current = true

    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'editor')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      editor.chain().focus().setImage({ src: url }).run()
    }
    uploadingRef.current = false
    if (fileRef.current) fileRef.current.value = ''
  }

  const addYoutube = () => {
    const url = window.prompt('Masukkan URL YouTube:')
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  const ToolButton = ({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-all text-sm ${active ? 'bg-emerald-600/30 text-emerald-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-white/10 bg-white/[0.02]">
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic size={16} />
        </ToolButton>
        <span className="w-px h-5 bg-white/10 mx-1" />
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <Heading3 size={16} />
        </ToolButton>
        <span className="w-px h-5 bg-white/10 mx-1" />
        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          <Quote size={16} />
        </ToolButton>
        <span className="w-px h-5 bg-white/10 mx-1" />
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}>
          <AlignLeft size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}>
          <AlignCenter size={16} />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}>
          <AlignRight size={16} />
        </ToolButton>
        <span className="w-px h-5 bg-white/10 mx-1" />
        <ToolButton onClick={addLink} active={editor.isActive('link')}>
          <LinkIcon size={16} />
        </ToolButton>
        <ToolButton onClick={() => fileRef.current?.click()}>
          {uploadingRef.current ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
        </ToolButton>
        <ToolButton onClick={addYoutube} active={editor.isActive('youtube')}>
          <Video size={16} />
        </ToolButton>
        <div className="ml-auto flex items-center gap-0.5">
          <ToolButton onClick={() => editor.chain().focus().undo().run()}>
            <Undo size={16} />
          </ToolButton>
          <ToolButton onClick={() => editor.chain().focus().redo().run()}>
            <Redo size={16} />
          </ToolButton>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
