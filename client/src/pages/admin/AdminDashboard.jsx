import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import TiptapUnderline from '@tiptap/extension-underline'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, LogOut, Search, Filter, RefreshCw,
  ChevronDown, ChevronUp, BarChart2, FileText, Globe, Check, X,
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Code, Link2,
  Image as ImageIcon, Minus, Type, AlignLeft, Save, Send, AlertCircle, Star,
  BookOpen, Tag, Clock, Calendar, User, Users, Palette, Settings,
  MessageSquare, Upload, HelpCircle, Mail, Phone, MapPin, Ban, CheckCircle, Inbox,
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const COLORS = ['#2a8bff','#10b981','#f59e0b','#8b5cf6','#ec4899','#ef4444','#f97316','#06b6d4','#84cc16','#6366f1']
const TAGS   = ['Productivity','Growth','Sales','Marketing','Operations','Technology','Finance','HR','Strategy','General']

function token() { return localStorage.getItem('biz_admin_token') || '' }
async function api(path, opts = {}) {
  const r = await fetch(`${API}${path}`, {
    ...opts,
    credentials: 'include',   // send httpOnly cookie automatically
    headers: {
      'Content-Type': 'application/json',
      /* Also send Bearer token as fallback for dev environments where
         cross-port cookies are blocked */
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(opts.headers || {}),
    },
  })
  /* Expired/invalid token — clear localStorage and redirect to login */
  if (r.status === 401) {
    localStorage.removeItem('biz_admin_token')
    window.location.href = '/admin'
    return { success: false, error: 'Session expired. Please log in again.' }
  }
  return r.json()
}

async function logout() {
  await fetch(`${API}/api/admin/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
  localStorage.removeItem('biz_admin_token')
  window.location.href = '/admin'
}

/* ─── Cloudinary Upload ───────────────────────────────────── */
async function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = await api('/api/admin/upload', {
          method: 'POST',
          body: JSON.stringify({ data: reader.result, folder: 'bizbackerz' }),
        })
        if (data.success) resolve(data.url)
        else reject(new Error(data.error || 'Upload failed'))
      } catch (e) { reject(e) }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function ImageUploadButton({ onUploaded, label = 'Upload' }) {
  const ref = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onUploaded(url)
    } catch (err) {
      alert('Upload error: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button type="button" disabled={uploading} onClick={() => ref.current?.click()}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all duration-150 disabled:opacity-40 whitespace-nowrap flex-shrink-0">
        <Upload className="w-3.5 h-3.5" />
        {uploading ? 'Uploading…' : label}
      </button>
    </>
  )
}

/* ─── Rich Text Editor ────────────────────────────────────── */
function stripInlineColors(html) {
  return html.replace(/style="([^"]*)"/gi, (_, styles) => {
    const cleaned = styles
      .replace(/\bcolor\s*:\s*[^;]+;?\s*/gi, '')
      .replace(/\bbackground(?:-color)?\s*:\s*[^;]+;?\s*/gi, '')
      .replace(/\bfont-family\s*:\s*[^;]+;?\s*/gi, '')
      .trim().replace(/;+$/, '')
    return cleaned ? `style="${cleaned}"` : ''
  })
}

function RichEditor({ value, onChange }) {
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      /* StarterKit bundles Link/Underline in v3 — disable them so our
         explicitly-configured versions don't collide (duplicate-extension warning) */
      StarterKit.configure({ link: false, underline: false }),
      TiptapUnderline,
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      TiptapImage.configure({
        HTMLAttributes: { style: 'max-width:100%;border-radius:8px;margin:12px 0;' },
      }),
    ],
    content: stripInlineColors(value || ''),
    editorProps: {
      attributes: {
        class: 'rich-content min-h-[320px] max-h-[600px] overflow-y-auto p-5 text-[14px] text-white/75 leading-[1.9] outline-none',
        style: 'word-break:break-word;',
      },
    },
    onUpdate: ({ editor }) => onChange(stripInlineColors(editor.getHTML())),
  })

  /* Sync external value into the editor only when it genuinely differs and
     the user isn't actively typing (prevents cursor jumps / feedback loop) */
  useEffect(() => {
    if (!editor) return
    const incoming = stripInlineColors(value || '')
    if (!editor.isFocused && incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, false)
    }
  }, [value, editor])

  function handleLink() {
    if (!editor) return
    const prev = editor.getAttributes('link').href || 'https://'
    const url = window.prompt('Enter URL:', prev)
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  async function handleImage() {
    if (!editor) return
    const choice = window.confirm('Click OK to upload an image file, or Cancel to enter a URL.')
    if (choice) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        try {
          const url = await uploadImage(file)
          editor.chain().focus().setImage({ src: url, alt: 'Blog image' }).run()
        } catch (err) {
          alert('Upload error: ' + err.message)
        }
      }
      input.click()
    } else {
      const url = window.prompt('Enter image URL:')
      if (url) editor.chain().focus().setImage({ src: url, alt: 'Blog image' }).run()
    }
  }

  const ToolBtn = ({ icon: Icon, label, onPress, active }) => (
    <button
      type="button"
      title={label}
      onMouseDown={e => { e.preventDefault(); onPress?.() }}
      className={`w-7 h-7 rounded flex items-center justify-center transition-all duration-150 ${
        active ? 'text-brand-400 bg-brand-500/15' : 'text-white/50 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  )

  if (!editor) {
    return (
      <div className="rounded-xl border border-white/[0.08] min-h-[360px] flex items-center justify-center text-white/30 text-[13px]" style={{ background: 'rgba(6,15,29,0.6)' }}>
        Loading editor…
      </div>
    )
  }

  const c = () => editor.chain().focus()

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden" style={{ background: 'rgba(6,15,29,0.6)' }}>
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-white/[0.07]" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <ToolBtn icon={Bold}          label="Bold (Ctrl+B)"      active={editor.isActive('bold')}              onPress={() => c().toggleBold().run()} />
        <ToolBtn icon={Italic}        label="Italic (Ctrl+I)"    active={editor.isActive('italic')}            onPress={() => c().toggleItalic().run()} />
        <ToolBtn icon={UnderlineIcon} label="Underline (Ctrl+U)" active={editor.isActive('underline')}         onPress={() => c().toggleUnderline().run()} />
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolBtn icon={Type}          label="Heading 2"          active={editor.isActive('heading', { level: 2 })} onPress={() => c().toggleHeading({ level: 2 }).run()} />
        <ToolBtn icon={Type}          label="Heading 3"          active={editor.isActive('heading', { level: 3 })} onPress={() => c().toggleHeading({ level: 3 }).run()} />
        <ToolBtn icon={AlignLeft}     label="Paragraph"          active={editor.isActive('paragraph')}         onPress={() => c().setParagraph().run()} />
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolBtn icon={List}          label="Bullet List"        active={editor.isActive('bulletList')}        onPress={() => c().toggleBulletList().run()} />
        <ToolBtn icon={ListOrdered}   label="Numbered List"      active={editor.isActive('orderedList')}       onPress={() => c().toggleOrderedList().run()} />
        <ToolBtn icon={Quote}         label="Blockquote"         active={editor.isActive('blockquote')}        onPress={() => c().toggleBlockquote().run()} />
        <ToolBtn icon={Code}          label="Code Block"         active={editor.isActive('codeBlock')}         onPress={() => c().toggleCodeBlock().run()} />
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolBtn icon={Link2}         label="Insert Link"        active={editor.isActive('link')}              onPress={handleLink} />
        <ToolBtn icon={ImageIcon}     label="Insert Image"       onPress={handleImage} />
        <ToolBtn icon={Minus}         label="Divider"            onPress={() => c().setHorizontalRule().run()} />
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolBtn icon={RefreshCw}     label="Clear Formatting"   onPress={() => c().unsetAllMarks().clearNodes().run()} />
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

/* ─── Blog Form ───────────────────────────────────────────── */
const EMPTY = {
  title: '', slug: '', excerpt: '', content: '', tag: 'General', category: 'General',
  color: '#2a8bff', coverImage: '', coverImageAlt: '', author: 'BizBackerz Team', authorBio: '',
  readTime: 5, seoTitle: '', seoDescription: '', seoKeywords: '', focusKeyword: '',
  noindex: false, ogImage: '', ogImageAlt: '', twitterTitle: '', twitterDescription: '',
  published: false, featured: false, qna: [],
}

function BlogForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm]       = useState({ ...EMPTY, ...initial, qna: initial?.qna || [] })
  const [tab, setTab]         = useState('content')
  const [autoSlug, setAutoSlug] = useState(!initial?._id)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  useEffect(() => {
    if (autoSlug && form.title) {
      set('slug', form.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80))
    }
  }, [form.title, autoSlug])

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  /* Q&A helpers */
  function addQna() { set('qna', [...form.qna, { question: '', answer: '' }]) }
  function removeQna(i) { set('qna', form.qna.filter((_, idx) => idx !== i)) }
  function setQna(i, field, val) {
    const next = [...form.qna]
    next[i] = { ...next[i], [field]: val }
    set('qna', next)
  }

  const tabs = [
    { id: 'content',  label: 'Content',  icon: FileText },
    { id: 'qna',      label: 'Q&A',      icon: HelpCircle },
    { id: 'seo',      label: 'SEO',      icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 flex-1 justify-center ${
              tab === t.id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/25' : 'text-white/45 hover:text-white/70'
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT TAB */}
      {tab === 'content' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="lg:col-span-2 space-y-1.5">
              <label className="field-label">Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} required
                placeholder="Your blog post title…"
                className="field-input w-full text-[16px] font-semibold" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="field-label">Slug *</label>
                <button type="button" onClick={() => setAutoSlug(v => !v)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${autoSlug ? 'bg-brand-500/20 text-brand-400' : 'bg-white/5 text-white/30'}`}>
                  {autoSlug ? 'Auto' : 'Manual'}
                </button>
              </div>
              <input value={form.slug} onChange={e => { setAutoSlug(false); set('slug', e.target.value) }} required
                placeholder="blog-post-slug"
                className="field-input w-full font-mono text-[13px]" />
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Tag / Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <select value={form.tag} onChange={e => set('tag', e.target.value)} className="field-input w-full pl-9 appearance-none">
                  {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-1.5">
              <label className="field-label">Excerpt * <span className="text-white/25 font-normal">(max 400 chars)</span></label>
              <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} required rows={3}
                maxLength={400} placeholder="Brief summary shown on the blog list page…"
                className="field-input w-full resize-none" />
              <p className="text-[11px] text-white/25 text-right">{form.excerpt.length}/400</p>
            </div>

            <div className="lg:col-span-2 space-y-1.5">
              <label className="field-label">Cover Image</label>
              <div className="flex gap-3 items-center">
                <input value={form.coverImage} onChange={e => set('coverImage', e.target.value)}
                  placeholder="https://… or upload below"
                  className="field-input flex-1" />
                <ImageUploadButton label="Upload" onUploaded={url => set('coverImage', url)} />
                {form.coverImage && (
                  <img src={form.coverImage} alt="" className="w-16 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="field-label">Content *</label>
            <RichEditor value={form.content} onChange={v => set('content', v)} />
          </div>
        </div>
      )}

      {/* Q&A TAB */}
      {tab === 'qna' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-white">Q&A / FAQ</p>
              <p className="text-[12px] text-white/35">Questions and answers shown as an accordion below the blog post.</p>
            </div>
            <button type="button" onClick={addQna}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all duration-200"
              style={{ background: 'linear-gradient(135deg,#2a8bff,#1a6fd4)' }}>
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>

          {form.qna.length === 0 ? (
            <div className="text-center py-12 text-white/25 border border-dashed border-white/[0.1] rounded-xl">
              <HelpCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-[13px]">No Q&A pairs yet. Click "Add Question" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {form.qna.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/[0.07] space-y-3" style={{ background: 'rgba(6,15,29,0.5)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Q{i + 1}</span>
                    <button type="button" onClick={() => removeQna(i)}
                      className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400/60 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all duration-150">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="field-label">Question</label>
                    <input value={item.question} onChange={e => setQna(i, 'question', e.target.value)}
                      placeholder="e.g. What services does BizBackerz offer?"
                      className="field-input w-full" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="field-label">Answer</label>
                    <textarea value={item.answer} onChange={e => setQna(i, 'answer', e.target.value)} rows={3}
                      placeholder="Write the answer here…"
                      className="field-input w-full resize-none" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEO TAB */}
      {tab === 'seo' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl border border-brand-500/15 text-[12px] text-brand-400/80" style={{ background: 'rgba(42,139,255,0.05)' }}>
            If left blank, SEO fields fall back to the post title and excerpt automatically.
          </div>

          <div className="grid grid-cols-1 gap-5">

            {/* Focus keyword */}
            <div className="space-y-1.5">
              <label className="field-label">
                Focus Keyword <span className="text-red-400">*</span>
                <span className="text-white/25 font-normal"> — exact search term you're targeting</span>
              </label>
              <input value={form.focusKeyword} onChange={e => set('focusKeyword', e.target.value)}
                placeholder="e.g. virtual assistant services"
                className={`field-input w-full ${!form.focusKeyword ? 'border-red-500/30' : ''}`} />
              {!form.focusKeyword && <p className="text-[11px] text-red-400/70">⚠ Missing — required for SEO targeting</p>}
            </div>

            {/* SEO Title */}
            <div className="space-y-1.5">
              <label className="field-label">SEO Title <span className="text-white/25">(50–60 chars ideal)</span></label>
              <input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)}
                placeholder={form.title || 'Blog post title for search engines…'}
                className="field-input w-full" />
              <div className="flex justify-between text-[11px] text-white/25">
                <span>Contains focus keyword? {form.focusKeyword && (form.seoTitle || form.title).toLowerCase().includes(form.focusKeyword.toLowerCase()) ? '✅' : '❌'}</span>
                <span className={form.seoTitle.length > 60 ? 'text-red-400' : form.seoTitle.length >= 50 ? 'text-green-400' : ''}>{form.seoTitle.length}/60</span>
              </div>
            </div>

            {/* Meta description */}
            <div className="space-y-1.5">
              <label className="field-label">Meta Description <span className="text-white/25">(140–160 chars ideal)</span></label>
              <textarea value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} rows={3}
                placeholder={form.excerpt || 'Description shown in Google search results…'}
                className="field-input w-full resize-none" />
              <div className="flex justify-between text-[11px] text-white/25">
                <span>Google shows ~160 chars</span>
                <span className={form.seoDescription.length > 160 ? 'text-red-400' : form.seoDescription.length >= 140 ? 'text-green-400' : ''}>{form.seoDescription.length}/160</span>
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
              <label className="field-label">Secondary Keywords <span className="text-white/25">(comma separated)</span></label>
              <input value={form.seoKeywords} onChange={e => set('seoKeywords', e.target.value)}
                placeholder="virtual assistant, business support, delegation, productivity"
                className="field-input w-full" />
            </div>

            {/* Cover image alt text */}
            <div className="space-y-1.5">
              <label className="field-label">
                Featured Image Alt Text <span className="text-red-400">*</span>
                <span className="text-white/25 font-normal"> — max 125 chars, no "image of" or "photo of"</span>
              </label>
              <input value={form.coverImageAlt} onChange={e => set('coverImageAlt', e.target.value)}
                placeholder="e.g. Business owner delegating tasks to a virtual assistant"
                className={`field-input w-full ${!form.coverImageAlt && form.coverImage ? 'border-red-500/30' : ''}`} />
              <div className="flex justify-between text-[11px] text-white/25">
                <span>Describe the image literally, include focus keyword naturally</span>
                <span className={form.coverImageAlt.length > 125 ? 'text-red-400' : ''}>{form.coverImageAlt.length}/125</span>
              </div>
            </div>

            {/* OG Image */}
            <div className="space-y-1.5">
              <label className="field-label">OG Image <span className="text-white/25">(1200×630 for social sharing)</span></label>
              <div className="flex gap-3 items-center">
                <input value={form.ogImage} onChange={e => set('ogImage', e.target.value)}
                  placeholder={form.coverImage || 'https://…'}
                  className="field-input flex-1" />
                <ImageUploadButton label="Upload" onUploaded={url => set('ogImage', url)} />
                {(form.ogImage || form.coverImage) && (
                  <img src={form.ogImage || form.coverImage} alt="" className="w-20 h-12 rounded-lg object-cover border border-white/10 flex-shrink-0" />
                )}
              </div>
            </div>

            {/* OG Image alt */}
            <div className="space-y-1.5">
              <label className="field-label">OG Image Alt <span className="text-white/25">(shown in social share previews)</span></label>
              <input value={form.ogImageAlt} onChange={e => set('ogImageAlt', e.target.value)}
                placeholder="e.g. BizBackerz virtual assistant services"
                className="field-input w-full" />
            </div>

            {/* Twitter overrides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="field-label">Twitter/X Title <span className="text-white/25">(optional override)</span></label>
                <input value={form.twitterTitle} onChange={e => set('twitterTitle', e.target.value)}
                  placeholder={form.seoTitle || form.title || 'Twitter title…'}
                  className="field-input w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Twitter/X Description <span className="text-white/25">(optional override)</span></label>
                <input value={form.twitterDescription} onChange={e => set('twitterDescription', e.target.value)}
                  placeholder={form.seoDescription || form.excerpt || 'Twitter description…'}
                  className="field-input w-full" />
              </div>
            </div>

            {/* noindex toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <button type="button" onClick={() => set('noindex', !form.noindex)}
                className={`w-10 h-5 rounded-full transition-colors duration-200 ${form.noindex ? 'bg-red-500' : 'bg-white/15'} relative flex-shrink-0`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${form.noindex ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <div>
                <p className="text-[13px] text-white/70 font-medium">Mark as noindex</p>
                <p className="text-[11px] text-white/30">Tells Google not to index this post. Use for drafts or thin content.</p>
              </div>
            </div>

            {/* Google Preview */}
            {(form.seoTitle || form.title) && (
              <div className="p-4 rounded-xl border border-white/[0.07] space-y-1" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Google Search Preview</p>
                <p className="text-[#1a73e8] text-[16px] font-medium hover:underline">{form.seoTitle || form.title}</p>
                <p className="text-[13px] text-[#4d5156]">bizbackerz.com › blog › {form.slug || 'post-slug'}</p>
                <p className="text-[13px] text-[#4d5156] leading-[1.5]">{form.seoDescription || form.excerpt || 'Meta description will appear here…'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {tab === 'settings' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="field-label">Author</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input value={form.author} onChange={e => set('author', e.target.value)}
                  placeholder="BizBackerz Team"
                  className="field-input w-full pl-9" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Read Time (minutes)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input type="number" min={1} max={60} value={form.readTime} onChange={e => set('readTime', +e.target.value)}
                  className="field-input w-full pl-9" />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="field-label">Author Bio</label>
              <textarea value={form.authorBio} onChange={e => set('authorBio', e.target.value)} rows={2}
                placeholder="Short bio shown on the blog post page…"
                className="field-input w-full resize-none" />
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Card Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => set('color', c)}
                    className={`w-7 h-7 rounded-full transition-all duration-150 ${form.color === c ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-[#030912] scale-110' : 'opacity-70 hover:opacity-100'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Toggle label="Published" desc="Visible to all visitors" value={form.published} onChange={v => set('published', v)} />
            <Toggle label="Featured"  desc="Pinned at the top of the blog list" value={form.featured}  onChange={v => set('featured', v)} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/[0.06] mt-6">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all duration-200">
          Cancel
        </button>
        <div className="flex gap-3">
          {!form.published && (
            <button type="submit" disabled={saving} onClick={() => set('published', false)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white/60 border border-white/[0.1] hover:text-white transition-all duration-200 disabled:opacity-40">
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>
          )}
          <button type="submit" disabled={saving}
            onClick={() => set('published', true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40 transition-all duration-200"
            style={{ background: 'linear-gradient(135deg,#2a8bff,#1a6fd4)' }}>
            <Send className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : form.published ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div>
        <p className="text-[13px] font-semibold text-white">{label}</p>
        <p className="text-[11px] text-white/35">{desc}</p>
      </div>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-all duration-200 ${value ? 'bg-brand-500' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

/* ─── Blog Row ────────────────────────────────────────────── */
function BlogRow({ blog, onEdit, onDelete, onTogglePublish }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  async function doDelete() {
    setBusy(true)
    await onDelete(blog._id)
    setBusy(false)
    setConfirming(false)
  }

  return (
    <div className="flex items-start sm:items-center gap-4 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.11] transition-all duration-200 group"
      style={{ background: 'rgba(6,15,29,0.5)' }}>
      <div className="w-2 h-2 rounded-full mt-1.5 sm:mt-0 flex-shrink-0" style={{ background: blog.color }} />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="text-[14px] font-semibold text-white truncate">{blog.title}</span>
          {blog.featured && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 font-bold uppercase tracking-wider">Featured</span>}
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${blog.published ? 'bg-green-500/12 text-green-400 border border-green-500/18' : 'bg-white/5 text-white/30 border border-white/[0.07]'}`}>
            {blog.published ? 'Live' : 'Draft'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/30">
          <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{blog.tag}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime} min</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.views} views</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(blog.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span>
          {blog.qna?.length > 0 && <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" />{blog.qna.length} Q&A</span>}
        </div>
      </div>

      {confirming ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[12px] text-red-400">Delete?</span>
          <button onClick={doDelete} disabled={busy}
            className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-400 flex items-center justify-center transition-all duration-150">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setConfirming(false)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center transition-all duration-150">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => onTogglePublish(blog)} title={blog.published ? 'Unpublish' : 'Publish'}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 ${blog.published ? 'bg-green-500/12 text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-white/5 text-white/35 hover:bg-green-500/15 hover:text-green-400'}`}>
            {blog.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onEdit(blog)} title="Edit"
            className="w-7 h-7 rounded-lg bg-brand-500/12 text-brand-400 hover:bg-brand-500/25 flex items-center justify-center transition-all duration-150">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setConfirming(true)} title="Delete"
            className="w-7 h-7 rounded-lg bg-red-500/8 text-red-400/60 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all duration-150">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Review Form ─────────────────────────────────────────── */
const REVIEW_EMPTY = {
  name: '', initials: '', role: '', rating: 5, date: '', text: '',
  helpful: 0, color: '#2a8bff', verified: true, order: 0,
}

function ReviewForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...REVIEW_EMPTY, ...initial })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  useEffect(() => {
    if (!initial?._id && form.name && !form.initials) {
      set('initials', form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2))
    }
  }, [form.name])

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="field-label">Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            placeholder="e.g. John Smith"
            className="field-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Initials</label>
          <input value={form.initials} onChange={e => set('initials', e.target.value)}
            placeholder="Auto-generated from name"
            maxLength={3}
            className="field-input w-full font-mono" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Role / Badge <span className="text-white/25 font-normal">(e.g. "Local Guide" or leave empty)</span></label>
          <input value={form.role} onChange={e => set('role', e.target.value)}
            placeholder="Local Guide"
            className="field-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Date <span className="text-white/25 font-normal">(e.g. "5 months ago")</span></label>
          <input value={form.date} onChange={e => set('date', e.target.value)} required
            placeholder="5 months ago"
            className="field-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Rating</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => set('rating', n)}
                className="transition-transform duration-100 hover:scale-110">
                <Star className={`w-6 h-6 ${n <= form.rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-white/20'}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Helpful Count</label>
          <input type="number" min={0} value={form.helpful} onChange={e => set('helpful', +e.target.value)}
            className="field-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Display Order <span className="text-white/25 font-normal">(lower = first)</span></label>
          <input type="number" min={0} value={form.order} onChange={e => set('order', +e.target.value)}
            className="field-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Avatar Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => set('color', c)}
                className={`w-7 h-7 rounded-full transition-all duration-150 ${form.color === c ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-[#030912] scale-110' : 'opacity-70 hover:opacity-100'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="field-label">Review Text *</label>
        <textarea value={form.text} onChange={e => set('text', e.target.value)} required rows={5}
          placeholder="The review text as posted on Google…"
          className="field-input w-full resize-none" />
      </div>

      <Toggle label="Verified" desc="Shows a Verified badge on the review card" value={form.verified} onChange={v => set('verified', v)} />

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all duration-200">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40 transition-all duration-200"
          style={{ background: 'linear-gradient(135deg,#2a8bff,#1a6fd4)' }}>
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : initial?._id ? 'Update Review' : 'Add Review'}
        </button>
      </div>
    </form>
  )
}

/* ─── Review Row ──────────────────────────────────────────── */
function ReviewRow({ review, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  async function doDelete() {
    setBusy(true)
    await onDelete(review._id)
    setBusy(false)
    setConfirming(false)
  }

  return (
    <div className="flex items-start sm:items-center gap-4 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.11] transition-all duration-200 group"
      style={{ background: 'rgba(6,15,29,0.5)' }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
        style={{ background: `${review.color}22`, color: review.color, border: `1px solid ${review.color}35` }}>
        {review.initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="text-[14px] font-semibold text-white">{review.name}</span>
          {review.role && <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">{review.role}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/30">
          <span className="flex items-center gap-0.5">
            {Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />)}
          </span>
          <span>{review.date}</span>
          <span className="line-clamp-1 max-w-[200px] sm:max-w-xs">{review.text.slice(0, 80)}…</span>
        </div>
      </div>

      {confirming ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[12px] text-red-400">Delete?</span>
          <button onClick={doDelete} disabled={busy}
            className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-400 flex items-center justify-center transition-all duration-150">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setConfirming(false)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center transition-all duration-150">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => onEdit(review)} title="Edit"
            className="w-7 h-7 rounded-lg bg-brand-500/12 text-brand-400 hover:bg-brand-500/25 flex items-center justify-center transition-all duration-150">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setConfirming(true)} title="Delete"
            className="w-7 h-7 rounded-lg bg-red-500/8 text-red-400/60 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all duration-150">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Team Member Form ────────────────────────────────────── */
const TEAM_EMPTY = {
  name: '', position: '', email: '', description: '', specialties: [],
  socials: { linkedin: '', twitter: '', instagram: '', facebook: '', website: '' },
  avatar: '', initials: '', color: '#2a8bff', order: 0, visible: true,
}

function TeamMemberForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...TEAM_EMPTY, ...initial, socials: { ...TEAM_EMPTY.socials, ...(initial?.socials || {}) } })
  const [specInput, setSpecInput] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function setSocial(k, v) { setForm(f => ({ ...f, socials: { ...f.socials, [k]: v } })) }

  useEffect(() => {
    if (!initial?._id && form.name && !form.initials) {
      set('initials', form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2))
    }
  }, [form.name])

  function addSpecialty() {
    const s = specInput.trim()
    if (s && !form.specialties.includes(s)) set('specialties', [...form.specialties, s])
    setSpecInput('')
  }
  function removeSpecialty(s) { set('specialties', form.specialties.filter(x => x !== s)) }

  function handleSubmit(e) { e.preventDefault(); onSave(form) }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="field-label">Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            placeholder="e.g. Sarah Mitchell" className="field-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Position *</label>
          <input value={form.position} onChange={e => set('position', e.target.value)} required
            placeholder="e.g. Head of Operations" className="field-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Initials</label>
          <input value={form.initials} onChange={e => set('initials', e.target.value)}
            placeholder="Auto-generated" maxLength={3} className="field-input w-full font-mono" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="member@bizbackerz.com" className="field-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Display Order <span className="text-white/25 font-normal">(lower = first)</span></label>
          <input type="number" min={0} value={form.order} onChange={e => set('order', +e.target.value)}
            className="field-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Avatar Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => set('color', c)}
                className={`w-7 h-7 rounded-full transition-all duration-150 ${form.color === c ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-[#030912] scale-110' : 'opacity-70 hover:opacity-100'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="field-label">Bio / Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
          placeholder="Short bio shown on the About page…" className="field-input w-full resize-none" />
      </div>

      {/* Avatar */}
      <div className="space-y-1.5">
        <label className="field-label">Avatar Image URL</label>
        <div className="flex gap-2">
          <input value={form.avatar} onChange={e => set('avatar', e.target.value)}
            placeholder="https://…  (leave blank to use initials)" className="field-input flex-1" />
          <ImageUploadButton onUploaded={url => set('avatar', url)} label="Upload" />
        </div>
        {form.avatar && <img src={form.avatar} alt="preview" className="w-14 h-14 rounded-2xl object-cover mt-1" />}
      </div>

      {/* Specialties */}
      <div className="space-y-1.5">
        <label className="field-label">Specialties</label>
        <div className="flex gap-2">
          <input value={specInput} onChange={e => setSpecInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty() } }}
            placeholder="Type a specialty and press Enter" className="field-input flex-1" />
          <button type="button" onClick={addSpecialty}
            className="px-3 py-2 rounded-lg text-[12px] font-semibold text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all duration-150">
            Add
          </button>
        </div>
        {form.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.specialties.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-brand-400 border border-brand-500/25"
                style={{ background: 'rgba(42,139,255,0.08)' }}>
                {s}
                <button type="button" onClick={() => removeSpecialty(s)} className="text-white/30 hover:text-red-400 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Social links */}
      <div className="space-y-3">
        <label className="field-label">Social Links <span className="text-white/25 font-normal">(optional)</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['linkedin', 'twitter', 'instagram', 'facebook', 'website'].map(platform => (
            <div key={platform} className="space-y-1">
              <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold">{platform}</label>
              <input value={form.socials[platform]} onChange={e => setSocial(platform, e.target.value)}
                placeholder={`https://${platform}.com/…`} className="field-input w-full text-[12px]" />
            </div>
          ))}
        </div>
      </div>

      <Toggle label="Visible on site" desc="Show this member on the About page" value={form.visible} onChange={v => set('visible', v)} />

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all duration-200">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40 transition-all duration-200"
          style={{ background: 'linear-gradient(135deg,#2a8bff,#1a6fd4)' }}>
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : initial?._id ? 'Update Member' : 'Add Member'}
        </button>
      </div>
    </form>
  )
}

/* ─── Team Member Row ─────────────────────────────────────── */
function TeamMemberRow({ member, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  async function doDelete() {
    setBusy(true)
    await onDelete(member._id)
    setBusy(false)
    setConfirming(false)
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.11] transition-all duration-200 group"
      style={{ background: 'rgba(6,15,29,0.5)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0 overflow-hidden"
        style={{ background: member.avatar ? undefined : `linear-gradient(135deg,${member.color}28,${member.color}10)`, border: `1px solid ${member.color}30`, color: member.color }}>
        {member.avatar
          ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
          : member.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap text-[13px] text-white/70">
          <span className="font-semibold text-white">{member.name}</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: member.color }}>{member.position}</span>
          {!member.visible && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">Hidden</span>}
        </div>
        {member.description && (
          <p className="text-[12px] text-white/35 mt-0.5 line-clamp-1">{member.description}</p>
        )}
      </div>

      {confirming ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[12px] text-red-400">Delete?</span>
          <button onClick={doDelete} disabled={busy}
            className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-400 flex items-center justify-center transition-all duration-150">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setConfirming(false)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center transition-all duration-150">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => onEdit(member)} title="Edit"
            className="w-7 h-7 rounded-lg bg-brand-500/12 text-brand-400 hover:bg-brand-500/25 flex items-center justify-center transition-all duration-150">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setConfirming(true)} title="Delete"
            className="w-7 h-7 rounded-lg bg-red-500/8 text-red-400/60 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all duration-150">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Booking Card ────────────────────────────────────────── */
function BookingCard({ booking, onCancel, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false)
  const [confirmCan, setConfirmCan] = useState(false)
  const [busy, setBusy] = useState(false)

  const statusColors = {
    pending:   { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  text: '#f59e0b' },
    confirmed: { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)', text: '#10b981' },
    cancelled: { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.25)', text: '#ef4444' },
  }
  const sc = statusColors[booking.status] || statusColors.pending

  async function doCancel() {
    setBusy(true)
    await onCancel(booking._id)
    setBusy(false)
    setConfirmCan(false)
  }

  async function doDelete() {
    setBusy(true)
    await onDelete(booking._id)
    setBusy(false)
    setConfirmDel(false)
  }

  return (
    <div className="rounded-xl border border-white/[0.07] p-5 space-y-4 group hover:border-white/[0.12] transition-all duration-200"
      style={{ background: 'rgba(6,15,29,0.6)' }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white">{booking.name}</p>
            <p className="text-[11px] text-white/35">{new Date(booking.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
        <div className="flex items-center gap-2 text-white/55">
          <Mail className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
          <a href={`mailto:${booking.email}`} className="hover:text-brand-400 transition-colors truncate">{booking.email}</a>
        </div>
        <div className="flex items-center gap-2 text-white/55">
          <Phone className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
          <span>{booking.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-white/55">
          <MapPin className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
          <span>{booking.country}</span>
        </div>
        <div className="flex items-center gap-2 text-white/55">
          <Clock className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
          <span className="text-white/80 font-medium">{booking.slotDisplayUser}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/[0.05]">
        {confirmCan ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-amber-400">Cancel booking?</span>
            <button onClick={doCancel} disabled={busy}
              className="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-400 flex items-center justify-center transition-all duration-150">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setConfirmCan(false)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center transition-all duration-150">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : confirmDel ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-red-400">Delete permanently?</span>
            <button onClick={doDelete} disabled={busy}
              className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-400 flex items-center justify-center transition-all duration-150">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setConfirmDel(false)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center transition-all duration-150">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {booking.status !== 'cancelled' && (
              <button onClick={() => setConfirmCan(true)} title="Cancel booking"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-amber-400/70 bg-amber-500/8 border border-amber-500/15 hover:bg-amber-500/20 hover:text-amber-400 transition-all duration-150">
                <Ban className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
            <button onClick={() => setConfirmDel(true)} title="Delete"
              className="w-7 h-7 rounded-lg bg-red-500/8 text-red-400/60 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all duration-150">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Message Card ────────────────────────────────────────── */
function MessageCard({ msg, onRead, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [busy, setBusy] = useState(false)

  async function doDelete() {
    setBusy(true)
    await onDelete(msg._id)
    setBusy(false)
  }

  return (
    <div
      className={`rounded-xl border p-5 space-y-3 group transition-all duration-200 cursor-pointer hover:border-white/[0.12] ${
        !msg.read ? 'border-brand-500/25' : 'border-white/[0.07]'
      }`}
      style={{ background: msg.read ? 'rgba(6,15,29,0.6)' : 'rgba(42,139,255,0.04)' }}
      onClick={() => { setExpanded(e => !e); if (!msg.read) onRead(msg._id) }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {!msg.read && <span className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-1" />}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className={`text-[14px] font-semibold ${msg.read ? 'text-white/80' : 'text-white'}`}>{msg.name}</p>
              <a href={`mailto:${msg.email}`} onClick={e => e.stopPropagation()}
                className="text-[12px] text-brand-400/70 hover:text-brand-400 transition-colors">{msg.email}</a>
              {msg.phone && <span className="text-[12px] text-white/35">{msg.phone}</span>}
            </div>
            <p className="text-[11px] text-white/30 mt-0.5">
              {new Date(msg.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {confirmDel ? (
            <>
              <span className="text-[12px] text-red-400">Delete?</span>
              <button onClick={doDelete} disabled={busy}
                className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-400 flex items-center justify-center transition-all duration-150">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setConfirmDel(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center transition-all duration-150">
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button onClick={() => setConfirmDel(true)} title="Delete"
                className="w-7 h-7 rounded-lg bg-red-500/8 text-red-400/60 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all duration-150">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <p className={`text-[13px] leading-relaxed ${expanded ? 'text-white/70 whitespace-pre-wrap' : 'text-white/50 line-clamp-2'}`}>
        {msg.message}
      </p>

      <div className="flex items-center justify-between">
        <button onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
          className="text-[11px] text-white/30 hover:text-white/60 transition-colors">
          {expanded ? '↑ Show less' : '↓ Read more'}
        </button>
        {!msg.read && (
          <button onClick={e => { e.stopPropagation(); onRead(msg._id) }}
            className="flex items-center gap-1.5 text-[11px] text-brand-400/60 hover:text-brand-400 transition-colors">
            <Check className="w-3 h-3" /> Mark as read
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Main Dashboard ──────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [section, setSection]   = useState('blogs')   // blogs | reviews

  /* ── Blog state ── */
  const [blogs, setBlogs]       = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [view, setView]         = useState('list')   // list | form
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)

  /* ── Review state ── */
  const [reviews, setReviews]         = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewView, setReviewView]   = useState('list')   // list | form
  const [editingReview, setEditingReview] = useState(null)
  const [reviewSaving, setReviewSaving]   = useState(false)

  /* ── Team state ── */
  const [teamMembers, setTeamMembers]       = useState([])
  const [teamLoading, setTeamLoading]       = useState(false)
  const [teamView, setTeamView]             = useState('list')   // list | form
  const [editingMember, setEditingMember]   = useState(null)
  const [memberSaving, setMemberSaving]     = useState(false)

  /* ── Bookings state ── */
  const [bookings, setBookings]             = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingFilter, setBookingFilter]   = useState('all')

  /* ── Messages state ── */
  const [messages, setMessages]             = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [unreadCount, setUnreadCount]       = useState(0)

  const [toast, setToast] = useState(null)

  const blogStats = {
    total: total,
    published: blogs.filter(b => b.published).length,
    drafts: blogs.filter(b => !b.published).length,
    featured: blogs.filter(b => b.featured).length,
  }

  /* ── Auth check ── */
  useEffect(() => {
    if (!localStorage.getItem('biz_admin_token')) navigate('/admin', { replace: true })
  }, [navigate])

  /* ── Fetch blogs ── */
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: 50 })
      if (search)              params.set('search', search)
      if (tagFilter !== 'all') params.set('tag', tagFilter)
      const data = await api(`/api/admin/blogs?${params}`)
      if (!data.success) throw new Error(data.error)
      setBlogs(data.blogs || [])
      setTotal(data.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, tagFilter])

  useEffect(() => { load() }, [load])

  /* ── Fetch reviews ── */
  const loadReviews = useCallback(async () => {
    setReviewsLoading(true)
    try {
      const data = await api('/api/admin/reviews')
      if (data.success) setReviews(data.reviews || [])
    } catch {}
    finally { setReviewsLoading(false) }
  }, [])

  useEffect(() => { if (section === 'reviews') loadReviews() }, [section, loadReviews])

  /* ── Fetch team ── */
  const loadTeam = useCallback(async () => {
    setTeamLoading(true)
    try {
      const data = await api('/api/admin/team')
      if (data.success) setTeamMembers(data.members || [])
    } catch {}
    finally { setTeamLoading(false) }
  }, [])

  useEffect(() => { if (section === 'team') loadTeam() }, [section, loadTeam])

  /* ── Fetch bookings ── */
  const loadBookings = useCallback(async () => {
    setBookingsLoading(true)
    try {
      const params = new URLSearchParams({ limit: 100 })
      if (bookingFilter !== 'all') params.set('status', bookingFilter)
      const data = await api(`/api/admin/bookings?${params}`)
      if (data.success) setBookings(data.bookings || [])
    } catch {}
    finally { setBookingsLoading(false) }
  }, [bookingFilter])

  useEffect(() => { if (section === 'bookings') loadBookings() }, [section, loadBookings])

  /* ── Fetch messages ── */
  const loadMessages = useCallback(async () => {
    setMessagesLoading(true)
    try {
      const data = await api('/api/admin/messages?limit=100')
      if (data.success) {
        setMessages(data.messages || [])
        setUnreadCount(data.unread || 0)
      }
    } catch {}
    finally { setMessagesLoading(false) }
  }, [])

  useEffect(() => { if (section === 'messages') loadMessages() }, [section, loadMessages])

  /* ── Fetch unread count on mount (for badge) ── */
  useEffect(() => {
    api('/api/admin/messages?limit=1').then(d => { if (d.success) setUnreadCount(d.unread || 0) }).catch(() => {})
  }, [])


  /* ── Save blog ── */
  async function handleSave(form) {
    setSaving(true)
    try {
      let data
      if (editing?._id) {
        data = await api(`/api/admin/blogs/${editing._id}`, { method: 'PUT', body: JSON.stringify(form) })
      } else {
        data = await api('/api/admin/blogs', { method: 'POST', body: JSON.stringify(form) })
      }
      if (!data.success) throw new Error(data.error)
      showToast(editing?._id ? 'Post updated!' : 'Post created!', 'success')
      setView('list')
      setEditing(null)
      load()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete blog ── */
  async function handleDelete(id) {
    const data = await api(`/api/admin/blogs/${id}`, { method: 'DELETE' })
    if (data.success) { showToast('Post deleted.', 'success'); load() }
    else showToast(data.error, 'error')
  }

  /* ── Toggle publish ── */
  async function handleTogglePublish(blog) {
    const data = await api(`/api/admin/blogs/${blog._id}`, {
      method: 'PUT', body: JSON.stringify({ published: !blog.published }),
    })
    if (data.success) { showToast(data.blog.published ? 'Published!' : 'Unpublished.', 'success'); load() }
    else showToast(data.error, 'error')
  }

  /* ── Save review ── */
  async function handleSaveReview(form) {
    setReviewSaving(true)
    try {
      let data
      if (editingReview?._id) {
        data = await api(`/api/admin/reviews/${editingReview._id}`, { method: 'PUT', body: JSON.stringify(form) })
      } else {
        data = await api('/api/admin/reviews', { method: 'POST', body: JSON.stringify(form) })
      }
      if (!data.success) throw new Error(data.error)
      showToast(editingReview?._id ? 'Review updated!' : 'Review added!', 'success')
      setReviewView('list')
      setEditingReview(null)
      loadReviews()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setReviewSaving(false)
    }
  }

  /* ── Delete review ── */
  async function handleDeleteReview(id) {
    const data = await api(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    if (data.success) { showToast('Review deleted.', 'success'); loadReviews() }
    else showToast(data.error, 'error')
  }

  /* ── Save team member ── */
  async function handleSaveMember(form) {
    setMemberSaving(true)
    try {
      let data
      if (editingMember?._id) {
        data = await api(`/api/admin/team/${editingMember._id}`, { method: 'PUT', body: JSON.stringify(form) })
      } else {
        data = await api('/api/admin/team', { method: 'POST', body: JSON.stringify(form) })
      }
      if (!data.success) throw new Error(data.error)
      showToast(editingMember?._id ? 'Member updated!' : 'Member added!', 'success')
      setTeamView('list')
      setEditingMember(null)
      loadTeam()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setMemberSaving(false)
    }
  }

  /* ── Delete team member ── */
  async function handleDeleteMember(id) {
    const data = await api(`/api/admin/team/${id}`, { method: 'DELETE' })
    if (data.success) { showToast('Member deleted.', 'success'); loadTeam() }
    else showToast(data.error, 'error')
  }

  /* ── Cancel booking ── */
  async function handleCancelBooking(id) {
    const data = await api(`/api/admin/bookings/${id}/cancel`, { method: 'PATCH' })
    if (data.success) { showToast('Booking cancelled.', 'success'); loadBookings() }
    else showToast(data.error, 'error')
  }

  /* ── Delete booking ── */
  async function handleDeleteBooking(id) {
    const data = await api(`/api/admin/bookings/${id}`, { method: 'DELETE' })
    if (data.success) { showToast('Booking deleted.', 'success'); loadBookings() }
    else showToast(data.error, 'error')
  }

  /* ── Mark message as read ── */
  async function handleMarkRead(id) {
    const data = await api(`/api/admin/messages/${id}/read`, { method: 'PATCH' })
    if (data.success) {
      setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  /* ── Delete message ── */
  async function handleDeleteMessage(id) {
    const msg = messages.find(m => m._id === id)
    const data = await api(`/api/admin/messages/${id}`, { method: 'DELETE' })
    if (data.success) {
      showToast('Message deleted.', 'success')
      if (msg && !msg.read) setUnreadCount(prev => Math.max(0, prev - 1))
      loadMessages()
    } else showToast(data.error, 'error')
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* logout() is the module-level function above — clears cookie + localStorage */

  /* ── Blog form view ── */
  if (section === 'blogs' && view === 'form') {
    return (
      <div className="min-h-screen bg-[#030912] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>
                {editing?._id ? 'Edit Post' : 'New Post'}
              </h1>
              <p className="text-[12px] text-white/35">Fill in the details below to {editing?._id ? 'update' : 'create'} your blog post.</p>
            </div>
            <button onClick={() => { setView('list'); setEditing(null) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white/50 border border-white/[0.08] hover:text-white transition-all duration-200">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.07] p-6 sm:p-8" style={{ background: 'rgba(6,15,29,0.8)' }}>
            <BlogForm initial={editing} onSave={handleSave} onCancel={() => { setView('list'); setEditing(null) }} saving={saving} />
          </div>
        </div>
        {toast && <Toast {...toast} />}
      </div>
    )
  }

  /* ── Review form view ── */
  if (section === 'reviews' && reviewView === 'form') {
    return (
      <div className="min-h-screen bg-[#030912] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>
                {editingReview?._id ? 'Edit Review' : 'Add Review'}
              </h1>
              <p className="text-[12px] text-white/35">Enter the details from the Google review.</p>
            </div>
            <button onClick={() => { setReviewView('list'); setEditingReview(null) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white/50 border border-white/[0.08] hover:text-white transition-all duration-200">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.07] p-6 sm:p-8" style={{ background: 'rgba(6,15,29,0.8)' }}>
            <ReviewForm initial={editingReview} onSave={handleSaveReview} onCancel={() => { setReviewView('list'); setEditingReview(null) }} saving={reviewSaving} />
          </div>
        </div>
        {toast && <Toast {...toast} />}
      </div>
    )
  }

  /* ── Team member form view ── */
  if (section === 'team' && teamView === 'form') {
    return (
      <div className="min-h-screen bg-[#030912] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>
                {editingMember?._id ? 'Edit Team Member' : 'Add Team Member'}
              </h1>
              <p className="text-[12px] text-white/35">Fill in the details for this team member.</p>
            </div>
            <button onClick={() => { setTeamView('list'); setEditingMember(null) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white/50 border border-white/[0.08] hover:text-white transition-all duration-200">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.07] p-6 sm:p-8" style={{ background: 'rgba(6,15,29,0.8)' }}>
            <TeamMemberForm initial={editingMember} onSave={handleSaveMember} onCancel={() => { setTeamView('list'); setEditingMember(null) }} saving={memberSaving} />
          </div>
        </div>
        {toast && <Toast {...toast} />}
      </div>
    )
  }

  const navItems = [
    { id: 'blogs',    icon: BookOpen,      label: 'Blog Posts' },
    { id: 'reviews',  icon: MessageSquare, label: 'Reviews' },
    { id: 'team',     icon: Users,         label: 'Team' },
    { id: 'bookings', icon: Calendar,      label: 'Bookings' },
    { id: 'messages', icon: Inbox,         label: 'Messages', badge: unreadCount },
  ]

  return (
    <div className="min-h-screen bg-[#030912]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-32 top-0 w-[40rem] h-[40rem] rounded-full blur-[180px]" style={{ background: 'rgba(42,139,255,0.06)' }} />
      </div>

      <div className="relative z-10 flex min-h-screen">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-white/[0.06]" style={{ background: 'rgba(6,15,29,0.9)' }}>
          <div className="p-5 border-b border-white/[0.06]">
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 16, color: '#f1f5f9', letterSpacing: '0.07em' }}>
              BIZBACKERZ
            </div>
            <p className="text-[9px] text-white/25 tracking-[0.2em] uppercase mt-0.5">Admin Panel</p>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => (
              <div key={item.id} onClick={() => setSection(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                  section === item.id ? 'bg-brand-500/15 text-brand-400' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
            ))}
          </nav>

          <div className="p-3 border-t border-white/[0.06]">
            <button onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white/35 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]" style={{ background: 'rgba(6,15,29,0.7)' }}>
            {/* Mobile nav tabs */}
            <div className="flex items-center gap-3">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setSection(item.id)}
                  className={`relative flex items-center gap-2 text-[13px] font-semibold transition-colors duration-150 ${section === item.id ? 'text-brand-400' : 'text-white/30 hover:text-white/60'}`}>
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center sm:hidden">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={
                section === 'blogs'    ? load :
                section === 'reviews'  ? loadReviews :
                section === 'team'     ? loadTeam :
                section === 'bookings' ? loadBookings :
                loadMessages
              }
                className="w-8 h-8 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all duration-150">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button onClick={logout} className="lg:hidden w-8 h-8 rounded-lg bg-white/5 text-white/40 hover:text-red-400 flex items-center justify-center transition-all duration-150">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* ════ BLOGS SECTION ════ */}
            {section === 'blogs' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Posts', value: blogStats.total,     icon: FileText,  color: '#2a8bff' },
                    { label: 'Published',   value: blogStats.published, icon: Globe,     color: '#10b981' },
                    { label: 'Drafts',      value: blogStats.drafts,    icon: FileText,  color: '#f59e0b' },
                    { label: 'Featured',    value: blogStats.featured,  icon: Star,      color: '#8b5cf6' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-white/[0.07] p-4" style={{ background: 'rgba(6,15,29,0.7)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] text-white/35 font-semibold uppercase tracking-[0.12em]">{s.label}</p>
                        <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                      </div>
                      <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search posts…"
                      className="field-input w-full pl-10" />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="field-input pl-9 pr-8 appearance-none">
                      <option value="all">All Tags</option>
                      {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <button onClick={() => { setEditing(null); setView('form') }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white whitespace-nowrap transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg,#2a8bff,#1a6fd4)' }}>
                    <Plus className="w-4 h-4" /> New Post
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="text-center py-20 text-white/25">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-[14px] font-semibold">No blog posts yet</p>
                    <p className="text-[12px] mt-1">Create your first post or seed the database with existing static blogs.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {blogs.map(b => (
                      <BlogRow key={b._id} blog={b}
                        onEdit={blog => { setEditing(blog); setView('form') }}
                        onDelete={handleDelete}
                        onTogglePublish={handleTogglePublish} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ════ REVIEWS SECTION ════ */}
            {section === 'reviews' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[15px] font-bold text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>Google Reviews</h2>
                    <p className="text-[12px] text-white/35">{reviews.length} review{reviews.length !== 1 ? 's' : ''} · shown on the Reviews page</p>
                  </div>
                  <button onClick={() => { setEditingReview(null); setReviewView('form') }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white whitespace-nowrap transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg,#2a8bff,#1a6fd4)' }}>
                    <Plus className="w-4 h-4" /> Add Review
                  </button>
                </div>

                {reviewsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-20 text-white/25">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-[14px] font-semibold">No reviews yet</p>
                    <p className="text-[12px] mt-1">Add reviews from Google to display them on the Reviews page.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {reviews.map(r => (
                      <ReviewRow key={r._id} review={r}
                        onEdit={review => { setEditingReview(review); setReviewView('form') }}
                        onDelete={handleDeleteReview} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ════ TEAM SECTION ════ */}
            {section === 'team' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[15px] font-bold text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>Team Members</h2>
                    <p className="text-[12px] text-white/35">{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} · shown on the About page</p>
                  </div>
                  <button onClick={() => { setEditingMember(null); setTeamView('form') }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white whitespace-nowrap transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg,#2a8bff,#1a6fd4)' }}>
                    <Plus className="w-4 h-4" /> Add Member
                  </button>
                </div>

                {teamLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-20 text-white/25">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-[14px] font-semibold">No team members yet</p>
                    <p className="text-[12px] mt-1">Add team members to display them on the About page.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {teamMembers.map(m => (
                      <TeamMemberRow key={m._id} member={m}
                        onEdit={member => { setEditingMember(member); setTeamView('form') }}
                        onDelete={handleDeleteMember} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ════ BOOKINGS SECTION ════ */}
            {section === 'bookings' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total',     value: bookings.length,                                        icon: Calendar,     color: '#2a8bff' },
                    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length,  icon: CheckCircle,  color: '#10b981' },
                    { label: 'Pending',   value: bookings.filter(b => b.status === 'pending').length,    icon: Clock,        color: '#f59e0b' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-white/[0.07] p-4" style={{ background: 'rgba(6,15,29,0.7)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] text-white/35 font-semibold uppercase tracking-[0.12em]">{s.label}</p>
                        <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                      </div>
                      <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3">
                  {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
                    <button key={f} onClick={() => setBookingFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all duration-150 ${
                        bookingFilter === f
                          ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                          : 'text-white/35 border border-white/[0.07] hover:text-white/70 hover:border-white/20'
                      }`}>
                      {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-20 text-white/25">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-[14px] font-semibold">No bookings yet</p>
                    <p className="text-[12px] mt-1">Bookings submitted via the website will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map(b => <BookingCard key={b._id} booking={b} onCancel={handleCancelBooking} onDelete={handleDeleteBooking} />)}
                  </div>
                )}
              </>
            )}

            {/* ════ MESSAGES SECTION ════ */}
            {section === 'messages' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[15px] font-bold text-white" style={{ fontFamily: "'Poppins',sans-serif" }}>Contact Messages</h2>
                    <p className="text-[12px] text-white/35">
                      {messages.length} message{messages.length !== 1 ? 's' : ''}
                      {unreadCount > 0 && <span className="ml-2 text-red-400 font-semibold">· {unreadCount} unread</span>}
                    </p>
                  </div>
                </div>

                {messagesLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-20 text-white/25">
                    <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-[14px] font-semibold">No messages yet</p>
                    <p className="text-[12px] mt-1">Contact form submissions will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map(m => <MessageCard key={m._id} msg={m} onRead={handleMarkRead} onDelete={handleDeleteMessage} />)}
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>

      {toast && <Toast {...toast} />}
    </div>
  )
}

function Toast({ msg, type }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold shadow-2xl border transition-all duration-300 ${
      type === 'success' ? 'bg-green-500/15 border-green-500/25 text-green-400' : 'bg-red-500/15 border-red-500/25 text-red-400'
    }`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </div>
  )
}
