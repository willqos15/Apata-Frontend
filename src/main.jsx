import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {QueryClient, QueryClientProvider } from '@tanstack/react-query'

const cliente = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={cliente}>
    <App />
    </QueryClientProvider>
  </StrictMode>,
)
