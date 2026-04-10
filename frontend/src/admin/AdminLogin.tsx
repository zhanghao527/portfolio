import { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/stores'
import { setLoginUser } from '@/stores/loginUser'
import { userLogin } from '@/api/userController'
import { setAccessToken } from '@/libs/auth'

export default function AdminLogin() {
  const dispatch = useDispatch<AppDispatch>()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!account || !password) { setError('请输入账号和密码'); return }
    setLoading(true)
    setError('')
    try {
      const res = await userLogin({ userAccount: account, userPassword: password })
      if (res.data) {
        if (res.data.userRole !== 'admin') {
          setError('需要管理员权限')
          return
        }
        setAccessToken(res.data.token || '')
        dispatch(setLoginUser(res.data))
      }
    } catch (e: any) {
      setError(e.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1>Portfolio 管理后台</h1>
        <p>请使用管理员账号登录</p>
        <input
          type="text"
          placeholder="账号"
          value={account}
          onChange={e => setAccount(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        {error && <p className="admin-login-error">{error}</p>}
        <button onClick={handleLogin} disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
      </div>
    </div>
  )
}
