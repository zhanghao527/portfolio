import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '@/stores'
import App from './App'
import AdminApp from './admin/AdminApp'
import InitAuth from '@/components/InitAuth'
import './index.css'

function Router() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route === '#/admin' || route.startsWith('#/admin/')) {
    return <AdminApp />
  }

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <InitAuth>
        <Router />
      </InitAuth>
    </Provider>
  </React.StrictMode>,
)
