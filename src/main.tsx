import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Apply the stored/preferred theme before the first paint to avoid a flash of the wrong theme.
const storedTheme = localStorage.getItem('parafiasetup_theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
if (storedTheme === 'dark' || (storedTheme === null && prefersDark)) {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
