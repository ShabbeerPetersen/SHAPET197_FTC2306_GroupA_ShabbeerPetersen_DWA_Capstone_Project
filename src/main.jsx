import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrismaneProvider } from "@prismane/core";
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrismaneProvider>
      <App />
    </PrismaneProvider>
  </React.StrictMode>,
)
