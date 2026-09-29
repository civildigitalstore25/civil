import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Unlink,
  RemoveFormatting,
  Palette
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editorHeight?: string;
  label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Type description here...',
  editorHeight = 'min-h-[160px] max-h-[320px]',
  label
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-[#F5A000] underline hover:text-amber-600 cursor-pointer'
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-2 border border-slate-200'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      Color
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Store empty content as empty string instead of `<p></p>`
      if (html === '<p></p>' || html === '<p></p>\n' || !editor.getText().trim()) {
        onChange('');
      } else {
        onChange(html);
      }
    }
  });

  // Keep editor content synced with value prop when updated externally
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHTML = editor.getHTML();
      const normalizedCurrent = currentHTML === '<p></p>' ? '' : currentHTML;
      if (normalizedCurrent !== value) {
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="h-24 bg-slate-50 animate-pulse rounded-xl border border-slate-200" />;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const colorOptions = ['#0f172a', '#F5A000', '#2563eb', '#16a34a', '#dc2626', '#9333ea', '#64748b'];

  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-xs font-bold text-slate-700 block">{label}</label>}
      <div className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-[#F5A000]/30 transition-all">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700">
          {/* Text Style: Bold, Italic, Underline */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive('bold') ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive('italic') ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive('underline') ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive('heading', { level: 3 }) ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive('heading', { level: 4 }) ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Heading 4"
            >
              <Heading4 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive('bulletList') ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive('orderedList') ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Ordered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignments */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
              }`}
              title="Align Justify"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Color palette */}
          <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5">
            <Palette className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => editor.chain().focus().setColor(c).run()}
                style={{ backgroundColor: c }}
                className="w-3.5 h-3.5 rounded-full border border-white ring-1 ring-slate-200 hover:scale-110 transition-transform cursor-pointer"
                title={`Text color ${c}`}
              />
            ))}
          </div>

          {/* Link & Image */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={setLink}
              className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                editor.isActive('link') ? 'bg-[#F5A000] text-white hover:bg-amber-600' : ''
              }`}
              title="Add Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                className="p-1.5 rounded-lg text-xs hover:bg-slate-200 text-rose-600 transition-colors"
                title="Remove Link"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={addImage}
              className="p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors"
              title="Insert Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              className="p-1.5 rounded-lg text-xs hover:bg-slate-200 text-slate-500 transition-colors"
              title="Clear Formatting"
            >
              <RemoveFormatting className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`p-3.5 overflow-y-auto ${editorHeight} text-xs font-normal text-slate-800 leading-relaxed prose prose-sm max-w-none`}>
          <EditorContent editor={editor} placeholder={placeholder} />
        </div>
      </div>
    </div>
  );
};
