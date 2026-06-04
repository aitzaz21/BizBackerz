import React from 'react'
import ReactDOM from 'react-dom/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App'
import './index.css'
import { reportWebVitals } from './utils/reportWebVitals'

// Register GSAP plugins globally ONCE
gsap.registerPlugin(ScrollTrigger)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Start collecting Core Web Vitals → sends to GA4 as custom events
reportWebVitals()
