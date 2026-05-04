import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import { ArrowLeft, ExternalLink, Star, ThumbsUp } from 'lucide-react'

const GOOGLE_REVIEWS_URL = 'https://share.google/yconWqaIeNBaoj4r5'
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const STATIC_REVIEWS = [
  {
    id: 1,
    name: 'Amos Koren',
    initials: 'AK',
    role: 'Realty Executives Arizona Territory',
    rating: 5,
    date: '5 months ago',
    text: 'I have been extremely happy with BizBackerz. They have created branding for us that is very professional, elegant and eye catching. What is unique about BizBackerz is that they complete marketing campaigns for us faster than any other marketing companies we have used in the past. With BizBackerz we have a dedicated marketing specialist that is our point person. He answers our questions immediately and gives us insights into the best practices; then guides us on how to implement these practices to increase our SEO. We tell him the info that we want marketed (in our case, real estate listings) and the team creates posts, newsletters, reels, videos and marketing flyers that look amazing (in less than 24 hours)! Top tier quality marketing items, too. They have also gone above and beyond in helping us by running our platforms and taking the initiative to get our SEO up. I feel like I am truly working with a marketing team that treats my business as their first priority. The whole BizBackerz team is fantastic and we highly recommend them!',
    helpful: 18,
    color: '#2a8bff',
    verified: true,
  },
  {
    id: 2,
    name: 'Rocky Mariano',
    initials: 'RM',
    role: 'Local Guide',
    rating: 5,
    date: '5 months ago',
    text: 'Been working with BizBackerz for 2 months now, and very satisfied! They\'re innovative, they help me come up with marketing ideas, suggestions, they make phone calls, send emails, and text messages. Anytime a new lead comes in they let me know right away! If you want to take your business to the next level and have someone do the activities in the background while you handle your day to day operations you need to hire them! Highly recommend them — you will be impressed.',
    helpful: 14,
    color: '#10b981',
    verified: true,
  },
  {
    id: 3,
    name: 'Carlos Espejo',
    initials: 'CE',
    role: '',
    rating: 5,
    date: '7 months ago',
    text: 'They have been a game-changer for my workflow. They are extremely willing to jump in and get to work immediately, consistently bringing great ideas and high-quality deliverables to the table. Their ability to follow up without being prompted has saved me significant time and energy, allowing me to stay focused on higher-priority initiatives. The efficiency, creativity, and reliability they provide is an incredible value — truly gears-level ROI for my business.',
    helpful: 11,
    color: '#f59e0b',
    verified: true,
  },
  {
    id: 4,
    name: 'Micheal Price',
    initials: 'MP',
    role: 'Local Guide',
    rating: 5,
    date: '10 months ago',
    text: 'I\'ve been working with BIZBACKERZ LTD to strengthen my online presence, and I couldn\'t be more impressed with the results so far. Their team has been focused, transparent, and highly knowledgeable when it comes to SEO strategy and backlink building. What really sets them apart is their consistent communication and the way they break down complex SEO tactics into actionable steps. They\'ve taken the time to understand my business and have been proactive in identifying opportunities to improve visibility in the search engines. Since partnering with them, I\'ve seen steady improvements in my search rankings and overall web authority. They\'re not just building backlinks — they\'re building a foundation for long-term growth. If you\'re serious about growing your SEO presence and want a team that knows what they\'re doing, I highly recommend BIZBACKERZ LTD.',
    helpful: 16,
    color: '#8b5cf6',
    verified: true,
  },
  {
    id: 5,
    name: 'Ola Ghoneim',
    initials: 'OG',
    role: '',
    rating: 5,
    date: '10 months ago',
    text: 'I have been introduced to BizBackerz by chance, and I decided to give them a chance as virtual assistants for my business, and I am SOOO glad I did. Very professional team, highly responsive, and always accessible when I need them. They never late in responding to any message and they take any critique as an opportunity for learning and growth. They help me significantly in increasing my presence on social media, creating CRM, sending reminders for new tasks, and more. I am very pleased to use their services. Highly recommend BizBackerz. 5 Stars from me.',
    helpful: 13,
    color: '#ec4899',
    verified: true,
  },
  {
    id: 6,
    name: 'Johnetta Dillard',
    initials: 'JD',
    role: 'Local Guide',
    rating: 5,
    date: '10 months ago',
    text: 'The team is so committed to my business\' success. I love that. I highly recommend them. They are really up\'ing my social media game and adding a new chapter to my marketing with videos.',
    helpful: 9,
    color: '#f97316',
    verified: true,
  },
]

function buildStarCounts(reviews) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach(r => { if (counts[r.rating] !== undefined) counts[r.rating]++ })
  return counts
}

function StarRow({ filled, starCounts, total }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-0.5 flex-shrink-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-3 h-3 ${i <= filled ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-white/15'}`} />
        ))}
      </div>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.07]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${total ? (starCounts[filled] / total) * 100 : 0}%`,
            background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
          }}
        />
      </div>
      <span className="text-[11px] font-body text-white/38 w-4 text-right">{starCounts[filled]}</span>
    </div>
  )
}

function ReviewCard({ review, index }) {
  const [helpful, setHelpful] = useState(review.helpful)
  const [voted, setVoted] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }}
      className="group relative rounded-2xl p-6 sm:p-7 border border-white/[0.07] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
      style={{ background: 'rgba(6,15,29,0.55)', backdropFilter: 'blur(20px)' }}
    >
      {/* hover gradient fill */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg,${review.color}10 0%,${review.color}04 55%,transparent 100%)` }} />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg,transparent,${review.color}45,transparent)` }} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-display font-bold flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${review.color}30, ${review.color}12)`,
                border: `1px solid ${review.color}35`,
                color: review.color,
              }}
            >
              {review.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-display font-semibold text-white">{review.name}</p>
                {review.verified && (
                  <span className="text-[9px] font-body font-bold uppercase tracking-[0.18em] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(66,133,244,0.12)', color: '#4285F4', border: '1px solid rgba(66,133,244,0.2)' }}>
                    Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/38 font-body">{review.role}</p>
            </div>
          </div>

          {/* Google icon */}
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 opacity-50" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        </div>

        {/* Stars + date */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-0.5">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
            ))}
          </div>
          <span className="text-[11px] text-white/35 font-body">{review.date}</span>
        </div>

        {/* Review text */}
        <p className="text-[14px] text-white/70 leading-[1.9] font-body mb-5 group-hover:text-white/78 transition-colors duration-300">
          "{review.text}"
        </p>

        {/* Helpful */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
          <span className="text-[11px] text-white/30 font-body">Posted on Google</span>
          <button
            onClick={() => { if (!voted) { setHelpful(h => h + 1); setVoted(true) } }}
            className={`flex items-center gap-1.5 text-[11px] font-body transition-colors duration-200 ${voted ? 'text-brand-400' : 'text-white/30 hover:text-white/55'}`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Helpful ({helpful})</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(STATIC_REVIEWS)

  useEffect(() => {
    fetch(`${API}/api/reviews`)
      .then(r => r.json())
      .then(data => { if (data.success && data.reviews?.length) setReviews(data.reviews) })
      .catch(() => {})
  }, [])

  const starCounts = buildStarCounts(reviews)
  const total = reviews.length

  return (
    <div className="relative min-h-screen bg-navy-950 overflow-hidden">

      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[36rem] w-[36rem] rounded-full blur-[150px]"
          style={{ background: 'rgba(42,139,255,0.09)' }} />
        <div className="absolute right-[-6rem] top-[18rem] h-[28rem] w-[28rem] rounded-full blur-[150px]"
          style={{ background: 'rgba(56,217,169,0.07)' }} />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: 'linear-gradient(rgba(42,139,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(42,139,255,0.04) 1px,transparent 1px)',
            backgroundSize: '88px 88px',
            maskImage: 'linear-gradient(to bottom,transparent,black 12%,black 88%,transparent)',
          }}
        />
      </div>

      <div className="relative z-10">
        <Container className="pt-6 pb-10 sm:pt-8 sm:pb-14">

          {/* Back button */}
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-[13px] font-body font-semibold text-white/45 hover:text-white transition-colors duration-300 mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to About
          </Link>

          {/* Hero / overview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">

              {/* Left — heading + overall rating */}
              <div className="max-w-xl">
                {/* Google badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.09] mb-6"
                  style={{ background: 'rgba(66,133,244,0.08)' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-white/55">
                    Google Reviews
                  </span>
                </div>

                <h1 className="font-display font-bold tracking-[-0.045em] text-white mb-4"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.08 }}>
                  What Our Clients Are Saying
                </h1>
                <p className="text-[15px] text-white/58 font-body leading-[1.85] max-w-lg">
                  Real feedback from real business owners who have trusted BizBackerz to handle their operations. Every review is posted directly on Google.
                </p>
              </div>

              {/* Right — rating summary card */}
              <div
                className="relative rounded-2xl p-7 border border-white/[0.08] overflow-hidden flex-shrink-0 w-full lg:w-72"
                style={{ background: 'rgba(6,15,29,0.65)', backdropFilter: 'blur(24px)' }}
              >
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top left, rgba(42,139,255,0.1), transparent 60%)' }} />
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(42,139,255,0.5), transparent)' }} />

                <div className="relative text-center mb-6">
                  <div className="font-display font-black text-white"
                    style={{ fontSize: 'clamp(3.5rem, 8vw, 5rem)', lineHeight: 1, letterSpacing: '-0.04em' }}>
                    5.0
                  </div>
                  <div className="flex justify-center gap-1 my-3">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-5 h-5 fill-[#f59e0b] text-[#f59e0b]" />
                    ))}
                  </div>
                  <p className="text-[12px] text-white/40 font-body">Based on {total} Google reviews</p>
                </div>

                {/* Star distribution */}
                <div className="space-y-2 mb-6">
                  {[5, 4, 3, 2, 1].map(n => <StarRow key={n} filled={n} starCounts={starCounts} total={total} />)}
                </div>

                <a
                  href={GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-[12px] font-body font-semibold text-white/60 border border-white/[0.1] hover:text-white hover:border-white/25 transition-all duration-300"
                >
                  View on Google
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-10" />

          {/* Reviews grid — 2 columns */}
          <div className="grid sm:grid-cols-2 gap-5 mb-12">
            {reviews.map((review, index) => (
              <ReviewCard key={review._id || review.id} review={review} index={index} />
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="relative rounded-2xl p-7 sm:p-9 border border-brand-500/20 overflow-hidden text-center"
            style={{
              background: 'linear-gradient(148deg, rgba(42,139,255,0.1) 0%, rgba(42,139,255,0.03) 50%, rgba(6,15,29,0.8) 100%)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center top, rgba(42,139,255,0.18), transparent 55%)' }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(42,139,255,0.6), transparent)' }} />

            <div className="relative">
              <div className="flex justify-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />)}
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">
                Ready to experience the difference?
              </h2>
              <p className="text-[14px] text-white/52 font-body leading-[1.8] max-w-md mx-auto mb-7">
                Join the growing list of business owners who've reclaimed their time and focus with BizBackerz.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-body font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors duration-300"
                >
                  Book a Free Call
                </Link>
                <a
                  href={GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-body font-semibold text-white/55 border border-white/[0.1] hover:text-white hover:border-white/25 transition-all duration-300"
                >
                  All Reviews on Google
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>

        </Container>
      </div>
    </div>
  )
}
