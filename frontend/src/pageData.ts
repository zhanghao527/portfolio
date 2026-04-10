/**
 * Section data definitions.
 *
 * Data can be loaded from backend API or fall back to defaults.
 * Call `loadContentData()` on app startup to fetch from backend.
 */

import { getProfile, listProjects, listTechs, listBlogChapters } from './api/contentController'

// ── Types ──

export interface ProfileData {
  name: string
  roleTitle: string
  bio: string
  avatar: string
  githubUrl: string
  email: string
}

export interface ProjectItem {
  name: string
  desc: string
  icon: string
  category: string
  screenshot?: string
  link?: string
  github?: string
}

export interface TechItem {
  name: string
  icon: string
}

export interface TechGroup {
  category: string
  items: TechItem[]
}

export interface BlogChapter {
  name: string
  icon: string
  desc: string
  link: string
}

export const SECTIONS = ['关于我', '项目', '技术栈', '博客'] as const
export type SectionName = (typeof SECTIONS)[number]

// ── Default data (fallback when backend is unavailable) ──

const DEFAULT_PROFILE: ProfileData = {
  name: 'Zhang Hao',
  roleTitle: '全栈开发者 · 开源爱好者',
  bio: '热爱技术，喜欢用代码解决问题。专注于 Web 全栈开发，持续学习中。',
  avatar: '/avatar.jpg',
  githubUrl: 'https://github.com/zhanghao527',
  email: 'zhanghao527mail@163.com',
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  { name: '社区时间线', desc: '基于 React + Node.js 的社交平台', icon: '🌐', category: 'Web', link: 'https://github.com/zhanghao527', screenshot: 'https://picsum.photos/seed/proj1/400/200', github: 'https://github.com/zhanghao527' },
  { name: '管理后台', desc: 'Ant Design 企业级后台系统', icon: '⚙️', category: 'Web', link: 'https://github.com/zhanghao527', screenshot: 'https://picsum.photos/seed/proj2/400/200', github: 'https://github.com/zhanghao527' },
  { name: '博客系统', desc: '基于 Next.js + MDX 的个人博客', icon: '✍️', category: 'Web', screenshot: 'https://picsum.photos/seed/proj3/400/200', github: 'https://github.com/zhanghao527' },
  { name: '在线简历', desc: '响应式简历生成器，支持 PDF 导出', icon: '📄', category: 'Web' },
  { name: '足迹地图', desc: '地图可视化旅行记录，集成高德地图', icon: '🗺️', category: '小程序' },
  { name: '天气应用', desc: 'React Native 跨平台天气应用', icon: '🌤️', category: 'App' },
  { name: '智能浇灌系统', desc: 'ESP32 自动浇灌，土壤湿度传感 + 远程控制', icon: '🌱', category: '硬件' },
  { name: '环境监测站', desc: 'STM32 多传感器采集，OLED 显示 + 上云', icon: '📡', category: '嵌入式' },
  { name: '开源工具库', desc: '日常开发中沉淀的工具集', icon: '📦', category: '工具' },
  { name: '代码片段管理', desc: 'VS Code 插件，快速管理代码片段', icon: '🧩', category: '工具' },
]

const DEFAULT_TECH_GROUPS: TechGroup[] = [
  { category: '前端', items: [
    { name: 'React', icon: '⚛️' }, { name: 'Vue.js', icon: '💚' }, { name: 'TypeScript', icon: '🔷' },
    { name: 'Next.js', icon: '▲' }, { name: 'Tailwind CSS', icon: '🎨' }, { name: 'Vite', icon: '⚡' },
    { name: 'Webpack', icon: '📦' }, { name: 'Electron', icon: '🖥️' },
  ]},
  { category: '后端', items: [
    { name: 'Node.js', icon: '🟢' }, { name: 'Spring Boot', icon: '🍃' }, { name: 'Go', icon: '🐹' },
    { name: 'MyBatis', icon: '🗄️' }, { name: 'GraphQL', icon: '◈' },
  ]},
  { category: '数据库 & 存储', items: [
    { name: 'PostgreSQL', icon: '🐘' }, { name: 'Redis', icon: '🔴' },
  ]},
  { category: 'DevOps & 工具', items: [
    { name: 'Docker', icon: '🐳' }, { name: 'Nginx', icon: '🌐' }, { name: 'Linux', icon: '🐧' },
    { name: 'Git', icon: '🔀' }, { name: 'Figma', icon: '🎯' },
  ]},
]

const DEFAULT_BLOG_CHAPTERS: BlogChapter[] = [
  { name: '技术笔记', icon: '📝', desc: '前后端开发中的学习与实战', link: 'https://www.yuque.com' },
  { name: '架构思考', icon: '🏗️', desc: '系统设计与技术选型', link: 'https://www.yuque.com' },
  { name: '踩坑记录', icon: '🕳️', desc: '开发中遇到的问题与解决方案', link: 'https://www.yuque.com' },
  { name: '随笔', icon: '☕', desc: '年度总结与成长复盘', link: 'https://www.yuque.com' },
]

// ── Mutable state (populated by loadContentData) ──

export let PROFILE: ProfileData = { ...DEFAULT_PROFILE }
export let PROJECTS: ProjectItem[] = [...DEFAULT_PROJECTS]
export let TECH_GROUPS: TechGroup[] = DEFAULT_TECH_GROUPS.map(g => ({ ...g, items: [...g.items] }))
export let TECHS: string[] = TECH_GROUPS.flatMap(g => g.items.map(i => i.name))
export let BLOG_CHAPTERS: BlogChapter[] = [...DEFAULT_BLOG_CHAPTERS]
export const PROJECT_CATEGORIES = ['Web', '小程序', 'App', '硬件', '嵌入式', '工具'] as const

/**
 * Load all content data from backend API.
 * Falls back to defaults on failure.
 */
export async function loadContentData(): Promise<void> {
  const results = await Promise.allSettled([
    getProfile(),
    listProjects(),
    listTechs(),
    listBlogChapters(),
  ])

  // Profile
  if (results[0].status === 'fulfilled') {
    const p = results[0].value?.data
    if (p) {
      PROFILE = {
        name: p.name || DEFAULT_PROFILE.name,
        roleTitle: p.roleTitle || DEFAULT_PROFILE.roleTitle,
        bio: p.bio || DEFAULT_PROFILE.bio,
        avatar: p.avatar || DEFAULT_PROFILE.avatar,
        githubUrl: p.githubUrl || DEFAULT_PROFILE.githubUrl,
        email: p.email || DEFAULT_PROFILE.email,
      }
    }
  }

  // Projects
  if (results[1].status === 'fulfilled') {
    const list = results[1].value?.data
    if (list && list.length > 0) {
      PROJECTS = list.map(p => ({
        name: p.name || '',
        desc: p.description || '',
        icon: p.icon || '📁',
        category: p.category || 'Web',
        screenshot: p.screenshot,
        link: p.link,
        github: p.github,
      }))
    }
  }

  // Techs → group by category
  if (results[2].status === 'fulfilled') {
    const list = results[2].value?.data
    if (list && list.length > 0) {
      const groupMap = new Map<string, TechItem[]>()
      for (const t of list) {
        const cat = t.category || '其他'
        if (!groupMap.has(cat)) groupMap.set(cat, [])
        groupMap.get(cat)!.push({ name: t.name || '', icon: t.icon || '🔧' })
      }
      TECH_GROUPS = Array.from(groupMap.entries()).map(([category, items]) => ({ category, items }))
      TECHS = TECH_GROUPS.flatMap(g => g.items.map(i => i.name))
    }
  }

  // Blog chapters
  if (results[3].status === 'fulfilled') {
    const list = results[3].value?.data
    if (list && list.length > 0) {
      BLOG_CHAPTERS = list.map(b => ({
        name: b.name || '',
        icon: b.icon || '📄',
        desc: b.description || '',
        link: b.link || '#',
      }))
    }
  }
}
