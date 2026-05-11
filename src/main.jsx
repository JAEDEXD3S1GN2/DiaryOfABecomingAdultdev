import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import AllProviders from './Providers.jsx'
import ScrollToTop from './components/useScrolltoTop/useScrolltoTop.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Toaster position="top-right" reverseOrder={false}  toastOptions={{
    duration: 3000,
    style: {
      background: "#333",
      color: "#fff",
    },
  }} />
  <AllProviders>
    <ScrollToTop />
    <App />
    </AllProviders>
    </BrowserRouter>
  </StrictMode>,
)
