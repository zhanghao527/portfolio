import { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/stores'
import { setLoginUser } from '@/stores/loginUser'
import { DEFAULT_USER } from '@/constants/user'
import { userLogout } from '@/api/userController'
import { clearAccessToken } from '@/libs/auth'
import ProfileManager from './managers/ProfileManager'
import ProjectManager from './managers/ProjectManager'
import TechManager from './managers/TechManager'
import BlogChapterManager from './managers/BlogChapterManager'

const TABS = ['个人信息', '项目管理', '技术栈管理', '博客管理'] as const

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const [activeTab, setActiveTab] = useState(0)

  const handleLogout = async () => {
    try { await userLogout() } catch {}
    clearAccessToken()
    dispatch(setLoginUser(DEFAULT_USER))
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Portfolio 管理后台</h1>
        <button className="admin-logout" onClick={handleLogout}>退出登录</button>
      </header>
      <div className="admin-body">
        <nav className="admin-nav">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`admin-nav-item${i === activeTab ? ' active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </nav>
        <main className="admin-content">
          {activeTab === 0 && <ProfileManager />}
          {activeTab === 1 && <ProjectManager />}
          {activeTab === 2 && <TechManager />}
          {activeTab === 3 && <BlogChapterManager />}
        </main>
      </div>
    </div>
  )
}
