import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, LogOut, Search, Filter, RefreshCw,
  ChevronDown, ChevronUp, BarChart2, FileText, Globe, Check, X,
  Bold, Italic, Underline, List, ListOrdered, Quote, Code, Link2,
  Image, Minus, Type, AlignLeft, Save, Send, AlertCircle, Star,
  BookOpen, Tag, Clock, Calendar, User, Users, Palette, Settings,
  MessageSquare, Upload, HelpCircle,
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const COLORS = ['#2a8bff','#10b981','#f59e0b','#8b5cf6','#ec4899','#ef4444','#f97316','#06b6d4','#84cc16','#6366f1']
const TAGS   = ['Productivity','Growth','Sales','Marketing','Operations','Technology','Finance','HR','Strategy','General']

function token() { return localStorage.getItem('biz_admin_token') || '' }
async function api(path, opts = {}) {
  const r = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
  })
  return r.json()
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
function RichEditor({ value, onChange }) {
  const ref = useRef(null)
  const synced = useRef(false)

  useEffect(() => {
    if (ref.current && !synced.current) {
      ref.current.innerHTML = value || ''
      synced.current = true
    }
  }, [value])

  function exec(cmd, val = null) {
    ref.current?.focus()
    document.execCommand(cmd, false, val)
    sync()
  }

  function sync() {
    onChange(ref.current?.innerHTML || '')
  }

  function insertHTML(html) {
    ref.current?.focus()
    document.execCommand('insertHTML', false, html)
    sync()
  }

  function handleLink() {
    const url = window.prompt('Enter URL:', 'https://')
    if (url) exec('createLink', url)
  }

  async function handleImage() {
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
          insertHTML(`<img src="${url}" alt="Blog image" style="max-width:100%;border-radius:8px;margin:12px 0;" />`)
        } catch (err) {
          alert('Upload error: ' + err.message)
        }
      }
      input.click()
    } else {
      const url = window.prompt('Enter image URL:')
      if (url) insertHTML(`<img src="${url}" alt="Blog image" style="max-width:100%;border-radius:8px;margin:12px 0;" />`)
    }
  }

  const ToolBtn = ({ icon: Icon, cmd, val, label, onPress }) => (
    <button
      type="button"
      title={label}
      onMouseDown={e => { e.preventDefault(); onPress ? onPress() : exec(cmd, val) }}
      className="w-7 h-7 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  )

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden" style={{ background: 'rgba(6,15,29,0.6)' }}>
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-white/[0.07]" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <ToolBtn icon={Bold}         cmd="bold"        label="Bold (Ctrl+B)" />
        <ToolBtn icon={Italic}       cmd="italic"      label="Italic (Ctrl+I)" />
        <ToolBtn icon={Underline}    cmd="underline"   label="Underline (Ctrl+U)" />
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolBtn icon={Type}         cmd="formatBlock" val="h2"        label="Heading 2" />
        <ToolBtn icon={Type}         cmd="formatBlock" val="h3"        label="Heading 3" />
        <ToolBtn icon={AlignLeft}    cmd="formatBlock" val="p"         label="Paragraph" />
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolBtn icon={List}         cmd="insertUnorderedList"   label="Bullet List" />
        <ToolBtn icon={ListOrdered}  cmd="insertOrderedList"    label="Numbered List" />
        <ToolBtn icon={Quote}        cmd="formatBlock" val="blockquote" label="Blockquote" />
        <ToolBtn icon={Code}         cmd="formatBlock" val="pre"       label="Code Block" />
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolBtn icon={Link2}        cmd=""   label="Insert Link"   onPress={handleLink} />
        <ToolBtn icon={Image}        cmd=""   label="Insert Image"  onPress={handleImage} />
        <ToolBtn icon={Minus}        cmd="insertHorizontalRule" label="Divider" />
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolBtn icon={RefreshCw}    cmd="removeFormat" label="Clear Formatting" />
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        className="rich-content min-h-[320px] max-h-[600px] overflow-y-auto p-5 text-[14px] text-white/75 leading-[1.9] outline-none"
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  )
}

/* ─── Blog Form ───────────────────────────────────────────── */
const EMPTY = {
  title: '', slug: '', excerpt: '', content: '', tag: 'General', category: 'General',
  color: '#2a8bff', coverImage: '', author: 'BizBackerz Team', authorBio: '',
  readTime: 5, seoTitle: '', seoDescription: '', seoKeywords: '', ogImage: '',
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
            <div className="space-y-1.5">
              <label className="field-label">SEO Title <span className="text-white/25">(50-60 chars ideal)</span></label>
              <input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)}
                placeholder={form.title || 'Blog post title for search engines…'}
                className="field-input w-full" />
              <div className="flex justify-between text-[11px] text-white/25">
                <span>Google shows ~60 chars</span>
                <span className={form.seoTitle.length > 60 ? 'text-red-400' : ''}>{form.seoTitle.length}/60</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Meta Description <span className="text-white/25">(150-160 chars ideal)</span></label>
              <textarea value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} rows={3}
                placeholder={form.excerpt || 'Description shown in Google search results…'}
                className="field-input w-full resize-none" />
              <div className="flex justify-between text-[11px] text-white/25">
                <span>Google shows ~160 chars</span>
                <span className={form.seoDescription.length > 160 ? 'text-red-400' : ''}>{form.seoDescription.length}/160</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Keywords <span className="text-white/25">(comma separated)</span></label>
              <input value={form.seoKeywords} onChange={e => set('seoKeywords', e.target.value)}
                placeholder="virtual assistant, business support, delegation, productivity"
                className="field-input w-full" />
            </div>

            <div className="space-y-1.5">
              <label className="field-label">OG Image <span className="text-white/25">(1200×630 recommended)</span></label>
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

            {(form.seoTitle || form.title) && (
              <div className="p-4 rounded-xl border border-white/[0.07] space-y-1" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Google Preview</p>
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

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function logout() {
    localStorage.removeItem('biz_admin_token')
    navigate('/admin', { replace: true })
  }

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
    { id: 'blogs',   icon: BookOpen,      label: 'Blog Posts' },
    { id: 'reviews', icon: MessageSquare, label: 'Reviews' },
    { id: 'team',    icon: Users,         label: 'Team' },
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
                <item.icon className="w-4 h-4" />
                {item.label}
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
                  className={`flex items-center gap-2 text-[13px] font-semibold transition-colors duration-150 ${section === item.id ? 'text-brand-400' : 'text-white/30 hover:text-white/60'}`}>
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={section === 'blogs' ? load : section === 'reviews' ? loadReviews : loadTeam}
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
