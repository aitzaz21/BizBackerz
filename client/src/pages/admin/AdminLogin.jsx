import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  // redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('biz_admin_token')) navigate('/admin/dashboard', { replace: true })
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Login failed.'); return }
      localStorage.setItem('biz_admin_token', data.token)
      navigate('/admin/dashboard', { replace: true })
    } catch {
      setError('Cannot reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030912] px-4">
      {/* ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-32 top-0 w-[40rem] h-[40rem] rounded-full blur-[180px]"
          style={{ background: 'rgba(42,139,255,0.08)' }} />
        <div className="absolute right-[-8rem] bottom-0 w-[30rem] h-[30rem] rounded-full blur-[150px]"
          style={{ background: 'rgba(56,217,169,0.06)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 22, color: '#f1f5f9', letterSpacing: '0.07em' }}>
            BIZBACKERZ
          </div>
          <div style={{ height: 1, margin: '6px auto', width: 120, background: 'linear-gradient(90deg,rgba(42,139,255,0.65),rgba(56,217,169,0.45),transparent)' }} />
          <p className="text-[11px] text-white/30 tracking-[0.22em] uppercase mt-1" style={{ fontFamily: "'Poppins',sans-serif" }}>
            Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden"
          style={{ background: 'rgba(6,15,29,0.8)', backdropFilter: 'blur(24px)' }}>
          <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(42,139,255,0.5),transparent)' }} />

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Poppins',sans-serif" }}>
                Sign in
              </h1>
              <p className="text-[13px] text-white/40">Manage your blog and content.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.12em]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="admin@bizbackerz.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-brand-500/50 focus:bg-white/[0.06] transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.12em]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-11 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-brand-500/50 focus:bg-white/[0.06] transition-all duration-200"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-[14px] text-white transition-all duration-200 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#2a8bff,#1a6fd4)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-white/20 mt-6">
          BizBackerz Admin · Private Access Only
        </p>
      </div>
    </div>
  )
}
