import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '@/api/contentController'

export default function ProfileManager() {
  const [form, setForm] = useState<API.ProfileUpdateRequest>({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getProfile().then(res => {
      if (res.data) {
        setForm({
          name: res.data.name,
          roleTitle: res.data.roleTitle,
          bio: res.data.bio,
          avatar: res.data.avatar,
          githubUrl: res.data.githubUrl,
          email: res.data.email,
        })
      }
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setMsg('')
    try {
      await updateProfile(form)
      setMsg('保存成功')
    } catch (e: any) {
      setMsg(e.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="admin-manager">
      <h2>个人信息</h2>
      <div className="admin-form">
        <label>姓名<input value={form.name || ''} onChange={e => set('name', e.target.value)} /></label>
        <label>角色头衔<input value={form.roleTitle || ''} onChange={e => set('roleTitle', e.target.value)} /></label>
        <label>个人简介<textarea value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={3} /></label>
        <label>头像 URL<input value={form.avatar || ''} onChange={e => set('avatar', e.target.value)} /></label>
        <label>GitHub<input value={form.githubUrl || ''} onChange={e => set('githubUrl', e.target.value)} /></label>
        <label>邮箱<input value={form.email || ''} onChange={e => set('email', e.target.value)} /></label>
        <div className="admin-form-actions">
          <button onClick={handleSave} disabled={loading}>{loading ? '保存中...' : '保存'}</button>
          {msg && <span className="admin-msg">{msg}</span>}
        </div>
      </div>
    </div>
  )
}
