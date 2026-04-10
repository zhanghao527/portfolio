import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/stores'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import './admin.css'

export default function AdminApp() {
  const loginUser = useSelector((state: RootState) => state.loginUser)
  const isAdmin = loginUser.userRole === 'admin'

  if (!isAdmin) {
    return <AdminLogin />
  }

  return <AdminDashboard />
}
