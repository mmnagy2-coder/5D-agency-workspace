import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { brand, brandColour } from './config/brand.js'
import './styles.css'

// White label: the shell takes its brand colour, accent and display face
// from the client's brand config.
function applyBrandTokens() {
  const root = document.documentElement.style
  root.setProperty('--brand', brandColour('night'))
  root.setProperty('--brand-ink', brandColour('milk'))
  root.setProperty('--brand-accent', brandColour('saffron'))
  root.setProperty('--display', `'${brand.type.display.family}', Georgia, serif`)
  document.title = brand.workspaceName
}
applyBrandTokens()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
