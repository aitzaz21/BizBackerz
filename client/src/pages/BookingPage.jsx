import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  Calendar, Clock, User, CheckCircle, Mail, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, AlertCircle, Globe, Phone as PhoneIcon, MapPin,
  Sparkles
} from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import RobotCursorTracker from '../components/ui/RobotCursorTracker'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── Timezone options ────────────────────────────────────────
const TIMEZONE_GROUPS = [
  {
    group: '🇺🇸 United States',
    options: [
      { label: 'Eastern Time (ET)',  value: 'America/New_York' },
      { label: 'Central Time (CT)',  value: 'America/Chicago' },
      { label: 'Mountain Time (MT)', value: 'America/Denver' },
      { label: 'Pacific Time (PT)',  value: 'America/Los_Angeles' },
      { label: 'Alaska (AKT)',       value: 'America/Anchorage' },
      { label: 'Hawaii (HST)',       value: 'Pacific/Honolulu' },
    ],
  },
  {
    group: '🌍 International',
    options: [
      { label: 'Toronto / Ottawa (ET)',   value: 'America/Toronto' },
      { label: 'Vancouver (PT)',          value: 'America/Vancouver' },
      { label: 'London (GMT/BST)',        value: 'Europe/London' },
      { label: 'Berlin / Paris (CET)',    value: 'Europe/Berlin' },
      { label: 'Dubai (GST)',             value: 'Asia/Dubai' },
      { label: 'Pakistan (PKT)',          value: 'Asia/Karachi' },
      { label: 'India (IST)',             value: 'Asia/Kolkata' },
      { label: 'Singapore (SGT)',         value: 'Asia/Singapore' },
      { label: 'Sydney (AEST)',           value: 'Australia/Sydney' },
    ],
  },
]

const ALL_TZ = TIMEZONE_GROUPS.flatMap(g => g.options)

const COUNTRIES = [
  'United States','United Kingdom','Canada','Australia','New Zealand',
  'Germany','France','Netherlands','Sweden','Norway','Denmark','Spain','Italy',
  'UAE','Saudi Arabia','Qatar','Kuwait','Bahrain','Oman',
  'Pakistan','India','Bangladesh','Sri Lanka','Nepal',
  'Nigeria','Ghana','Kenya','South Africa','Egypt',
  'Singapore','Malaysia','Philippines','Indonesia',
  'Brazil','Mexico','Argentina','Colombia',
  'Other',
]

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ─── Helpers ─────────────────────────────────────────────────

function detectTimezone() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return ALL_TZ.find(t => t.value === tz) ? tz : 'America/New_York'
}

/* Determine Eastern Time UTC offset (4 for EDT, 5 for EST) for a given date */
function getETOffset(dateStr) {
  const testUTC = new Date(`${dateStr}T16:00:00Z`) // 4pm UTC as reference
  const etHour = parseInt(
    testUTC.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false })
  )
  // If 4pm UTC shows as 12pm ET → offset is 4 (EDT); if 11am ET → offset is 5 (EST)
  return 16 - (etHour < 0 ? etHour + 24 : etHour)
}

/* Generate 30-min slots from 11:00 AM to 8:00 PM Eastern Time */
function generateSlots(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const offset = getETOffset(dateStr)
  // 11am ET in UTC
  const startUTCHour = 11 + offset
  // 8pm ET in UTC (end exclusive)
  const endUTCHour   = 20 + offset
  const slots = []
  for (let h = startUTCHour; h < endUTCHour; h++) {
    for (const min of [0, 30]) {
      const utcH = h % 24
      const dayAdd = Math.floor(h / 24)
      slots.push(new Date(Date.UTC(y, m - 1, d + dayAdd, utcH, min, 0)))
    }
  }
  return slots
}

function fmtTime(utc, tz) {
  return utc.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz })
}

function fmtDate(utc, tz) {
  return utc.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: tz })
}

function fmtSlotDisplay(utc, tz) {
  const date = utc.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz })
  const time = fmtTime(utc, tz)
  const tzAbbr = utc.toLocaleTimeString('en-US', { timeZoneName: 'short', timeZone: tz }).split(' ').pop()
  return `${date} · ${time} ${tzAbbr}`
}

function todayStr() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`
}

// ─── 3D Tilt & Spotlight Component ───────────────────────────
function TiltCard({ children, className = '' }) {
  const cardRef  = useRef(null)
  const spotRef  = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    x.set(mx / rect.width - 0.5)
    y.set(my / rect.height - 0.5)
    if (spotRef.current) {
      spotRef.current.style.opacity = '1'
      spotRef.current.style.background = `radial-gradient(350px circle at ${mx}px ${my}px, rgba(42,139,255,0.13), transparent 40%)`
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    if (spotRef.current) spotRef.current.style.opacity = '0'
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative ${className} group`}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full relative">
        <div
          ref={spotRef}
          className="pointer-events-none absolute -inset-px z-0 mix-blend-screen"
          style={{ opacity: 0, transition: 'opacity 0.3s', borderRadius: 'inherit' }}
        />
        {children}
      </div>
    </motion.div>
  )
}

// ─── Custom Animated Input ───────────────────────────────────
function AnimatedInput({ label, icon: Icon, required, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative group">
      <label className={`block text-[12px] font-body font-bold uppercase tracking-widest mb-2.5 transition-colors duration-300 ${isFocused ? 'text-brand-400' : 'text-white/40'}`}>
        {Icon ? (
          <span className="flex items-center gap-1.5">
            <Icon className={`w-3.5 h-3.5 transition-colors duration-300 ${isFocused ? 'text-brand-400' : 'text-white/40'}`} /> 
            {label} {required && <span className="text-brand-400">*</span>}
          </span>
        ) : (
          <>{label} {required && <span className="text-brand-400">*</span>}</>
        )}
      </label>
      <div className="relative overflow-hidden rounded-xl border border-white/10 group-hover:border-white/20 transition-colors duration-300 bg-white/[0.03]">
        <input 
          onFocus={() => setIsFocused(true)} 
          onBlur={() => setIsFocused(false)} 
          className="w-full bg-transparent px-4 py-4 text-[14px] text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.03] transition-all duration-300 font-body relative z-10" 
          {...props} 
        />
        <motion.div 
          initial={false}
          animate={{ scaleX: isFocused ? 1 : 0, opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ originX: 0 }}
          className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-500 via-brand-300 to-transparent z-20"
        />
      </div>
    </div>
  )
}

// ─── Custom Dropdown ─────────────────────────────────────────
function CustomDropdown({ value, options, onChange, label, icon: Icon = Globe }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const selectedLabel = options.flatMap(g => g.options || [g]).find(o => o.value === value)?.label || 'Select'

  return (
    <div className="relative z-50">
      <label className={`flex items-center justify-center gap-1.5 text-[12px] font-body font-bold uppercase tracking-widest mb-3 transition-colors duration-300 ${isOpen || isFocused ? 'text-brand-400' : 'text-white/40'}`}>
        <Icon className={`w-3.5 h-3.5 transition-colors duration-300 ${isOpen || isFocused ? 'text-brand-400' : 'text-brand-400/50'}`} /> {label}
      </label>
      <div className="relative overflow-hidden rounded-xl border transition-colors duration-300 bg-white/[0.03] group hover:border-white/20" style={{ borderColor: isOpen || isFocused ? 'rgba(42,139,255,0.5)' : 'rgba(255,255,255,0.1)' }}>
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full flex items-center justify-between px-4 py-3.5 text-[14px] text-white hover:bg-white/[0.03] transition-all duration-300 shadow-inner relative z-10`}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronRight className={`w-4 h-4 text-white/50 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-90 text-brand-400' : ''}`} />
        </button>
        <motion.div 
          initial={false}
          animate={{ scaleX: isOpen || isFocused ? 1 : 0, opacity: isOpen || isFocused ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ originX: 0 }}
          className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-500 via-brand-300 to-transparent z-20 pointer-events-none"
        />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#081226]/95 border border-white/10 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.6)] max-h-72 overflow-y-auto custom-scrollbar z-[100]"
          >
            {options.map((group, i) => (
              <div key={i} className="mb-3 last:mb-0">
                {group.group && <div className="px-3 py-1.5 text-[11px] font-bold text-brand-400/60 uppercase tracking-wider">{group.group}</div>}
                {(group.options || [group]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setIsOpen(false) }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] font-body transition-all duration-200 ${value === opt.value ? 'bg-gradient-to-r from-brand-500/20 to-transparent border-l-2 border-brand-400 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Particle Effects ────────────────────────────────────────
function Sparks({ onComplete }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.5, 0],
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            opacity: [1, 1, 0]
          }}
          transition={{ duration: 0.6 + Math.random() * 0.4, ease: "easeOut" }}
          onAnimationComplete={i === 0 ? onComplete : undefined}
          className="absolute w-2 h-2 rounded-full bg-accent-400 shadow-[0_0_15px_rgba(56,217,169,1)]"
        />
      ))}
    </div>
  )
}

// ─── Background effect ───────────────────────────────────────
function Starfield() {
  const stars = useMemo(() => Array.from({ length: 25 }).map((_, id) => ({
    id,
    x: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: (Math.random() * 15 + 10).toFixed(1),
    delay: -(Math.random() * 20).toFixed(1),
    color: Math.random() > 0.5 ? 'rgba(42,139,255,0.7)' : 'rgba(139,92,246,0.7)',
  })), [])
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            bottom: '-10%',
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            animationName: 'starfall',
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
      <style>{`@keyframes starfall{0%{transform:translateY(0);opacity:0}10%{opacity:.8}90%{opacity:.8}100%{transform:translateY(-110vh);opacity:0}}`}</style>
    </div>
  )
}

function PageBackground() {
  return (
    <>
      <Starfield />
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(42,139,255,0.07) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,217,169,0.05) 0%, transparent 65%)' }} />
      </div>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '64px 64px' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#030912]/20 via-[#030912]/60 to-[#030912] pointer-events-none" />
      </div>
    </>
  )
}

// ─── Progress indicator ──────────────────────────────────────
const STEPS = [
  { icon: Calendar, label: 'Date & Time' },
  { icon: User,     label: 'Your Details' },
  { icon: Mail,     label: 'Confirmation' },
]

function ProgressBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 sm:mb-12 relative z-10 w-full max-w-2xl mx-auto">
      {STEPS.map((s, i) => {
        const n = i + 1
        const done = current > n
        const active = current === n
        const Icon = s.icon
        return (
          <React.Fragment key={i}>
            <motion.div
              initial={false}
              animate={{ scale: active ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center gap-3 relative"
            >
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: done ? 'rgba(56,217,169,0.15)' : active ? 'rgba(42,139,255,0.2)' : 'rgba(255,255,255,0.03)',
                  borderColor: done ? 'rgba(56,217,169,0.4)' : active ? 'rgba(42,139,255,0.6)' : 'rgba(255,255,255,0.1)',
                  boxShadow: active ? '0 0 20px rgba(42,139,255,0.3)' : 'none'
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border transition-colors duration-500 relative z-10 overflow-hidden"
              >
                {active && (
                  <motion.div
                    layoutId="activeStepGlow"
                    className="absolute inset-0 bg-brand-500/20 blur-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  initial={false}
                  animate={{ scale: done ? [0.8, 1.2, 1] : 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10"
                >
                  {done
                    ? <CheckCircle className="w-5 h-5 text-accent-400" />
                    : <Icon className={`w-5 h-5 ${active ? 'text-brand-400' : 'text-white/30'}`} />
                  }
                </motion.div>
              </motion.div>
              <div className="hidden sm:block">
                <p className={`text-[10px] uppercase tracking-wider font-body font-bold transition-colors duration-300 ${active ? 'text-brand-400' : 'text-white/30'}`}>Step {n}</p>
                <p className={`text-[14px] font-display font-semibold transition-colors duration-300 ${active ? 'text-white' : done ? 'text-white/60' : 'text-white/30'}`}>
                  {s.label}
                </p>
              </div>
            </motion.div>
            {i < STEPS.length - 1 && (
              <div className="relative h-1 w-8 sm:w-16 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
                <motion.div
                  initial={false}
                  animate={{ width: current > n ? '100%' : '0%' }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand-500 to-accent-400 shadow-[0_0_10px_rgba(56,217,169,0.5)]"
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Calendar grid ───────────────────────────────────────────
function CalendarGrid({ selected, onSelect }) {
  const today = todayStr()
  const [view, setView] = useState(() => {
    const n = new Date()
    return { year: n.getFullYear(), month: n.getMonth() }
  })

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const firstDow    = new Date(view.year, view.month, 1).getDay()

  const canPrev = view.year > new Date().getFullYear() || view.month > new Date().getMonth()

  const prev = () => setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })
  const next = () => setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })

  return (
    <div className="relative z-10">
      {/* Month header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prev} disabled={!canPrev}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
            ${canPrev ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-white/10 cursor-not-allowed'}`}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-white text-[16px] tracking-wide">
          {MONTH_NAMES[view.month]} {view.year}
        </span>
        <button onClick={next}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map(l => (
          <div key={l} className="h-8 flex items-center justify-center text-[12px] font-body font-bold text-white/30 uppercase tracking-wider">
            {l}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <motion.div 
        key={`${view.year}-${view.month}`}
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.015 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-7 gap-y-1 gap-x-1 relative z-10"
      >
        {Array(firstDow).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day  = i + 1
          const ds   = `${view.year}-${String(view.month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const past = ds < today
          const sun  = new Date(view.year, view.month, day).getDay() === 0
          const sat  = new Date(view.year, view.month, day).getDay() === 6
          const off  = past || sun || sat
          const sel  = ds === selected
          const now  = ds === today

          return (
            <motion.div variants={{hidden: {opacity: 0, scale: 0.8}, show: {opacity: 1, scale: 1}}} key={day} className="flex items-center justify-center h-10">
              <button
                onClick={() => !off && onSelect(ds)}
                disabled={off}
                className={`relative w-9 h-9 rounded-xl text-[14px] font-display font-bold transition-all duration-200 flex items-center justify-center overflow-hidden
                  ${off ? 'opacity-20 cursor-not-allowed text-white/30' : 'cursor-pointer hover:scale-110 active:scale-90'}
                  ${!off && !sel ? 'text-white/80 hover:bg-brand-500/20 hover:text-white hover:shadow-[0_0_15px_rgba(42,139,255,0.2)] hover:border-brand-500/30 border border-transparent' : ''}
                  ${sel ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[0_0_20px_rgba(42,139,255,0.4)] border-none' : ''}
                  ${now && !sel ? 'ring-1 ring-brand-500/60 text-brand-300 bg-brand-500/10' : ''}
                `}
              >
                <span className="relative z-10">{day}</span>
                {now && !sel && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400" />
                )}
              </button>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

// ─── Time slot picker ────────────────────────────────────────
function SlotPicker({ dateStr, tz, selected, booked, onSelect, loading }) {
  const [showSparks, setShowSparks] = useState(false)
  const slots = useMemo(() => {
    if (!dateStr) return []
    return generateSlots(dateStr).map(utc => ({
      utc,
      key:      utc.toISOString(),
      display:  fmtTime(utc, tz),
      isPast:   utc <= new Date(),
      isBooked: booked.includes(utc.toISOString()),
    }))
  }, [dateStr, tz, booked])

  if (!dateStr) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-white/30 relative z-10">
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <Calendar className="w-12 h-12 mb-4 opacity-40 text-brand-400" />
      </motion.div>
      <p className="text-[14px] font-body text-center leading-relaxed">
        Select a date to see<br />available time slots
      </p>
    </div>
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[280px] relative z-10">
      <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-400 rounded-full animate-spin mb-3" />
      <p className="text-xs text-white/40 font-body animate-pulse">Loading availability...</p>
    </div>
  )

  const available = slots.filter(s => !s.isPast && !s.isBooked).length

  const handleSelect = (slot) => {
    onSelect(slot)
    setShowSparks(true)
  }

  return (
    <div className="h-full flex flex-col relative z-10">
      {showSparks && <Sparks onComplete={() => setShowSparks(false)} />}
      <div className="mb-5 flex-shrink-0">
        <p className="font-display font-bold text-white text-[16px] leading-snug">
          {fmtDate(new Date(`${dateStr}T15:00:00Z`), tz)}
        </p>
        <p className="text-[12px] text-brand-400/80 font-body mt-1 font-semibold">
          {available > 0 ? `${available} slots available` : 'No slots available for this date'}
        </p>
      </div>

      <motion.div 
        key={dateStr}
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-2 gap-2.5 overflow-y-auto flex-1 pr-1 pb-2 custom-scrollbar" style={{ maxHeight: 340 }}
      >
        {slots.map(slot => {
          const sel = selected?.key === slot.key
          const off = slot.isPast || slot.isBooked
          return (
            <motion.button
              key={slot.key}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              onClick={() => !off && handleSelect(slot)}
              disabled={off}
              whileHover={!off ? { scale: 1.04 } : {}}
              whileTap={!off ? { scale: 0.96 } : {}}
              className={`relative overflow-hidden px-3 py-3 rounded-xl text-[13px] font-display font-bold border transition-all duration-200
                ${off ? 'opacity-20 cursor-not-allowed border-white/5 text-white/30 bg-white/[0.01]' : 'cursor-pointer'}
                ${!off && !sel ? 'border-white/10 text-white/70 hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-white hover:shadow-[0_0_15px_rgba(42,139,255,0.15)] bg-white/[0.03]' : ''}
                ${sel ? 'bg-gradient-to-r from-brand-500/90 to-brand-600/90 border-transparent text-white shadow-[0_0_20px_rgba(42,139,255,0.5)] ring-2 ring-brand-400 ring-offset-2 ring-offset-[#081226]' : ''}
              `}
            >
              <span className="relative z-10">{slot.display}</span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Custom scrollbar styling using a style tag since global css might not have it */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}} />
    </div>
  )
}

// ─── Step 1: Date & Time ─────────────────────────────────────
function DateTimeStep({ tz, setTz, date, setDate, slot, setSlot, booked, loadingSlots, onContinue }) {
  return (
    <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      {/* Timezone selector */}
      <div className="mb-8 max-w-md mx-auto relative z-20">
        <CustomDropdown value={tz} options={TIMEZONE_GROUPS} onChange={(v) => { setTz(v); setSlot(null) }} label="Your Timezone" />
      </div>

      {/* Calendar + Slots */}
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6 mb-8 perspective-1000 relative z-10">
        {/* Calendar */}
        <TiltCard className="rounded-2xl border border-white/10 p-6 sm:p-8 bg-[#081226]/70 shadow-[0_15px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
          <p className="text-[12px] font-body font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
            <Calendar className="w-4 h-4 text-brand-400" /> Select a Date
          </p>
          <CalendarGrid selected={date} onSelect={d => { setDate(d); setSlot(null) }} />
        </TiltCard>

        {/* Slots */}
        <TiltCard className="rounded-2xl border border-white/10 p-6 sm:p-8 bg-[#081226]/70 shadow-[0_15px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
          <p className="text-[12px] font-body font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
            <Clock className="w-4 h-4 text-brand-400" /> Select a Time
          </p>
          <SlotPicker dateStr={date} tz={tz} selected={slot} booked={booked} onSelect={setSlot} loading={loadingSlots} />
        </TiltCard>
      </div>

      {/* Office hours note */}
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-sm shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-accent-400" />
          <p className="text-[12px] text-white/40 font-body">
            Office hours: 11:00 AM – 8:00 PM ET (Mon–Fri) · Zoom Video Call
          </p>
        </div>

        <Button size="lg" disabled={!slot} onClick={slot ? onContinue : undefined} className="min-w-[200px] shadow-[0_0_20px_rgba(42,139,255,0.3)] group relative overflow-hidden">
          <span className="relative z-10 flex items-center gap-2">Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Step 2: Contact Form ────────────────────────────────────
function DetailsStep({ form, setForm, tz, slot, onBack, onSubmit, submitting, error }) {
  const set = useCallback(field => e => setForm(f => ({ ...f, [field]: e.target.value })), [setForm])

  const formVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  const COUNTRY_OPTS = COUNTRIES.map(c => ({ label: c, value: c }))

  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease: 'easeOut' }}>

      {/* Appointment summary bar (Morphing from Step 1) */}
      {slot && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-500/20 to-brand-500/5 p-5 mb-8 shadow-[0_10px_30px_rgba(42,139,255,0.15)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(42,139,255,0.3)]">
              <Clock className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <p className="text-[11px] text-brand-300/70 font-body uppercase tracking-widest mb-1 font-bold">Selected Time</p>
              <p className="text-[15px] font-display font-bold text-white">{fmtSlotDisplay(slot.utc, tz)}</p>
            </div>
          </div>
          <button type="button" onClick={onBack} className="relative z-10 text-[13px] font-body font-semibold text-brand-400 hover:text-brand-300 transition-colors bg-brand-500/10 px-3 py-1.5 rounded-lg border border-brand-500/20 hover:bg-brand-500/20 hover:shadow-[0_0_10px_rgba(42,139,255,0.2)]">
            Change Time
          </button>
        </motion.div>
      )}

      <motion.form variants={formVariants} initial="hidden" animate="show" onSubmit={onSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <AnimatedInput label="Full Name" required value={form.name} onChange={set('name')} placeholder="John Smith" type="text" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AnimatedInput label="Email Address" required value={form.email} onChange={set('email')} placeholder="john@company.com" type="email" />
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <AnimatedInput label="Phone Number" icon={PhoneIcon} required value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" type="tel" />
          </motion.div>
          <motion.div variants={itemVariants}>
             <CustomDropdown 
              value={form.country} 
              options={COUNTRY_OPTS} 
              onChange={(v) => setForm(f => ({ ...f, country: v }))} 
              label="Country *" 
              icon={MapPin}
            />
          </motion.div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0, y: 10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[14px] font-body shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="flex items-center justify-between pt-6 mt-6 border-t border-white/5">
          <button type="button" onClick={onBack}
            className="flex items-center gap-2 text-[14px] font-body font-semibold text-white/40 hover:text-white transition-colors duration-200 group px-3 py-2 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <Button size="lg" type="submit" disabled={submitting} className="min-w-[220px] shadow-[0_0_30px_rgba(42,139,255,0.4)] relative overflow-hidden group">
            {submitting
              ? <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing…</>
              : <span className="relative z-10 flex items-center gap-2">Confirm Appointment <CheckCircle className="w-4 h-4" /></span>
            }
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  )
}

// ─── Step 3: Pending email confirmation ──────────────────────
function PendingStep({ email }) {
  return (
    <motion.div key="step3" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut', type: "spring", stiffness: 200, damping: 20 }}
      className="py-10 text-center relative z-10">
      
      {/* Animated mail icon */}
      <div className="relative w-28 h-28 mx-auto mb-8 perspective-1000">
        <motion.div 
          animate={{ y: [0, -10, 0], rotateY: [0, 10, -10, 0] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/30 flex items-center justify-center mx-auto backdrop-blur-md shadow-[0_0_50px_rgba(42,139,255,0.3)] relative z-10"
        >
          <Mail className="w-10 h-10 text-brand-300" />
        </motion.div>
        <motion.span 
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-3xl border-2 border-brand-500/30" 
        />
      </div>

      <h2 className="font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 text-3xl sm:text-4xl mb-3 tracking-tight">Check Your Inbox</h2>
      <p className="text-white/60 font-body text-[15px] mb-2">We sent a secure confirmation link to</p>
      <div className="inline-block bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl mb-10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/10 to-brand-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <p className="font-display font-bold text-brand-300 text-[16px] relative z-10">{email}</p>
      </div>

      <TiltCard className="rounded-2xl border border-white/10 p-6 sm:p-8 max-w-md mx-auto text-left mb-8 bg-gradient-to-br from-white/[0.05] to-[#081226]/80 shadow-[0_15px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
        <p className="text-[12px] font-body font-bold text-white/40 uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
          <Sparkles className="w-4 h-4 text-accent-400" /> What happens next
        </p>
        <div className="space-y-4 relative z-10">
          {[
            'Open the confirmation email we just sent',
            'Click the "Confirm My Appointment" button',
            'Receive final confirmation & Zoom link details',
            "We'll be in touch before your scheduled call",
          ].map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }}
              className="flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_15px_rgba(42,139,255,0.3)]">
                {i + 1}
              </span>
              <span className="text-[14px] font-body text-white/70 leading-relaxed">{s}</span>
            </motion.div>
          ))}
        </div>
      </TiltCard>

      <p className="text-[13px] text-white/40 font-body">
        Didn't receive it? Check your spam folder or{' '}
        <Link to="/contact" className="text-brand-400 hover:text-brand-300 font-semibold hover:underline transition-colors">contact support</Link>.
      </p>
    </motion.div>
  )
}

// ─── Status views (post-email-confirmation) ──────────────────
function StatusView({ status, name, slot }) {
  if (status === 'confirmed') return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut', type: "spring", bounce: 0.4 }}
      className="py-12 text-center relative">
      <Sparks />
      <div className="relative w-32 h-32 mx-auto mb-10 perspective-1000">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="absolute inset-0 rounded-full bg-accent-500/20 blur-2xl"
        />
        <motion.div 
          animate={{ y: [0, -10, 0], rotateY: [0, 10, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-accent-500/20 to-accent-500/5 border border-accent-500/40 flex items-center justify-center mx-auto relative z-10 backdrop-blur-xl shadow-[0_0_50px_rgba(56,217,169,0.4)]"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}>
            <CheckCircle className="w-14 h-14 text-accent-400" />
          </motion.div>
        </motion.div>
        <motion.span 
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-2 rounded-[2rem] border-2 border-accent-500/30" 
        />
      </div>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-300 via-white to-accent-300 text-4xl sm:text-5xl mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(56,217,169,0.3)]">
        You're All Set!
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-white/70 font-body text-[16px] mb-8 max-w-md mx-auto leading-relaxed">
        {name ? `Hi ${name}, your` : 'Your'} Zoom consultation has been successfully confirmed. Get ready to elevate your business!
      </motion.p>

      {slot && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="inline-flex items-center gap-4 rounded-2xl border border-accent-500/30 bg-gradient-to-r from-accent-500/10 to-accent-500/5 px-6 py-4 mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(56,217,169,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <Clock className="w-5 h-5 text-accent-400 flex-shrink-0 relative z-10" />
          <p className="font-display font-bold text-white text-[15px] relative z-10">{slot}</p>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 relative z-10">
        <Button href="/" className="min-w-[160px] shadow-[0_0_30px_rgba(42,139,255,0.3)]">Back to Home</Button>
        <Button variant="secondary" href="/services" className="min-w-[160px] bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white shadow-none backdrop-blur-sm">Explore Services</Button>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-[13px] text-white/40 font-body flex items-center justify-center gap-2">
        <Mail className="w-3.5 h-3.5 text-accent-400/50" /> Check your email for calendar invite & Zoom link
      </motion.p>
    </motion.div>
  )

  if (status === 'already-confirmed') return (
    <div className="py-12 text-center">
      <div className="w-20 h-20 rounded-2xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(56,217,169,0.3)] backdrop-blur-md">
        <CheckCircle className="w-9 h-9 text-accent-400" />
      </div>
      <h2 className="font-display font-extrabold text-white text-3xl mb-4">Already Confirmed</h2>
      <p className="text-white/60 font-body text-[15px] mb-8 max-w-sm mx-auto leading-relaxed">
        {name ? `Hi ${name}, your` : 'Your'} appointment was already confirmed previously. No further action is needed!
      </p>
      <Button href="/" className="shadow-[0_0_30px_rgba(42,139,255,0.3)]">Return to Homepage</Button>
    </div>
  )

  if (status === 'expired') return (
    <div className="py-12 text-center">
      <div className="w-20 h-20 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(234,179,8,0.3)] backdrop-blur-md">
        <AlertCircle className="w-9 h-9 text-yellow-400" />
      </div>
      <h2 className="font-display font-extrabold text-white text-3xl mb-4">Link Expired</h2>
      <p className="text-white/60 font-body text-[15px] mb-8 max-w-sm mx-auto leading-relaxed">
        For security, confirmation links expire after 24 hours. Please select a new time slot to book your appointment.
      </p>
      <Button href="/booking" className="shadow-[0_0_30px_rgba(42,139,255,0.3)]">Book New Appointment</Button>
    </div>
  )

  // invalid | error
  return (
    <div className="py-12 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(239,68,68,0.3)] backdrop-blur-md">
        <AlertCircle className="w-9 h-9 text-red-400" />
      </div>
      <h2 className="font-display font-extrabold text-white text-3xl mb-4">Invalid Link</h2>
      <p className="text-white/60 font-body text-[15px] mb-8 max-w-sm mx-auto leading-relaxed">
        This confirmation link is invalid or has already been used. Please try booking again.
      </p>
      <Button href="/booking" className="shadow-[0_0_30px_rgba(42,139,255,0.3)]">Start New Booking</Button>
    </div>
  )
}

// ─── Booking wizard ──────────────────────────────────────────
function BookingWizard({ onStepChange }) {
  const [step, setStep]     = useState(1)
  const [tz, setTz]         = useState(detectTimezone)
  const [date, setDate]     = useState(null)
  const [slot, setSlot]     = useState(null)
  const [booked, setBooked] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm]     = useState({ name: '', email: '', phone: '', country: 'United States' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]   = useState('')

  // Notify parent of step changes
  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  // Fetch taken slots whenever date changes
  useEffect(() => {
    if (!date) return
    setLoadingSlots(true)
    fetch(`${API}/api/bookings/slots/${date}`)
      .then(r => r.json())
      .then(d => setBooked(d.bookedSlots || []))
      .catch(() => setBooked([]))
      .finally(() => setLoadingSlots(false))
  }, [date])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!slot) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          timezone:        tz,
          appointmentUTC:  slot.utc.toISOString(),
          slotDisplayUser: fmtSlotDisplay(slot.utc, tz),
          slotDisplayET:   fmtSlotDisplay(slot.utc, 'America/New_York'),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); return }
      setStep(3)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <ProgressBar current={step} />
      <div className="relative z-10 bg-gradient-to-b from-[#081226]/80 to-[#030912]/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <AnimatePresence mode="wait" custom={step}>
              {step === 1 && (
                <DateTimeStep
                  key="s1"
                  tz={tz} setTz={setTz}
                  date={date} setDate={setDate}
                  slot={slot} setSlot={setSlot}
                  booked={booked}
                  loadingSlots={loadingSlots}
                  onContinue={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <DetailsStep
                  key="s2"
                  form={form} setForm={setForm}
                  tz={tz} slot={slot}
                  onBack={() => setStep(1)}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                  error={error}
                />
              )}
              {step === 3 && <PendingStep key="s3" email={form.email} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
  )
}

const STEP_MOODS = { 1: 'idle', 2: 'thinking', 3: 'happy' }

// ─── Page entry point ────────────────────────────────────────
export default function BookingPage() {
  const [params] = useSearchParams()
  const status = params.get('status')
  const name   = params.get('name')
  const slot   = params.get('slot')
  const [bookingStep, setBookingStep] = useState(1)

  const isStatusView = ['confirmed','already-confirmed','expired','invalid','error'].includes(status)
  const robotMood = STEP_MOODS[bookingStep] || 'idle'

  const titleWords = "Transform Your Business".split(" ")

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02050a] selection:bg-brand-500/30 selection:text-brand-200">
      <PageBackground />

      {/* Floating Abstract Shapes */}
      <div className="absolute top-[15%] left-[5%] w-40 h-40 rounded-full border border-brand-500/20 bg-brand-500/5 pointer-events-none hidden lg:block" style={{ animation: 'float 12s ease-in-out infinite' }} />
      <div className="absolute bottom-[20%] right-[5%] w-64 h-64 rounded-[3rem] border border-accent-500/20 bg-accent-500/5 rotate-12 pointer-events-none hidden lg:block" style={{ animation: 'float 15s ease-in-out 2s infinite' }} />

      <div className="relative z-10">
        {/* Hero header */}
        <section className="relative pt-8 sm:pt-12 pb-12">
          <Container className="relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/40 bg-brand-500/10 text-brand-300 text-[11px] font-bold uppercase tracking-[0.2em] mb-6 shadow-[0_0_30px_rgba(42,139,255,0.2)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse shadow-[0_0_10px_rgba(42,139,255,0.8)]" />
                Free Strategy Call
              </motion.span>
              
              <div className="relative">
                <div className="absolute -inset-4 opacity-20 bg-gradient-to-r from-brand-600 via-accent-500 to-brand-600 z-0 rounded-[3rem]" style={{ filter: 'blur(48px)' }} />
                <h1 className="relative z-10 text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold leading-[1.05] mb-6 tracking-tight perspective-1000">
                  {isStatusView
                    ? 'Appointment Status'
                    : <>
                        {titleWords.map((word, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1), duration: 0.7, ease: "easeOut" }}
                            className="inline-block mr-[0.25em]"
                          >
                            {word}
                          </motion.span>
                        ))}
                        <br />
                        <motion.span
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                          className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-white to-accent-300 drop-shadow-[0_0_30px_rgba(42,139,255,0.4)]"
                        >
                          Book a Consultation
                        </motion.span>
                      </>
                  }
                </h1>
              </div>

              {!isStatusView && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}
                  className="text-[16px] sm:text-[19px] text-white/60 font-body leading-relaxed max-w-2xl mx-auto"
                >
                  Schedule a complimentary 30-minute strategy session with our experts. Discover how we can accelerate your growth — zero pressure, zero commitment.
                </motion.p>
              )}
            </div>
          </Container>
        </section>

        {/* Main content */}
        <section className="relative pb-32">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={isStatusView ? 'max-w-3xl mx-auto' : 'grid xl:grid-cols-[1fr_260px] gap-8 xl:gap-12 max-w-6xl mx-auto items-start'}
            >
              {/* Booking wizard / status card */}
              <div>
                <AnimatePresence mode="wait">
                  {isStatusView ? (
                    <motion.div
                      key="status"
                      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <TiltCard className="bg-gradient-to-b from-[#081226]/80 to-[#030912]/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
                        <StatusView status={status} name={name} slot={slot} />
                      </TiltCard>
                    </motion.div>
                  ) : (
                    <BookingWizard key="wizard" onStepChange={setBookingStep} />
                  )}
                </AnimatePresence>
              </div>

              {/* Robot guide — xl only, sticky */}
              {!isStatusView && (
                <div className="hidden xl:flex flex-col items-center sticky top-28 self-start gap-3">
                  {/* Step hint bubble */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={bookingStep}
                      initial={{ opacity: 0, scale: 0.88, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.88, y: -8 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="glass rounded-2xl rounded-bl-sm px-4 py-3 text-center w-full"
                    >
                      <p className="text-[11.5px] font-body text-white/65 leading-relaxed whitespace-pre-line">
                        {bookingStep === 1 && "Pick a date\n& time slot!"}
                        {bookingStep === 2 && "Almost there!\nFill in your details."}
                        {bookingStep === 3 && "Check your inbox\nfor the link! 🎉"}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Glow pool */}
                  <div className="relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-10 rounded-full pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse, rgba(42,139,255,0.22) 0%, transparent 70%)', filter: 'blur(10px)' }}/>
                    <RobotCursorTracker mood={robotMood} size={0.95} />
                  </div>

                  {/* Step progress dots */}
                  <div className="flex items-center gap-2 mt-1">
                    {[1,2,3].map(s => (
                      <div key={s} className="rounded-full transition-all duration-400"
                        style={{
                          width: bookingStep >= s ? 20 : 6,
                          height: 6,
                          background: bookingStep >= s
                            ? 'linear-gradient(90deg, #2a8bff, #20c997)'
                            : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-body font-bold text-white/25 uppercase tracking-[0.15em]">BAXZ · Your Guide</p>
                </div>
              )}
            </motion.div>
          </Container>
        </section>
      </div>
    </div>
  )
}
