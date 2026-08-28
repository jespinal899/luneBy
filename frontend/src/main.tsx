import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import { Luneby } from './luneby'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Luneby />
  </StrictMode>,
)
