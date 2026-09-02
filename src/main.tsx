import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

const blockZoom = (event: Event) => event.preventDefault()
for (const name of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(name, blockZoom)
}
document.addEventListener('touchmove', (event) => {
  if (event.touches.length > 1) event.preventDefault()
}, { passive: false })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
