import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Luneby } from './luneby'
import { registerServiceWorker } from './register-sw'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Luneby />
  </StrictMode>,
)

registerServiceWorker()
