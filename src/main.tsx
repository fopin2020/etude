import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { ThemeBoot } from './app/ThemeBoot'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeBoot />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
