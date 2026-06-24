import { useEffect, useRef } from 'react'
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'
import { getStored, setStored } from '../../hooks/useStorage'

const TOUR_KEY = 'penny_tour_complete'

const STEPS = [
  {
    id: 'dashboard',
    attachTo: { element: '.tour-stat-cards', on: 'bottom' },
    title: 'Welcome to Penny 🪙',
    text: 'This is your Dashboard — your monthly financial snapshot. Income, spending, remaining budget, and bills due, all in one place. Let me show you around.',
  },
  {
    id: 'pennys-take',
    attachTo: { element: '.tour-pennys-take', on: 'bottom' },
    title: "Penny's Take",
    text: "This is where I give you your personal money brief. I read your actual numbers and tell you exactly what to focus on — starting with what you did right this month. Tap 'Get insight' to hear from me.",
  },
  {
    id: 'budget',
    attachTo: { element: '.tour-nav-budget', on: 'right' },
    title: 'Your budget',
    text: 'Set your spending targets here. Penny tracks budget vs actual in real time and colour codes everything so you always know where you stand.',
  },
  {
    id: 'transactions',
    attachTo: { element: '.tour-nav-transactions', on: 'right' },
    title: 'Transactions',
    text: 'Log income and expenses here, or import directly from your bank using a CSV. I will categorise everything automatically — no manual sorting needed.',
  },
  {
    id: 'debts',
    attachTo: { element: '.tour-nav-debts', on: 'right' },
    title: 'Debt Tracker',
    text: 'Add your debts and I will calculate your exact debt-free date. Choose Snowball or Avalanche — I will explain both and help you pick the right one for you.',
  },
  {
    id: 'circles',
    attachTo: { element: '.tour-nav-circles', on: 'right' },
    title: 'Penny Circles',
    text: "This is one of my favourite features. Create a savings Circle with your friends — contribute together, hold each other accountable, and win together. Tap here to explore.",
  },
  {
    id: 'ask-penny',
    attachTo: { element: '.tour-ask-penny', on: 'top' },
    title: 'Ask me anything',
    text: 'This gold coin is always here. Tap it any time to chat with me about your finances. Can you afford something? When will you be debt free? I am always one tap away.',
  },
  {
    id: 'settings',
    attachTo: { element: '.tour-nav-settings', on: 'right' },
    title: 'Make Penny yours',
    text: 'In Settings you can change your budgeting method, set your life situation, update your API key, and more. This is where Penny gets personalised to your life.',
  },
  {
    id: 'help',
    attachTo: { element: '.tour-nav-help', on: 'right' },
    title: 'The Penny Guide',
    text: 'Everything you need to know about Penny lives here — features, Penny Circles, Money School, and troubleshooting. Come back any time.',
  },
  {
    id: 'done',
    attachTo: { element: '.tour-stat-cards', on: 'bottom' },
    title: "You're all set! 🎉",
    text: "That is the quick tour. Add your first income or expense to get started, or tap Ask Penny if you have any questions. I am here whenever you need me.",
  },
]

const tourStyles = `
  .shepherd-element {
    border-radius: 14px !important;
    box-shadow: 0 8px 40px rgba(61,43,107,0.25) !important;
    max-width: 320px !important;
  }
  .shepherd-content {
    background: #3D2B6B !important;
    border-radius: 14px !important;
    padding: 0 !important;
  }
  .shepherd-header {
    background: #3D2B6B !important;
    border-radius: 14px 14px 0 0 !important;
    padding: 1.1rem 1.25rem 0.5rem !important;
  }
  .shepherd-title {
    color: #FFD166 !important;
    font-family: 'DM Serif Display', Georgia, serif !important;
    font-size: 17px !important;
    font-weight: 400 !important;
  }
  .shepherd-cancel-icon {
    color: rgba(255,255,255,0.5) !important;
    font-size: 20px !important;
  }
  .shepherd-cancel-icon:hover { color: #fff !important; }
  .shepherd-text {
    background: #3D2B6B !important;
    color: rgba(255,255,255,0.88) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 14px !important;
    line-height: 1.65 !important;
    padding: 0.25rem 1.25rem 1rem !important;
  }
  .shepherd-footer {
    background: rgba(0,0,0,0.15) !important;
    border-radius: 0 0 14px 14px !important;
    padding: 0.75rem 1rem !important;
    display: flex !important;
    gap: 8px !important;
    justify-content: flex-end !important;
  }
  .shepherd-button {
    border-radius: 8px !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    padding: 7px 14px !important;
    cursor: pointer !important;
    border: none !important;
    transition: opacity 0.15s !important;
  }
  .shepherd-button:hover { opacity: 0.85 !important; }
  .shepherd-button-primary {
    background: #FFD166 !important;
    color: #2A1D4E !important;
  }
  .shepherd-button-secondary {
    background: rgba(255,255,255,0.12) !important;
    color: rgba(255,255,255,0.7) !important;
  }
  .shepherd-arrow:before {
    background: #3D2B6B !important;
  }
  .shepherd-has-cancel-icon .shepherd-cancel-icon { background: none !important; }
`

function injectStyles() {
  if (document.getElementById('penny-tour-styles')) return
  const style = document.createElement('style')
  style.id = 'penny-tour-styles'
  style.textContent = tourStyles
  document.head.appendChild(style)
}

export function startTour(force = false) {
  if (!force && getStored(TOUR_KEY)) return null
  injectStyles()

  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: { enabled: true },
      scrollTo: { behavior: 'smooth', block: 'center' },
      modalOverlayOpeningRadius: 8,
      modalOverlayOpeningPadding: 6,
    },
  })

  STEPS.forEach((step, i) => {
    const isLast = i === STEPS.length - 1
    const isFirst = i === 0

    const buttons = []

    // Skip on first step only
    if (isFirst) {
      buttons.push({
        text: 'Skip tour',
        classes: 'shepherd-button-secondary',
        action() {
          setStored(TOUR_KEY, true)
          tour.cancel()
        },
      })
    }

    // Back button (not on first)
    if (!isFirst) {
      buttons.push({
        text: '← Back',
        classes: 'shepherd-button-secondary',
        action() { tour.back() },
      })
    }

    // Next / Complete
    buttons.push({
      text: isLast ? "Let's go! 🪙" : 'Next →',
      classes: 'shepherd-button-primary',
      action() {
        if (isLast) {
          setStored(TOUR_KEY, true)
          tour.complete()
        } else {
          tour.next()
        }
      },
    })

    const attachTo = step.attachTo
      ? { element: step.attachTo.element, on: step.attachTo.on }
      : undefined

    tour.addStep({
      id: step.id,
      title: step.title,
      text: step.text,
      ...(attachTo ? { attachTo } : {}),
      buttons,
      when: {
        show() {
          // If target element not found, just show centered
          if (attachTo) {
            const el = document.querySelector(attachTo.element)
            if (!el) {
              const stepObj = tour.getCurrentStep()
              stepObj?.updateStepOptions({ attachTo: undefined })
            }
          }
        },
      },
    })
  })

  tour.on('complete', () => setStored(TOUR_KEY, true))
  tour.on('cancel', () => setStored(TOUR_KEY, true))

  // Small delay so DOM is ready
  setTimeout(() => tour.start(), 400)
  return tour
}

export default function PennyTour() {
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    startTour()
  }, [])

  return null
}
