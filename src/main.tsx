import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/accessibility.css'
import { loadSettings, applySettingsToDOM } from './game/settings'
import SchoolconomyApp from './SchoolconomyApp.tsx'

// Apply saved accessibility settings on boot
applySettingsToDOM(loadSettings());

// React will replace #root innerHTML — removes the boot fallback
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SchoolconomyApp />
  </StrictMode>,
)
