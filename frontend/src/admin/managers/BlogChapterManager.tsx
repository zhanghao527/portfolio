import { useState, useEffect, useCallback } from 'react'
import { listBlogChapters, addBlogChapter, updateBlogChapter, deleteBlogChapter } from '@/api/contentController'

export default function BlogChapterManager() {
  const [items, setItems] = useState<API.BlogChapterVO[]>([])
  const [editing, setEditing] = useState<API.BlogChapterVO | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await listBlogChapters()
      setItems(res.data || [])
    } catch {}
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = () => {
    setEditing({ name: '', icon: '📄', description: '', link: '', sortOrder: 0 })
    setIsNew(true)
    setMsg('')
  }

  const handleEdit = (item: API.BlogChapterVO) => {
    setEditing({ ...item })
    setIsNew(false)
    setMsg('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return
    try {
      await deleteBlogChapter({ id })
      load()
      setMsg('已删除')
    } catch (e: any) { setMsg(e.message) }
  }

  const handleSave = async () => {
    if (!editing) return
    try {
      if (isNew) {
        await addBlogChapter(editing as API.BlogChapterAddRequest)
      } else {
        await updateBlogChapter(editing as API.BlogChapterUpdateRequest)
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
        <h2>博客管理</h2>
        <button className="admin-btn-add" onClick={handleAdd}>+ 新增章节</button>
      </div>
      {msg && <p className="admin-msg">{msg}</p>}

      {editing && (
        <div className="admin-edit-panel">
          <h3>{isNew ? '新增章节' : '编辑章节'}</h3>
          <div className="admin-form">
            <label>名称<input value={editing.name || ''} onChange={e => set('name', e.target.value)} /></label>
            <label>图标<input value={editing.icon || ''} onChange={e => set('icon', e.target.value)} /></label>
            <label>描述<input value={editing.description || ''} onChange={e => set('description', e.target.value)} /></label>
            <label>语雀链接<input value={editing.link || ''} onChange={e => set('link', e.target.value)} /></label>
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
          <tr><th>排序</th><th>图标</th><th>名称</th><th>描述</th><th>链接</th><th>操作</th></tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.sortOrder}</td>
              <td>{item.icon}</td>
              <td>{item.name}</td>
              <td className="admin-td-desc">{item.description}</td>
              <td className="admin-td-desc"><a href={item.link} target="_blank" rel="noreferrer">{item.link}</a></td>
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
