import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '@/stores'
import App from './App'
import InitAuth from '@/components/InitAuth'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <InitAuth>
        <App />
      </InitAuth>
    </Provider>
  </React.StrictMode>,
)
