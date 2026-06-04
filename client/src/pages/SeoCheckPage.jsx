import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/* ── Blocked in production ── */
if (!import.meta.env.DEV) {
  throw new Error('SEO Check page is dev-only.')
}

/* ── Strip HTML tags and get plain text ── */
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function countWords(html = '') {
  return stripHtml(html).split(/\s+/).filter(Boolean).length
}

/* ── SEO check rules ── */
function runChecks(post) {
  const seoTitle   = post.seoTitle || post.title || ''
  const seoDesc    = post.seoDescription || post.excerpt || ''
  const wordCount  = countWords(post.content)

  return [
    {
      key:     'focusKeyword',
      label:   'Focus keyword set',
      pass:    !!post.focusKeyword,
      warn:    !post.focusKeyword,
      detail:  post.focusKeyword || 'Missing — set the primary search term',
    },
    {
      key:     'seoTitle',
      label:   'SEO title (50–60 chars)',
      pass:    seoTitle.length >= 50 && seoTitle.length <= 60,
      warn:    seoTitle.length > 0 && (seoTitle.length < 50 || seoTitle.length > 60),
      detail:  `${seoTitle.length} chars${seoTitle ? ` — "${seoTitle}"` : ' — missing'}`,
    },
    {
      key:     'metaDesc',
      label:   'Meta description (140–160 chars)',
      pass:    seoDesc.length >= 140 && seoDesc.length <= 160,
      warn:    seoDesc.length > 0 && (seoDesc.length < 140 || seoDesc.length > 160),
      detail:  `${seoDesc.length} chars`,
    },
    {
      key:     'excerpt',
      label:   'Excerpt filled in',
      pass:    !!post.excerpt && post.excerpt.length > 20,
      warn:    false,
      detail:  post.excerpt ? `${post.excerpt.length} chars` : 'Missing — causes nav HTML bleed if empty',
    },
    {
      key:     'coverImageAlt',
      label:   'Featured image alt text',
      pass:    !!post.coverImageAlt,
      warn:    !!post.coverImage && !post.coverImageAlt,
      detail:  post.coverImageAlt || (post.coverImage ? 'Cover image has no alt text' : 'No cover image'),
    },
    {
      key:     'focusInTitle',
      label:   'Focus keyword in SEO title',
      pass:    !!(post.focusKeyword && seoTitle.toLowerCase().includes(post.focusKeyword.toLowerCase())),
      warn:    !!post.focusKeyword && !seoTitle.toLowerCase().includes(post.focusKeyword.toLowerCase()),
      detail:  post.focusKeyword ? (seoTitle.toLowerCase().includes(post.focusKeyword.toLowerCase()) ? '✓ Found' : `"${post.focusKeyword}" not found in title`) : 'Set focus keyword first',
    },
    {
      key:     'wordCount',
      label:   'Word count ≥ 800',
      pass:    wordCount >= 800,
      warn:    wordCount >= 400 && wordCount < 800,
      detail:  `${wordCount} words`,
    },
    {
      key:     'tag',
      label:   'Category/tag set',
      pass:    !!post.tag && post.tag !== 'General',
      warn:    post.tag === 'General',
      detail:  post.tag || 'Missing',
    },
    {
      key:     'ogImage',
      label:   'OG image set',
      pass:    !!(post.ogImage || post.coverImage),
      warn:    false,
      detail:  post.ogImage ? 'Custom OG image' : post.coverImage ? 'Using cover image' : 'No OG image',
    },
  ]
}

function score(checks) {
  const passed = checks.filter(c => c.pass).length
  return Math.round((passed / checks.length) * 100)
}

function ScoreRing({ pct }) {
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 text-lg font-bold"
        style={{ borderColor: color, color }}>
        {pct}
      </div>
      <span className="text-[10px] text-white/40 uppercase tracking-widest">Score</span>
    </div>
  )
}

function CheckRow({ check }) {
  const Icon = check.pass ? CheckCircle : check.warn ? AlertCircle : XCircle
  const color = check.pass ? 'text-green-400' : check.warn ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
      <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${color}`} />
      <div className="min-w-0">
        <span className="text-[12px] text-white/70">{check.label}</span>
        {check.detail && <span className="text-[11px] text-white/35 ml-2">{check.detail}</span>}
      </div>
    </div>
  )
}

export default function SeoCheckPage() {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all') /* all | fail | warn | pass */

  async function load() {
    setLoading(true)
    try {
      const token = localStorage.getItem('biz_admin_token') || ''
      const res = await fetch(`${API}/api/admin/blogs?page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setPosts(data.blogs || [])
    } catch {/* no admin token — try public API */
      const res = await fetch(`${API}/api/blogs?limit=100`)
      const data = await res.json()
      if (data.success) setPosts(data.blogs || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const postsWithChecks = posts.map(p => {
    const checks = runChecks(p)
    return { ...p, checks, score: score(checks) }
  }).sort((a, b) => a.score - b.score)

  const filtered = postsWithChecks.filter(p => {
    if (filter === 'pass') return p.score === 100
    if (filter === 'fail') return p.score < 60
    if (filter === 'warn') return p.score >= 60 && p.score < 100
    return true
  })

  const avgScore = postsWithChecks.length
    ? Math.round(postsWithChecks.reduce((s, p) => s + p.score, 0) / postsWithChecks.length)
    : 0

  return (
    <div className="min-h-screen bg-[#030912] text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                DEV ONLY
              </span>
              <span className="text-white/30 text-[12px]">Not visible in production</span>
            </div>
            <h1 className="text-2xl font-bold text-white">SEO Check Dashboard</h1>
            <p className="text-white/40 text-[13px] mt-1">{posts.length} posts · Avg score: {avgScore}%</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/blog" className="text-[12px] text-brand-400 flex items-center gap-1 hover:text-brand-300">
              View Blog <ExternalLink className="w-3 h-3" />
            </Link>
            <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'All Posts',    value: postsWithChecks.length,                          color: '#2a8bff', key: 'all' },
            { label: '✅ All Pass',  value: postsWithChecks.filter(p => p.score === 100).length, color: '#10b981', key: 'pass' },
            { label: '⚠ Warnings',  value: postsWithChecks.filter(p => p.score >= 60 && p.score < 100).length, color: '#f59e0b', key: 'warn' },
            { label: '❌ Failing',   value: postsWithChecks.filter(p => p.score < 60).length, color: '#ef4444', key: 'fail' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`p-4 rounded-xl border text-left transition-all ${filter === s.key ? 'border-white/20 bg-white/5' : 'border-white/[0.06] hover:border-white/10'}`}>
              <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-white/40 uppercase tracking-widest">{s.label}</div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20 text-white/40">Loading posts…</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-white/40">No posts in this filter.</div>
        )}

        {/* Post cards */}
        <div className="space-y-4">
          {filtered.map(post => (
            <div key={post._id} className="rounded-2xl border border-white/[0.07] overflow-hidden"
              style={{ background: 'rgba(6,15,29,0.6)' }}>
              {/* Post header */}
              <div className="flex items-start gap-5 p-5">
                <ScoreRing pct={post.score} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-[14px] font-semibold text-white truncate">{post.title}</h3>
                    {!post.published && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/8 text-white/40">Draft</span>
                    )}
                    {post.noindex && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/20">noindex</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-white/30">
                    <span>/blog/{post.slug}</span>
                    {post.focusKeyword && <span>🎯 {post.focusKeyword}</span>}
                    <span>{post.tag}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-[11px] text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                    Preview
                  </a>
                </div>
              </div>
              {/* Checks */}
              <div className="px-5 pb-4 border-t border-white/[0.04]">
                <div className="mt-3 grid sm:grid-cols-2 gap-x-8">
                  {post.checks.map(c => <CheckRow key={c.key} check={c} />)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-white/20 mt-8">
          /seo-check · Dev only · Log in to admin to see draft posts
        </p>
      </div>
    </div>
  )
}
