import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply saved theme before first paint to prevent flash
const savedTheme = localStorage.getItem('tas_theme') || 'dark'
if (savedTheme === 'dark') document.body.classList.add('dark-theme')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
