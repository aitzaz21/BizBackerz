/**
 * prerender-meta.mjs
 *
 * Runs after `vite build`. For each known route, it clones the built
 * index.html and injects the correct <title>, <meta description>,
 * <link rel="canonical">, Open Graph tags, AND real page body content
 * into <div id="root"> so crawlers see full content without executing JS.
 *
 * Also fetches all blog posts from the production API and generates
 * dist/blog/:slug/index.html for each one. If the API is unreachable,
 * a valid (empty) sitemap-blog.xml is still written so the URL never 404s.
 *
 * Usage: node scripts/prerender-meta.mjs
 * Or via package.json: "build": "vite build && node scripts/prerender-meta.mjs"
 *
 * Env vars:
 *   PRERENDER_API_URL  — base URL of the Express API (default: https://bizbackerz.onrender.com)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { servicesData } from '../client/src/data/servicesData.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST      = join(__dirname, '../client/dist')
const BASE_URL  = 'https://bizbackerz.com'

/* Resolve the API URL:
   1. PRERENDER_API_URL env var (CI/CD override)
   2. VITE_API_URL from client/.env.production
   3. Fallback: the Render deployment URL */
function resolveApiUrl() {
  if (process.env.PRERENDER_API_URL) return process.env.PRERENDER_API_URL
  try {
    const envPath = join(__dirname, '../client/.env.production')
    const env = readFileSync(envPath, 'utf8')
    const match = env.match(/^VITE_API_URL\s*=\s*(.+)$/m)
    if (match) return match[1].trim()
  } catch { /* file not found or unreadable */ }
  return 'https://bizbackerz.onrender.com'
}
const API_URL = resolveApiUrl()

/* ── Helpers ─────────────────────────────────────────────────── */
function escapeHtml(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/* ── Body content builders ───────────────────────────────────── */

function makeServicesListBody() {
  const items = servicesData.map(s =>
    `      <li><a href="/services/${s.slug}"><strong>${escapeHtml(s.title)}</strong></a> — ${escapeHtml(s.tagline)}</li>`
  ).join('\n')
  return `<main>
  <section>
    <h1>Virtual Assistant Services — BizBackerz</h1>
    <p>BizBackerz offers 10 premium virtual assistant services designed to help business owners, founders, and growing teams delegate effectively and scale faster. Our dedicated virtual assistants integrate into your workflow within 48 hours — no long-term contracts required.</p>
    <ul>
${items}
    </ul>
    <p>Each service is delivered by a dedicated virtual assistant matched to your industry and workflow. <a href="/booking">Book a free 30-minute discovery call</a> to discuss which services fit your business best.</p>
  </section>
</main>`
}

function makeServiceBody(s) {
  const featuresHtml = s.features.map(f =>
    `        <li><strong>${escapeHtml(f.title)}</strong> — ${escapeHtml(f.description)}</li>`
  ).join('\n')
  const benefitsHtml = s.benefits.map(b =>
    `        <li><strong>${escapeHtml(b.title)}</strong> — ${escapeHtml(b.description)}</li>`
  ).join('\n')
  const processHtml = s.process.map(p =>
    `        <li><strong>${escapeHtml(p.title)}</strong> — ${escapeHtml(p.description)}</li>`
  ).join('\n')
  const resultsHtml = s.results.map(r =>
    `        <li>${escapeHtml(String(r.target))}${escapeHtml(r.suffix)} ${escapeHtml(r.label)} — ${escapeHtml(r.description)}</li>`
  ).join('\n')
  const faqsHtml = s.faqs.map(f =>
    `      <details><summary>${escapeHtml(f.question)}</summary><p>${escapeHtml(f.answer)}</p></details>`
  ).join('\n')

  return `<main>
  <article>
    <header>
      <span>${escapeHtml(s.category)}</span>
      <h1>${escapeHtml(s.title)} Services — BizBackerz</h1>
      <p>${escapeHtml(s.tagline)}</p>
      <p>${escapeHtml(s.heroDescription)}</p>
      <ul>
        ${s.heroStats.map(st => `<li>${escapeHtml(st.value)} ${escapeHtml(st.label)}</li>`).join('\n        ')}
      </ul>
    </header>
    <section>
      <h2>What's Included</h2>
      <ul>
${featuresHtml}
      </ul>
    </section>
    <section>
      <h2>Key Benefits</h2>
      <ul>
${benefitsHtml}
      </ul>
    </section>
    <section>
      <h2>How It Works</h2>
      <ol>
${processHtml}
      </ol>
    </section>
    <section>
      <h2>Results</h2>
      <ul>
${resultsHtml}
      </ul>
    </section>
    <section>
      <blockquote>
        <p>"${escapeHtml(s.testimonial.quote)}"</p>
        <cite>${escapeHtml(s.testimonial.name)}, ${escapeHtml(s.testimonial.role)}</cite>
      </blockquote>
    </section>
    <section>
      <h2>Frequently Asked Questions</h2>
${faqsHtml}
    </section>
    <p><a href="/booking">Book a free consultation</a> | <a href="/contact">Contact BizBackerz</a> | <a href="/services">View all services</a></p>
  </article>
</main>`
}

/* ── Per-route meta + body content ──────────────────────────── */
const ROUTES = [
  {
    path: '/',
    title: 'BizBackerz – Delegate to Dominate | Virtual Assistance',
    description: 'BizBackerz offers dedicated virtual assistance — admin support, social media management, lead generation, customer support, and more. Delegate to dominate your business.',
    bodyHtml: `<main>
  <section>
    <h1>Delegate to Dominate — BizBackerz Virtual Assistance</h1>
    <p>BizBackerz is a UK-based virtual assistance agency founded in 2024, serving 50+ businesses across the US and UK. We provide dedicated virtual assistants that handle the operational tasks consuming your time — administrative support, social media management, lead generation, customer support, content creation, and more — so you can focus on growing your business.</p>
    <ul>
      <li>50+ businesses served</li>
      <li>5.0 / 5.0 Google rating</li>
      <li>98% client satisfaction rate</li>
      <li>500+ tasks completed</li>
      <li>48-hour onboarding</li>
    </ul>
  </section>
  <section>
    <h2>Virtual Assistant Services</h2>
    <p>We offer 10 premium virtual assistant services tailored to help your business delegate, scale, and dominate.</p>
    <ul>
      <li><a href="/services/digital-advertising"><strong>Digital Advertising</strong></a> — AI-powered Google Ads driving 25% more inbound leads at lower cost per acquisition.</li>
      <li><a href="/services/administrative-support"><strong>Administrative Support</strong></a> — Reclaim 10+ hours a week from calendar management, email handling, and data entry.</li>
      <li><a href="/services/customer-support"><strong>Customer Support</strong></a> — 2-hour average response time and 95% first-contact resolution rate.</li>
      <li><a href="/services/social-media-management"><strong>Social Media Management</strong></a> — 3x engagement increase within 90 days across Instagram, Facebook, LinkedIn, and TikTok.</li>
      <li><a href="/services/content-creation"><strong>Content Creation</strong></a> — SEO-optimized blog posts, emails, and social copy — 8+ pieces per month.</li>
      <li><a href="/services/lead-generation"><strong>Lead Generation</strong></a> — 30+ qualified B2B leads per month through LinkedIn outreach and cold email.</li>
      <li><a href="/services/project-management"><strong>Project Management</strong></a> — 100% on-time delivery and 40% faster execution across all managed projects.</li>
      <li><a href="/services/accounting-services"><strong>Accounting Services</strong></a> — Clean books, 48-hour invoice turnaround, 98% collection rate.</li>
      <li><a href="/services/marketing-support"><strong>Marketing Support</strong></a> — Double your campaign output and reach with dedicated marketing execution.</li>
      <li><a href="/services/e-commerce-services"><strong>E-Commerce Services</strong></a> — 25% sales increase through listing optimization for Amazon, Shopify, and more.</li>
    </ul>
  </section>
  <section>
    <h2>How BizBackerz Works</h2>
    <ol>
      <li><strong>Discovery Call</strong> — Free 30-minute session to identify your goals, pain points, and current workflow.</li>
      <li><strong>Match &amp; Onboard</strong> — We match you with the right assistant and configure tools within 48 hours.</li>
      <li><strong>Start Executing</strong> — Your assistant begins work immediately with daily updates and proactive communication.</li>
      <li><strong>Scale With You</strong> — Add hours, expand scope, or bring in specialists as your business grows.</li>
    </ol>
  </section>
  <section>
    <h2>Who We Serve</h2>
    <ul>
      <li>Real estate agents and brokers</li>
      <li>E-commerce sellers (Amazon, Shopify, Etsy)</li>
      <li>SaaS founders and startup operators</li>
      <li>Consulting firm owners</li>
      <li>Marketing agencies</li>
      <li>Professional services businesses (legal, healthcare, finance)</li>
      <li>Solopreneurs scaling their operations</li>
    </ul>
  </section>
  <footer>
    <p>US Phone: +1 (904) 668-6362 | Email: Hello@bizbackerz.com | <a href="/booking">Book a free consultation</a> | <a href="/contact">Contact us</a></p>
  </footer>
</main>`,
  },

  {
    path: '/about',
    title: 'About BizBackerz – Your Virtual Assistance Partner',
    description: 'BizBackerz is a UK-based virtual assistance agency helping 50+ businesses save 10+ hours a week. Expert VAs for admin, marketing, customer support, and more. 48-hour setup.',
    bodyHtml: `<main>
  <article>
    <h1>About BizBackerz — Your Dedicated Virtual Assistance Partner</h1>
    <p>BizBackerz is a virtual assistance agency founded in 2024, headquartered in London, UK, with US operations based in Florida. We serve 50+ businesses across the US and UK, helping founders, business owners, and growing teams delegate operational tasks so they can focus on what moves the needle.</p>
    <p>Our tagline is "Delegate to Dominate." We believe business owners should spend their time on strategic decisions, not routine execution. Our dedicated virtual assistants integrate into your workflow, learn your business, and deliver consistent, high-quality execution — starting within 48 hours of onboarding.</p>
    <section>
      <h2>Key Facts</h2>
      <ul>
        <li>Founded: 2024</li>
        <li>Headquarters: London, United Kingdom</li>
        <li>US Operations: Florida, USA</li>
        <li>Clients Served: 50+</li>
        <li>Google Rating: 5.0 / 5.0</li>
        <li>Client Satisfaction Rate: 98%</li>
        <li>Tasks Completed: 500+</li>
        <li>Average Setup Time: 48 hours</li>
        <li>Operating Hours: Monday–Friday, 11:00 AM – 8:00 PM ET</li>
        <li>Phone: +1 (904) 668-6362</li>
        <li>Email: Hello@bizbackerz.com</li>
      </ul>
    </section>
    <section>
      <h2>Why Choose BizBackerz?</h2>
      <p>Unlike generic VA marketplaces, BizBackerz assigns you a dedicated assistant who specialises in your industry and stays with you long-term — building real familiarity with your business, your voice, and your goals. We are a team, not a platform. Every client gets a single accountable point of contact and consistent execution from day one.</p>
      <ul>
        <li>Dedicated assistant — same person every day, not a rotating pool</li>
        <li>48-hour onboarding — matched, briefed, and executing within two business days</li>
        <li>No long-term contracts — flexible monthly arrangements</li>
        <li>Specialist coverage across 10 service areas</li>
        <li>UK-based agency serving US and UK businesses</li>
      </ul>
    </section>
    <section>
      <h2>Our Services</h2>
      <ul>
        <li><a href="/services/digital-advertising">Digital Advertising</a> — Google Local Service Ads, AI Max, Performance Max</li>
        <li><a href="/services/administrative-support">Administrative Support</a> — Calendar, email, data entry, documents</li>
        <li><a href="/services/customer-support">Customer Support</a> — Tickets, live chat, CRM, phone support</li>
        <li><a href="/services/social-media-management">Social Media Management</a> — Content, scheduling, community engagement</li>
        <li><a href="/services/content-creation">Content Creation</a> — Blogs, emails, social copy, SEO content</li>
        <li><a href="/services/lead-generation">Lead Generation</a> — LinkedIn outreach, cold email, prospect research</li>
        <li><a href="/services/project-management">Project Management</a> — Task tracking, deadline management, SOPs</li>
        <li><a href="/services/accounting-services">Accounting Services</a> — Bookkeeping, invoicing, financial reports</li>
        <li><a href="/services/marketing-support">Marketing Support</a> — Campaigns, email marketing, analytics</li>
        <li><a href="/services/e-commerce-services">E-Commerce Services</a> — Amazon, Shopify, Etsy store management</li>
      </ul>
    </section>
    <footer>
      <p><a href="/booking">Book a free discovery call</a> | <a href="/contact">Contact us</a> | <a href="/reviews">Read client reviews</a></p>
    </footer>
  </article>
</main>`,
  },

  {
    path: '/services',
    title: 'Virtual Assistant Services – 10 Premium Services | BizBackerz',
    description: 'Explore BizBackerz\'s 10 premium virtual assistant services: digital advertising, admin support, social media management, lead generation, customer support, and more.',
    bodyHtml: makeServicesListBody(),
  },

  /* ── Service detail pages — generated from servicesData ── */
  ...servicesData.map(s => ({
    path: `/services/${s.slug}`,
    title: s.seo.title,
    description: s.seo.description,
    bodyHtml: makeServiceBody(s),
  })),

  {
    path: '/blog',
    title: 'Virtual Assistant Blog – Tips, Guides & Business Growth | BizBackerz',
    description: 'Expert insights on virtual assistance, business delegation, productivity, social media, lead generation, and scaling your business. Read the BizBackerz blog.',
    bodyHtml: `<main>
  <section>
    <h1>Virtual Assistant Blog — Tips, Guides &amp; Business Growth</h1>
    <p>Expert insights from the BizBackerz team on virtual assistance, business delegation, productivity, social media management, lead generation, e-commerce, and scaling your business faster. Practical strategies for founders, solopreneurs, and growing teams.</p>
    <p>Topics covered: virtual assistant services, administrative support, social media management, lead generation, content marketing, e-commerce operations, project management, accounting, business productivity, and delegation best practices.</p>
    <p><a href="/booking">Book a free consultation</a> to learn how BizBackerz can help your business grow.</p>
  </section>
</main>`,
  },

  {
    path: '/contact',
    title: 'Contact BizBackerz – Hire a Virtual Assistant',
    description: 'Get in touch with BizBackerz to hire a dedicated virtual assistant. Call (904) 668-6362 or email Hello@bizbackerz.com. Available Mon–Fri, 11:00 AM – 8:00 PM ET.',
    bodyHtml: `<main>
  <section>
    <h1>Contact BizBackerz — Hire a Virtual Assistant</h1>
    <p>Get in touch with BizBackerz to discuss your virtual assistance needs, ask questions, or get a personalised quote. We respond to all enquiries within 24 hours during business hours.</p>
    <address>
      <p>US Phone: <a href="tel:+19046686362">+1 (904) 668-6362</a></p>
      <p>Email: <a href="mailto:Hello@bizbackerz.com">Hello@bizbackerz.com</a></p>
      <p>Headquarters: London, United Kingdom</p>
      <p>US Operations: Florida, USA</p>
      <p>Operating Hours: Monday–Friday, 11:00 AM – 8:00 PM Eastern Time</p>
    </address>
    <p><a href="/booking">Book a free 30-minute discovery call</a> — no obligation, no sales pitch, just an honest conversation about your business needs.</p>
    <p>Social: <a href="https://www.facebook.com/BizBackerz">Facebook</a> | <a href="https://www.instagram.com/bizbackerzltd/">Instagram</a> | <a href="https://www.linkedin.com/company/105424987/">LinkedIn</a></p>
  </section>
</main>`,
  },

  {
    path: '/booking',
    title: 'Book a Free Consultation | BizBackerz Virtual Assistants',
    description: 'Schedule a free 30-minute discovery call with BizBackerz. Choose your time slot and start delegating your business tasks to expert virtual assistants within 48 hours.',
    bodyHtml: `<main>
  <section>
    <h1>Book a Free Consultation with BizBackerz</h1>
    <p>Schedule a free 30-minute discovery call with BizBackerz. During this call, we learn about your business, identify your biggest time-consuming bottlenecks, and explain how our virtual assistants can help. No obligation and no sales pressure — just an honest conversation about whether BizBackerz is the right fit for your business.</p>
    <p>After booking, we confirm your appointment by email. Your dedicated assistant will be matched, briefed, and ready to begin work within 48 hours of your first session.</p>
    <ul>
      <li>Available: Monday–Friday, 9:00 AM – 5:00 PM ET</li>
      <li>Duration: 30 minutes</li>
      <li>Format: Video call (Google Meet or Zoom)</li>
      <li>Cost: Completely free, no obligation</li>
    </ul>
    <p>Alternatively, <a href="/contact">contact us</a> by phone or email if you prefer to reach out directly.</p>
  </section>
</main>`,
  },

  {
    path: '/reviews',
    title: 'Client Reviews & Testimonials | BizBackerz Virtual Assistants',
    description: 'Read 5-star Google reviews from real estate agents, e-commerce sellers, and business owners who use BizBackerz virtual assistant services.',
    bodyHtml: `<main>
  <section>
    <h1>Client Reviews &amp; Testimonials — BizBackerz</h1>
    <p>BizBackerz maintains a 5.0 / 5.0 Google rating with 98% client satisfaction across 50+ businesses. Read what our clients say about working with our virtual assistants.</p>
    <div>
      <article>
        <h3>Amos Koren — Realty Executives Arizona Territory — 5 stars</h3>
        <blockquote><p>I have been extremely happy with BizBackerz. They have created branding for us that is very professional, elegant and eye catching. What is unique about BizBackerz is that they complete marketing campaigns for us faster than any other marketing companies we have used in the past. With BizBackerz we have a dedicated marketing specialist that is our point person. He answers our questions immediately and gives us insights into the best practices; then guides us on how to implement these practices to increase our SEO. We tell him the info that we want marketed (in our case, real estate listings) and the team creates posts, newsletters, reels, videos and marketing flyers that look amazing (in less than 24 hours)! Top tier quality marketing items, too. They have also gone above and beyond in helping us by running our platforms and taking the initiative to get our SEO up. I feel like I am truly working with a marketing team that treats my business as their first priority. The whole BizBackerz team is fantastic and we highly recommend them!</p></blockquote>
      </article>
      <article>
        <h3>Rocky Mariano — Local Guide — 5 stars</h3>
        <blockquote><p>Been working with BizBackerz for 2 months now, and very satisfied! They're innovative, they help me come up with marketing ideas, suggestions, they make phone calls, send emails, and text messages. Anytime a new lead comes in they let me know right away! If you want to take your business to the next level and have someone do the activities in the background while you handle your day to day operations you need to hire them! Highly recommend them — you will be impressed.</p></blockquote>
      </article>
      <article>
        <h3>Carlos Espejo — 5 stars</h3>
        <blockquote><p>They have been a game-changer for my workflow. They are extremely willing to jump in and get to work immediately, consistently bringing great ideas and high-quality deliverables to the table. Their ability to follow up without being prompted has saved me significant time and energy, allowing me to stay focused on higher-priority initiatives. The efficiency, creativity, and reliability they provide is an incredible value — truly gears-level ROI for my business.</p></blockquote>
      </article>
      <article>
        <h3>Micheal Price — Local Guide — 5 stars</h3>
        <blockquote><p>I've been working with BIZBACKERZ LTD to strengthen my online presence, and I couldn't be more impressed with the results so far. Their team has been focused, transparent, and highly knowledgeable when it comes to SEO strategy and backlink building. What really sets them apart is their consistent communication and the way they break down complex SEO tactics into actionable steps. They've taken the time to understand my business and have been proactive in identifying opportunities to improve visibility in the search engines. Since partnering with them, I've seen steady improvements in my search rankings and overall web authority. They're not just building backlinks — they're building a foundation for long-term growth. If you're serious about growing your SEO presence and want a team that knows what they're doing, I highly recommend BIZBACKERZ LTD.</p></blockquote>
      </article>
      <article>
        <h3>Ola Ghoneim — 5 stars</h3>
        <blockquote><p>I have been introduced to BizBackerz by chance, and I decided to give them a chance as virtual assistants for my business, and I am SOOO glad I did. Very professional team, highly responsive, and always accessible when I need them. They never late in responding to any message and they take any critique as an opportunity for learning and growth. They help me significantly in increasing my presence on social media, creating CRM, sending reminders for new tasks, and more. I am very pleased to use their services. Highly recommend BizBackerz. 5 Stars from me.</p></blockquote>
      </article>
      <article>
        <h3>Johnetta Dillard — Local Guide — 5 stars</h3>
        <blockquote><p>The team is so committed to my business' success. I love that. I highly recommend them. They are really upping my social media game and adding a new chapter to my marketing with videos.</p></blockquote>
      </article>
    </div>
    <p><a href="/booking">Book a free consultation</a> to see how BizBackerz can deliver results for your business.</p>
  </section>
</main>`,
  },

  {
    path: '/faq',
    title: 'Virtual Assistant FAQ – Common Questions Answered | BizBackerz',
    description: 'Answers to the most common questions about BizBackerz virtual assistant services — setup time, pricing, tools, availability, and security.',
    bodyHtml: `<main>
  <article>
    <h1>Frequently Asked Questions — BizBackerz Virtual Assistants</h1>
    <p>Answers to the most common questions about working with BizBackerz. Can't find your answer? <a href="/contact">Contact us</a> directly — we're happy to help.</p>

    <section>
      <h2>Getting Started</h2>
      <details open>
        <summary>What is a virtual assistant and how does BizBackerz work?</summary>
        <p>A virtual assistant (VA) is a skilled remote professional who handles specific business tasks on your behalf. BizBackerz matches you with a dedicated VA who integrates seamlessly into your workflow. After a free 30-minute discovery call, we identify your biggest bottlenecks, match you with the right assistant, set up communication channels and tool access, and you start delegating within 48 hours.</p>
      </details>
      <details>
        <summary>How quickly can I get started?</summary>
        <p>Our onboarding is designed to move fast. After your initial discovery call and a signed service agreement, your assistant is fully briefed and ready to begin work within 48 hours. Most clients delegate their first tasks on day one.</p>
      </details>
      <details>
        <summary>Do I need to sign a long-term contract?</summary>
        <p>No long-term contracts required. We offer flexible monthly arrangements. However, clients who commit to 3+ months consistently report better results because the assistant develops deeper familiarity with your business and workflows.</p>
      </details>
      <details>
        <summary>What types of businesses do you work with?</summary>
        <p>We work with founders, solopreneurs, and growing businesses across many industries — including real estate, e-commerce, SaaS, agencies, consulting firms, and professional services. If you have tasks that consume your time and could be delegated, BizBackerz can help.</p>
      </details>
    </section>

    <section>
      <h2>Services &amp; Capabilities</h2>
      <details>
        <summary>What tasks can my virtual assistant handle?</summary>
        <p>Our VAs handle a wide range of tasks including email and calendar management, customer support, social media management, content creation, lead generation, data entry, research, project coordination, e-commerce operations, accounting support, and much more. During onboarding we build a custom task list tailored to your specific business needs.</p>
      </details>
      <details>
        <summary>Can my assistant handle specialised or technical tasks?</summary>
        <p>Yes. Our team includes specialists in different domains. If your requirements involve technical tools, niche platforms, or specialised knowledge, we match you with an assistant who has the relevant background. Specialised skills may affect pricing.</p>
      </details>
      <details>
        <summary>What software and tools does BizBackerz support?</summary>
        <p>Our assistants are proficient in a wide range of tools including Google Workspace, Microsoft Office, Slack, Asana, Trello, HubSpot, Salesforce, Shopify, WordPress, QuickBooks, Xero, Canva, and many more. If you use a specific tool, let us know during onboarding and we will confirm compatibility.</p>
      </details>
      <details>
        <summary>Can I have more than one virtual assistant?</summary>
        <p>Absolutely. Many of our growing clients start with one assistant and scale to a team as their needs expand. We can provide specialists for different areas — for example, one assistant for admin and one for social media management.</p>
      </details>
    </section>

    <section>
      <h2>Communication &amp; Availability</h2>
      <details>
        <summary>What are your operating hours?</summary>
        <p>Our primary operating hours are Monday to Friday, 11:00 AM – 8:00 PM Eastern Time (ET), with Saturday availability from 11:00 AM to 5:00 PM ET. For clients in different time zones, we can accommodate flexible scheduling. Response times within business hours are guaranteed within 2 hours.</p>
      </details>
      <details>
        <summary>How do I communicate with my assistant?</summary>
        <p>We adapt to your preferred communication style. Most clients use email, Slack, WhatsApp, or a project management tool like Asana or Notion. We set up your preferred channels during onboarding and stick to them consistently so nothing falls through the cracks.</p>
      </details>
      <details>
        <summary>Will I always have the same assistant?</summary>
        <p>Yes. We believe continuity is critical for quality. You will be assigned a dedicated assistant who becomes your consistent point of contact and develops deep familiarity with your business, preferences, and workflow over time.</p>
      </details>
      <details>
        <summary>What happens if my assistant is unavailable?</summary>
        <p>In the rare event your primary assistant is unavailable, we have a trained backup system in place. Your assigned assistant maintains detailed task logs so that any cover can pick up seamlessly without disruption to your business.</p>
      </details>
    </section>

    <section>
      <h2>Pricing &amp; Billing</h2>
      <details>
        <summary>How is pricing structured?</summary>
        <p>Pricing is based on the scope and complexity of your requirements, the number of hours needed per week, and whether specialist skills are involved. We offer flexible hourly packages and monthly retainer plans. Book a free discovery call to discuss your needs and receive a personalised quote.</p>
      </details>
      <details>
        <summary>Is the initial consultation really free?</summary>
        <p>Yes, completely free and with no obligation. Our 30-minute strategy call is designed purely to understand your business challenges and explore whether BizBackerz is the right fit. There is no pressure and no sales pitch — just an honest conversation.</p>
      </details>
      <details>
        <summary>What payment methods do you accept?</summary>
        <p>We accept bank transfers, PayPal, and major credit/debit cards. Invoices are issued monthly and are due within 14 days. For clients outside the UK or US, we work with international payment platforms to make the process straightforward.</p>
      </details>
    </section>

    <section>
      <h2>Security &amp; Privacy</h2>
      <details>
        <summary>Is my business information kept confidential?</summary>
        <p>Absolutely. Confidentiality is one of our core commitments. All team members sign strict confidentiality agreements. We never share client information, data, or business details with any third party. We are also happy to sign a mutual NDA before onboarding.</p>
      </details>
      <details>
        <summary>How do you handle access to my business accounts and systems?</summary>
        <p>We use secure access protocols and recommend using shared access features (like Google Workspace user management or 1Password Teams) rather than sharing personal passwords. All access is logged, and we revoke credentials immediately upon end of engagement.</p>
      </details>
      <details>
        <summary>Is my data stored securely?</summary>
        <p>Yes. We use industry-standard encryption for data in transit and at rest. We comply with applicable data protection regulations including GDPR. Please review our <a href="/privacy">Privacy Policy</a> for full details on how we handle personal data.</p>
      </details>
    </section>

    <p><a href="/booking">Book a free consultation</a> | <a href="/contact">Send us a message</a></p>
  </article>
</main>`,
  },

  {
    path: '/privacy',
    title: 'Privacy Policy | BizBackerz Virtual Assistance',
    description: 'BizBackerz privacy policy — how we collect, use, and protect your personal data when you use our virtual assistant services.',
    bodyHtml: `<main>
  <article>
    <h1>Privacy Policy — BizBackerz</h1>
    <p>This Privacy Policy explains how BizBackerz collects, uses, and protects your personal data when you use our website or virtual assistant services. We are committed to protecting your privacy and complying with applicable data protection regulations including GDPR.</p>
    <p>BizBackerz is headquartered in London, United Kingdom. For any privacy-related questions or requests, please contact us at <a href="mailto:Hello@bizbackerz.com">Hello@bizbackerz.com</a>.</p>
  </article>
</main>`,
  },

  {
    path: '/terms',
    title: 'Terms & Conditions | BizBackerz Virtual Assistance',
    description: 'BizBackerz terms and conditions governing the use of our virtual assistant services and client responsibilities.',
    bodyHtml: `<main>
  <article>
    <h1>Terms &amp; Conditions — BizBackerz</h1>
    <p>These Terms and Conditions govern your use of BizBackerz virtual assistant services and our website at bizbackerz.com. By engaging our services, you agree to these terms. Please read them carefully.</p>
    <p>BizBackerz is headquartered in London, United Kingdom. For questions about these terms, contact us at <a href="mailto:Hello@bizbackerz.com">Hello@bizbackerz.com</a>.</p>
  </article>
</main>`,
  },
]

/* ── Inject meta tags + body content into a cloned index.html ── */
function injectMeta(html, { path, title, description, bodyHtml }) {
  const canonical  = `${BASE_URL}${path}`
  const safeTitle  = escapeHtml(title)
  const safeDesc   = escapeHtml(description)
  const safeCanon  = escapeHtml(canonical)

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${safeDesc}" />`)
  html = html.replace(/<meta name="title"[^>]*>/, `<meta name="title" content="${safeTitle}" />`)
  html = html.replace(/<meta property="og:title"[^>]*>/,       `<meta property="og:title" content="${safeTitle}" />`)
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${safeDesc}" />`)
  html = html.replace(/<meta property="og:url"[^>]*>/,          `<meta property="og:url" content="${safeCanon}" />`)
  html = html.replace(/<meta name="twitter:title"[^>]*>/,       `<meta name="twitter:title" content="${safeTitle}" />`)
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${safeDesc}" />`)
  html = html.replace(/<meta name="twitter:url"[^>]*>/,         `<meta name="twitter:url" content="${safeCanon}" />`)
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${safeCanon}" />`)

  const hreflangTags = [
    `<link rel="alternate" hreflang="en-US"     href="${BASE_URL}${path}" data-hreflang="true" />`,
    `<link rel="alternate" hreflang="en-GB"     href="https://bizbackerz.co.uk${path}" data-hreflang="true" />`,
    `<link rel="alternate" hreflang="x-default" href="${BASE_URL}${path}" data-hreflang="true" />`,
  ].join('\n    ')
  html = html.replace('</head>', `  ${hreflangTags}\n  </head>`)

  /* Inject body content so crawlers see real text without executing JS */
  if (bodyHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`)
  }

  return html
}

function injectBlogMeta(html, blog) {
  const title     = blog.seoTitle       || blog.title
  const desc      = blog.seoDescription || blog.excerpt || ''
  const canonical = `${BASE_URL}/blog/${blog.slug}`
  const ogImage   = blog.ogImage || blog.coverImage || `${BASE_URL}/og-image.jpg`
  const dateISO   = blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString()
  const modISO    = blog.updatedAt  ? new Date(blog.updatedAt).toISOString()  : dateISO
  const keywords  = [blog.focusKeyword, blog.seoKeywords, blog.tag].filter(Boolean).join(', ')
  const robots    = blog.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

  /* ── Head meta ── */
  html = html.replace(/<title>[^<]*<\/title>/,
    `<title>${escapeHtml(title)} | BizBackerz Blog</title>`)
  html = html.replace(/<meta name="title"[^>]*>/,
    `<meta name="title" content="${escapeHtml(title)}" />`)
  html = html.replace(/<meta name="description"[^>]*>/,
    `<meta name="description" content="${escapeHtml(desc)}" />`)
  html = html.replace(/<meta name="robots"[^>]*>/,
    `<meta name="robots" content="${robots}" />`)
  html = html.replace(/<meta property="og:type"[^>]*>/,
    `<meta property="og:type" content="article" />`)
  html = html.replace(/<meta property="og:title"[^>]*>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`)
  html = html.replace(/<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${escapeHtml(desc)}" />`)
  html = html.replace(/<meta property="og:url"[^>]*>/,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`)
  html = html.replace(/<meta property="og:image"[^>]*>/,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`)
  html = html.replace(/<meta name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
  html = html.replace(/<meta name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${escapeHtml(desc)}" />`)
  html = html.replace(/<meta name="twitter:image"[^>]*>/,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`)
  html = html.replace(/<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`)

  /* ── hreflang ── */
  const hreflangTags = [
    `<link rel="alternate" hreflang="en-US"     href="${BASE_URL}/blog/${blog.slug}" data-hreflang="true" />`,
    `<link rel="alternate" hreflang="en-GB"     href="https://bizbackerz.co.uk/blog/${blog.slug}" data-hreflang="true" />`,
    `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/blog/${blog.slug}" data-hreflang="true" />`,
  ].join('\n    ')

  /* ── JSON-LD BlogPosting schema ── */
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonical}#article`,
    'headline': title,
    'description': desc,
    'datePublished': dateISO,
    'dateModified': modISO,
    'author': {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      'name': blog.author || 'BizBackerz',
      'url': BASE_URL,
    },
    'publisher': {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      'name': 'BizBackerz',
      'url': BASE_URL,
      'logo': { '@type': 'ImageObject', 'url': `${BASE_URL}/logo/navbar.png` },
    },
    'mainEntityOfPage': { '@type': 'WebPage', '@id': canonical },
    'url': canonical,
    'image': ogImage,
    'inLanguage': 'en-US',
    'keywords': keywords,
    ...(blog.category ? { 'articleSection': blog.category } : {}),
    ...(blog.readTime  ? { 'timeRequired': `PT${blog.readTime}M` } : {}),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: title,  item: canonical },
    ],
  }

  /* ── Inject hreflang + schemas before </head> ── */
  html = html.replace('</head>',
    `  ${hreflangTags}\n` +
    `  <script type="application/ld+json">${JSON.stringify(schema)}</script>\n` +
    `  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>\n` +
    `  </head>`)

  /* ── Inject article content into #root ──────────────────────
     React will replace this on mount, but Google reads it immediately
     without needing to execute JavaScript or make an API call.
  ── */
  const dateFormatted = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const faqSection = blog.qna?.length > 0
    ? `<section>
        <h2>Frequently Asked Questions</h2>
        ${blog.qna
          .filter(q => q.question && q.answer)
          .map(q => `<details><summary>${escapeHtml(q.question)}</summary><p>${escapeHtml(q.answer)}</p></details>`)
          .join('\n        ')}
      </section>`
    : ''

  const articleContent = `<main>
      <article>
        <header>
          <span>${escapeHtml(blog.tag || '')}</span>
          ${dateFormatted ? `<time datetime="${dateISO}">${dateFormatted}</time>` : ''}
          <h1>${escapeHtml(blog.title)}</h1>
          ${blog.excerpt ? `<p>${escapeHtml(blog.excerpt)}</p>` : ''}
          <span>${escapeHtml(blog.author || 'BizBackerz')}</span>
        </header>
        <div>${blog.content || ''}</div>
        ${faqSection}
      </article>
    </main>`

  html = html.replace('<div id="root"></div>', `<div id="root">${articleContent}</div>`)

  return html
}

function writeRoute(html, routePath) {
  const dir  = join(DIST, routePath.replace(/^\//, ''))
  const file = join(dir, 'index.html')
  try {
    mkdirSync(dir, { recursive: true })
    writeFileSync(file, html, 'utf8')
    console.log(`  ✓ ${routePath}`)
  } catch (err) {
    console.error(`  ✗ ${routePath} — ${err.message}`)
    process.exit(1)
  }
}

/* ── Fetch + prerender all blog posts ───────────────────────── */
async function prerenderBlogs(baseHtml) {
  console.log(`\n📝  Fetching blog posts from ${API_URL}/api/blogs ...\n`)

  let blogs = []
  try {
    const res  = await fetch(`${API_URL}/api/blogs?limit=200&page=1`)
    const data = await res.json()
    if (!data.success || !Array.isArray(data.blogs)) throw new Error('Unexpected API response')
    blogs = data.blogs
  } catch (err) {
    console.warn(`  ⚠  Could not reach API (${err.message}) — blog post prerendering skipped.`)
    console.warn('     Set PRERENDER_API_URL env var to the production API URL and rebuild.\n')
    return []
  }

  if (blogs.length === 0) {
    console.log('  ℹ  No published blog posts found.')
    return []
  }

  console.log(`  Found ${blogs.length} blogs. Fetching full content...\n`)

  const slugs = []
  for (const stub of blogs) {
    try {
      const res  = await fetch(`${API_URL}/api/blogs/${stub.slug}`)
      const data = await res.json()
      if (!data.success || !data.blog) { console.warn(`  ⚠  Skipped ${stub.slug} (API error)`); continue }
      const html = injectBlogMeta(baseHtml, data.blog)
      writeRoute(html, `/blog/${stub.slug}`)
      slugs.push({ slug: stub.slug, lastmod: data.blog.updatedAt || data.blog.createdAt })
    } catch (err) {
      console.warn(`  ⚠  Skipped ${stub.slug} — ${err.message}`)
    }
  }

  return slugs
}

/* ── Generate sitemap-blog.xml — always writes, even when empty ─ */
function writeBlogSitemap(slugEntries) {
  const urls = slugEntries.map(({ slug, lastmod }) => {
    const lastmodStr = lastmod
      ? new Date(lastmod).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    return `  <url>\n    <loc>${BASE_URL}/blog/${slug}</loc>\n    <lastmod>${lastmodStr}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
  const file = join(DIST, 'sitemap-blog.xml')
  writeFileSync(file, xml, 'utf8')

  if (slugEntries.length > 0) {
    console.log(`\n🗺️   sitemap-blog.xml written with ${slugEntries.length} blog URLs`)
  } else {
    console.log(`\n🗺️   sitemap-blog.xml written (empty — no published posts or API unreachable)`)
  }
}

/* ── Main ───────────────────────────────────────────────────── */
async function run() {
  const indexPath = join(DIST, 'index.html')
  if (!existsSync(indexPath)) {
    console.error('❌  dist/index.html not found — run `vite build` first.')
    process.exit(1)
  }

  const baseHtml = readFileSync(indexPath, 'utf8')

  console.log('\n📄  Injecting per-route meta tags and body content...\n')
  for (const route of ROUTES) {
    const html = injectMeta(baseHtml, route)
    writeRoute(html, route.path)
  }

  const blogSlugs = await prerenderBlogs(baseHtml)
  writeBlogSitemap(blogSlugs)

  const total = ROUTES.length + blogSlugs.length
  console.log(`\n✅  Done — ${ROUTES.length} static routes + ${blogSlugs.length} blog posts pre-rendered (${total} total).`)
  console.log('    Each route has real body content — crawlers see full text without executing JavaScript.\n')
}

run()
