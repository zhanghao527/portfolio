import { useState, useRef, useCallback } from 'react'
import WheelNav from './WheelNav'

const SECTIONS = ['项目', '技术栈', '博客']
const STEP = 120

/* ─── Page Components ─── */

function ProjectsPage() {
  const projects = [
    { name: '社区时间线', desc: '基于 React + Node.js 的社交平台' },
    { name: '足迹地图', desc: '地图可视化旅行记录应用' },
    { name: '管理后台', desc: 'Ant Design 企业级后台系统' },
    { name: '开源工具库', desc: '日常开发中沉淀的工具集' },
  ]
  return (
    <div className="page-inner">
      <h1>项目</h1>
      <p>一些我参与构建的东西。</p>
      <div className="project-grid">
        {projects.map((p) => (
          <div className="project-card" key={p.name}>
            <h3>{p.name}</h3>
            <span>{p.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TechPage() {
  const techs = [
    'React', 'TypeScript', 'Node.js', 'Vue.js', 'Go',
    'PostgreSQL', 'Redis', 'Docker', 'Vite', 'Tailwind CSS',
  ]
  return (
    <div className="page-inner">
      <h1>技术栈</h1>
      <p>我日常使用和熟悉的技术。</p>
      <div className="tech-list">
        {techs.map((t) => (
          <div className="tech-tag" key={t}>{t}</div>
        ))}
      </div>
    </div>
  )
}

function BlogPage() {
  const posts = [
    { title: '从零搭建一个全栈应用', date: '2026-03-15' },
    { title: 'React 性能优化实战笔记', date: '2026-02-20' },
    { title: '我的 2025 年度技术总结', date: '2026-01-05' },
  ]
  return (
    <div className="page-inner">
      <h1>博客</h1>
      <p>写点技术思考和踩坑记录。</p>
      <div className="blog-list">
        {posts.map((p) => (
          <div className="blog-item" key={p.title}>
            <h3>{p.title}</h3>
            <span>{p.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const PAGES = [ProjectsPage, TechPage, BlogPage]

const GLOW_COLORS = [
  'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)',
  'radial-gradient(circle, rgba(123,97,255,0.08) 0%, transparent 70%)',
  'radial-gradient(circle, rgba(255,107,157,0.08) 0%, transparent 70%)',
]

/*
 * The trick: we DON'T counter-rotate during the spin.
 *
 * Phase 1: Content rotates WITH the container (user sees it spinning) + fades out
 * Phase 2: Swap page content (invisible, opacity=0)
 * Phase 3: Snap rotation to 0 instantly (no transition), then fade in
 *
 * This way the user sees real rotation of the actual content.
 */

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [angle, setAngle] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'swapping'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSelect = useCallback((newIndex: number) => {
    if (newIndex === activeIndex || phase !== 'idle') return

    // Calculate shortest rotation
    let delta = (newIndex - activeIndex) * STEP
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360

    setActiveIndex(newIndex)

    // Phase 1: spin + fade out (CSS transition active)
    setPhase('spinning')
    setAngle(delta)

    // Phase 2: after spin completes, swap content
    timerRef.current = setTimeout(() => {
      setPhase('swapping')
      setDisplayIndex(newIndex)

      // Snap angle back to 0 instantly (transition is disabled in 'swapping' phase)
      requestAnimationFrame(() => {
        setAngle(0)
        // Phase 3: after a frame, re-enable transitions and fade in
        requestAnimationFrame(() => {
          setPhase('idle')
        })
      })
    }, 600)
  }, [activeIndex, phase])

  const Page = PAGES[displayIndex]

  // Only animate rotation during 'spinning' phase
  const shouldAnimate = phase === 'spinning'
  const opacity = phase === 'spinning' || phase === 'swapping' ? 0 : 1

  return (
    <div className="viewport">
      <div className="glow" style={{ background: GLOW_COLORS[activeIndex] }} />

      {/* The rotating wrapper — content rotates WITH it, no counter-rotation */}
      <div
        className="spin-container"
        style={{
          transform: `rotate(${angle}deg)`,
          transition: shouldAnimate
            ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'none',
        }}
      >
        <div
          className="content-wrapper"
          style={{
            opacity,
            transition: shouldAnimate
              ? 'opacity 0.4s ease'
              : phase === 'idle'
                ? 'opacity 0.35s ease 0.05s'
                : 'none',
          }}
        >
          <Page />
        </div>
      </div>

      <WheelNav
        sections={SECTIONS}
        activeIndex={activeIndex}
        onSelect={handleSelect}
      />
    </div>
  )
}
