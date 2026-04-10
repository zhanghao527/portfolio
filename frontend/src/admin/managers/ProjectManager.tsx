import { useState, useEffect, useCallback } from 'react'
import { listProjects, addProject, updateProject, deleteProject } from '@/api/contentController'

export default function ProjectManager() {
  const [items, setItems] = useState<API.ProjectVO[]>([])
  const [editing, setEditing] = useState<API.ProjectVO | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await listProjects()
      setItems(res.data || [])
    } catch {}
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = () => {
    setEditing({ name: '', description: '', icon: '📁', category: 'Web', sortOrder: 0 })
    setIsNew(true)
    setMsg('')
  }

  const handleEdit = (item: API.ProjectVO) => {
    setEditing({ ...item })
    setIsNew(false)
    setMsg('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return
    try {
      await deleteProject({ id })
      load()
      setMsg('已删除')
    } catch (e: any) { setMsg(e.message) }
  }

  const handleSave = async () => {
    if (!editing) return
    try {
      if (isNew) {
        await addProject(editing as API.ProjectAddRequest)
      } else {
        await updateProject(editing as API.ProjectUpdateRequest)
      }
      setEditing(null)
      load()
      setMsg('保存成功')
    } catch (e: any) { setMsg(e.message) }
  }

  const set = (key: string, val: any) => setEditing(prev => prev ? { ...prev, [key]: val } : null)

  return (
    <div className="admin-manager">
      <div className="admin-manager-header">
        <h2>项目管理</h2>
        <button className="admin-btn-add" onClick={handleAdd}>+ 新增项目</button>
      </div>
      {msg && <p className="admin-msg">{msg}</p>}

      {editing && (
        <div className="admin-edit-panel">
          <h3>{isNew ? '新增项目' : '编辑项目'}</h3>
          <div className="admin-form">
            <label>名称<input value={editing.name || ''} onChange={e => set('name', e.target.value)} /></label>
            <label>描述<input value={editing.description || ''} onChange={e => set('description', e.target.value)} /></label>
            <label>图标<input value={editing.icon || ''} onChange={e => set('icon', e.target.value)} /></label>
            <label>分类
              <select value={editing.category || 'Web'} onChange={e => set('category', e.target.value)}>
                {['Web', '小程序', 'App', '硬件', '嵌入式', '工具'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>截图 URL<input value={editing.screenshot || ''} onChange={e => set('screenshot', e.target.value)} /></label>
            <label>项目链接<input value={editing.link || ''} onChange={e => set('link', e.target.value)} /></label>
            <label>GitHub<input value={editing.github || ''} onChange={e => set('github', e.target.value)} /></label>
            <label>排序<input type="number" value={editing.sortOrder ?? 0} onChange={e => set('sortOrder', Number(e.target.value))} /></label>
            <div className="admin-form-actions">
              <button onClick={handleSave}>保存</button>
              <button className="admin-btn-cancel" onClick={() => setEditing(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr><th>排序</th><th>图标</th><th>名称</th><th>分类</th><th>描述</th><th>操作</th></tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.sortOrder}</td>
              <td>{item.icon}</td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td className="admin-td-desc">{item.description}</td>
              <td className="admin-td-actions">
                <button onClick={() => handleEdit(item)}>编辑</button>
                <button className="admin-btn-danger" onClick={() => handleDelete(item.id!)}>删除</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} className="admin-td-empty">暂无数据</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
