import React from 'react'
import ReactDOM from 'react-dom'
import '@/index.css'
import { App } from '@/app.tsx'

const rootElement = document.getElementById('app') as HTMLElement

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement,
)
