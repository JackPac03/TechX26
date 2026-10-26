import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { NetworkGate } from './EntranceCheck'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NetworkGate>
      <App />
    </NetworkGate>
  </StrictMode>,
)
