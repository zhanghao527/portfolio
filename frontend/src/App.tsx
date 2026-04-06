import { usePageFlip } from './usePageFlip'

const SECTIONS = ['关于我', '项目', '技术栈', '博客']

/* ─── Cover page ─── */
function CoverContent() {
  return (
    <div className="cover-body">
      <div className="cover-inner">
        <div className="cover-avatar">Z</div>
        <h1 className="cover-title">关于我</h1>
        <div className="cover-divider" />
        <p className="cover-desc">全栈开发者 · 开源爱好者</p>
        <p className="cover-bio">
          热爱技术，喜欢用代码解决问题。<br />
          专注于 Web 全栈开发，持续学习中。
        </p>
        <div className="cover-links">
          <span className="cover-link">GitHub</span>
          <span className="cover-link">Blog</span>
          <span className="cover-link">Email</span>
        </div>
      </div>
      <p className="cover-flip-hint">翻开 →</p>
    </div>
  )
}

/* ─── Page content ─── */
function ProjectsContent() {
  const projects = [
    { name: '社区时间线', desc: '基于 React + Node.js 的社交平台', icon: '🌐' },
    { name: '足迹地图', desc: '地图可视化旅行记录应用', icon: '🗺️' },
    { name: '管理后台', desc: 'Ant Design 企业级后台系统', icon: '⚙️' },
    { name: '开源工具库', desc: '日常开发中沉淀的工具集', icon: '📦' },
  ]
  return (
    <div className="page-body">
      <h1>项目</h1>
      <p className="subtitle">一些我参与构建的东西</p>
      <div className="divider" />
      <div className="project-grid">
        {projects.map((p) => (
          <div className="project-card" key={p.name}>
            <span className="card-icon">{p.icon}</span>
            <div>
              <h3>{p.name}</h3>
              <span>{p.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TechContent() {
  const techs = [
    'React', 'TypeScript', 'Node.js', 'Vue.js', 'Go',
    'PostgreSQL', 'Redis', 'Docker', 'Vite', 'Tailwind CSS',
    'Spring Boot', 'MyBatis',
  ]
  return (
    <div className="page-body">
      <h1>技术栈</h1>
      <p className="subtitle">我日常使用和熟悉的技术</p>
      <div className="divider" />
      <div className="tech-list">
        {techs.map((t) => (
          <span className="tech-tag" key={t}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function BlogContent() {
  const posts = [
    { title: '从零搭建一个全栈应用', date: '2026-03-15', tag: '全栈' },
    { title: 'React 性能优化实战笔记', date: '2026-02-20', tag: '前端' },
    { title: '我的 2025 年度技术总结', date: '2026-01-05', tag: '随笔' },
  ]
  return (
    <div className="page-body">
      <h1>博客</h1>
      <p className="subtitle">写点技术思考和踩坑记录</p>
      <div className="divider" />
      <div className="blog-list">
        {posts.map((p) => (
          <div className="blog-item" key={p.title}>
            <div className="blog-meta">
              <span className="blog-tag">{p.tag}</span>
              <span className="blog-date">{p.date}</span>
            </div>
            <h3>{p.title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}

const PAGE_CONTENTS = [CoverContent, ProjectsContent, TechContent, BlogContent]

export default function App() {
  const { state, canvasRef, containerRef, flipToPage, getClipPaths, getFoldRightEdgeY, getFoldLeftEdgeY } = usePageFlip(PAGE_CONTENTS.length)
  const { currentPage, flipping, targetPage, progress, direction } = state
  const { currentClip, backClip, backTransform, showNext } = getClipPaths()

  const CurrentContent = PAGE_CONTENTS[currentPage]
  const NextContent = PAGE_CONTENTS[targetPage] ?? PAGE_CONTENTS[currentPage]

  // Bookmark positioning: current page's bookmark sticks to the page's right edge
  // When flipping forward, the fold line crosses the right edge — bookmark follows that point
  const foldRightY = getFoldRightEdgeY()
  const foldLeftY = getFoldLeftEdgeY()

  // Calculate which bookmarks go left vs right, considering in-flight flip
  // During a forward flip, currentPage's bookmark travels from right → left
  // During a backward flip, targetPage's bookmark travels from left → right
  const getBookmarkSide = (i: number): 'left' | 'right' | 'moving' => {
    if (flipping) {
      if (direction === 'forward' && i === currentPage) return 'moving'
      if (direction === 'backward' && i === targetPage) return 'moving'
    }
    return i < currentPage ? 'left' : 'right'
  }

  // For the moving bookmark: mirror its original position through the fold line
  // so it appears on the flipped paper's edge, rotated to match the fold angle
  const getMovingStyle = (i: number): React.CSSProperties => {
    const bookEl = containerRef.current
    if (!bookEl) return { top: `${80 + i * 52}px`, right: '-44px' }
    const rect = bookEl.getBoundingClientRect()
    const w = rect.width, h = rect.height
    const baseTop = 80 + i * 52
    const bmCenterY = baseTop + 25

    const { finger, corner } = state
    const origin = (() => {
      switch (corner) {
        case 'top-right': return { x: w, y: 0 }
        case 'bottom-right': return { x: w, y: h }
        case 'top-left': return { x: 0, y: 0 }
        case 'bottom-left': return { x: 0, y: h }
      }
    })()

    // Fold line: midpoint of finger↔origin, perpendicular to finger→origin
    const mid = { x: (finger.x + origin.x) / 2, y: (finger.y + origin.y) / 2 }
    const foldDirX = -(origin.y - finger.y) // perpendicular direction
    const foldDirY = origin.x - finger.x

    // Find where fold line crosses y = bmCenterY
    // P = mid + t * foldDir => P.y = mid.y + t * foldDirY = bmCenterY
    let foldX: number
    if (Math.abs(foldDirY) > 0.001) {
      const t = (bmCenterY - mid.y) / foldDirY
      foldX = mid.x + t * foldDirX
    } else {
      foldX = mid.x
    }

    // foldX is where the fold line is — that's the edge of the remaining page.
    // The flipped paper's edge is the MIRROR of the original right edge about the fold line.
    const isForward = direction === 'forward'
    const origEdgeX = isForward ? w : 0
    const mirrorEdgeX = 2 * foldX - origEdgeX

    // If fold hasn't reached this bookmark's y-level yet, keep it at original position
    if (isForward && foldX >= w) {
      return { top: `${baseTop}px`, right: '-44px', left: 'auto', transition: 'none' }
    }
    if (!isForward && foldX <= 0) {
      return { top: `${baseTop}px`, left: '-44px', right: 'auto', transition: 'none' }
    }

    // Fold line angle
    const foldAngleRad = Math.atan2(foldDirY, foldDirX)
    const tiltDeg = (foldAngleRad * 180 / Math.PI) - 90

    // Clamp mirrorEdgeX to book bounds
    const clampedX = Math.max(-40, Math.min(w, mirrorEdgeX))

    return {
      position: 'absolute' as const,
      top: `${baseTop}px`,
      left: `${clampedX}px`,
      right: 'auto',
      width: '40px',
      transform: `rotate(${-tiltDeg}deg)`,
      transformOrigin: 'left center',
      borderRadius: '0 6px 6px 0',
      transition: 'none',
    }
  }

  return (
    <div className="app">
      {/* Book */}
      <div className="book-container">
        <div className="book" ref={containerRef}>
          {/* Layer 1: Next page (full, underneath) */}
          {showNext && (
            <div className="page-layer" style={{ zIndex: 1 }}>
              <NextContent />
              <div className="page-num">{targetPage + 1} / {PAGE_CONTENTS.length}</div>
            </div>
          )}

          {/* Layer 2: Current page (clipped along fold line) */}
          <div
            className="page-layer"
            style={{
              clipPath: flipping ? currentClip : 'none',
              zIndex: 2,
            }}
          >
            <CurrentContent />
            <div className="page-num">{currentPage + 1} / {PAGE_CONTENTS.length}</div>
          </div>

          {/* Layer 3: Canvas — opaque paper back + shadows */}
          <canvas ref={canvasRef} className="flip-canvas" style={{ zIndex: 3 }} />

          {/* Layer 4: Mirrored content on paper back (on top of canvas) */}
          {showNext && backClip !== 'none' && (
            <div
              className="page-back-clip"
              style={{ clipPath: backClip, zIndex: 4 }}
            >
              <div
                className="page-layer page-back-mirror"
                style={{ transform: backTransform, transformOrigin: '0 0' }}
              >
                <CurrentContent />
              </div>
            </div>
          )}
        </div>

        {/* Bookmark tabs — follow the flip */}
        {SECTIONS.map((s, i) => {
          const side = getBookmarkSide(i)

          if (side === 'moving') {
            return (
              <button
                key={s}
                className="bookmark bookmark-moving"
                style={getMovingStyle(i)}
              >
                {s}
              </button>
            )
          }

          if (side === 'left') {
            return (
              <button
                key={s}
                className="bookmark bookmark-left"
                onClick={() => flipToPage(i)}
                style={{ top: `${80 + i * 52}px` }}
              >
                {s}
              </button>
            )
          }

          return (
            <button
              key={s}
              className={`bookmark bookmark-right ${i === currentPage ? 'bookmark-active' : ''}`}
              onClick={() => flipToPage(i)}
              style={{ top: `${80 + i * 52}px` }}
            >
              {s}
            </button>
          )
        })}
      </div>

      {/* Bottom page dots */}
      <div className="bottom-bar">
        <div className="dots">
          {SECTIONS.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === currentPage ? 'dot-on' : ''}`}
              onClick={() => flipToPage(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
