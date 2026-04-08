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
  const getMovingStyle = (i: number): { style: React.CSSProperties; textRotate: number } => {
    const bookEl = containerRef.current
    if (!bookEl) return { style: { top: `${40 + i * 58}px`, right: '-44px' }, textRotate: 0 }
    const rect = bookEl.getBoundingClientRect()
    const w = rect.width, h = rect.height
    const baseTop = 40 + i * 58
    const bmH = 50 // bookmark height

    const { finger, corner } = state
    const origin = (() => {
      switch (corner) {
        case 'top-right': return { x: w, y: 0 }
        case 'bottom-right': return { x: w, y: h }
        case 'top-left': return { x: 0, y: 0 }
        case 'bottom-left': return { x: 0, y: h }
      }
    })()

    const isForward = direction === 'forward'
    const edgeX = isForward ? w : 0

    // Two endpoints of the bookmark on the original page edge
    const topPt = { x: edgeX, y: baseTop }
    const botPt = { x: edgeX, y: baseTop + bmH }

    // Fold line
    const mid = { x: (finger.x + origin.x) / 2, y: (finger.y + origin.y) / 2 }
    const nx = origin.x - finger.x, ny = origin.y - finger.y
    const nLen = Math.sqrt(nx * nx + ny * ny) || 1
    const ux = nx / nLen, uy = ny / nLen

    // Small progress → keep at original position
    if (progress < 0.03) {
      if (isForward) return { style: { top: `${baseTop}px`, right: '-44px', left: 'auto', borderRadius: '0 6px 6px 0', transition: 'none' }, textRotate: 0 }
      else return { style: { top: `${baseTop}px`, left: '-44px', right: 'auto', borderRadius: '6px 0 0 6px', transition: 'none' }, textRotate: 0 }
    }

    // Check if fold has reached the bookmark
    const foldDirX = -(origin.y - finger.y)
    const foldDirY = origin.x - finger.x
    const midY = (topPt.y + botPt.y) / 2
    if (Math.abs(foldDirY) > 0.001) {
      const t = (midY - mid.y) / foldDirY
      const foldXHere = mid.x + t * foldDirX
      if (isForward && foldXHere > w) return { style: { top: `${baseTop}px`, right: '-44px', left: 'auto', borderRadius: '0 6px 6px 0', transition: 'none' }, textRotate: 0 }
      if (!isForward && foldXHere < 0) return { style: { top: `${baseTop}px`, left: '-44px', right: 'auto', borderRadius: '6px 0 0 6px', transition: 'none' }, textRotate: 0 }
    }

    // Mirror both endpoints through fold line
    const mirror = (p: { x: number; y: number }) => {
      const dx = p.x - mid.x, dy = p.y - mid.y
      const dot = dx * ux + dy * uy
      return { x: p.x - 2 * dot * ux, y: p.y - 2 * dot * uy }
    }
    const mTop = mirror(topPt)
    const mBot = mirror(botPt)

    // Bookmark center and angle from the two mirrored points
    const cx = (mTop.x + mBot.x) / 2
    const cy = (mTop.y + mBot.y) / 2
    const angleDeg = Math.atan2(mBot.y - mTop.y, mBot.x - mTop.x) * 180 / Math.PI

    // Out of bounds → clamp
    if (cx < -60 || cx > w + 60 || cy < -60 || cy > h + 60) {
      if (isForward) return { style: { top: `${baseTop}px`, left: '-44px', right: 'auto', borderRadius: '6px 0 0 6px', transition: 'none' }, textRotate: 0 }
      else return { style: { top: `${baseTop}px`, right: '-44px', left: 'auto', borderRadius: '0 6px 6px 0', transition: 'none' }, textRotate: 0 }
    }

    // The bookmark rectangle: 40px wide, bmH tall
    // It should extend OUTWARD from the mirrored page edge (away from page center)
    const bmW = 40
    // angleDeg is the direction from mTop to mBot (along the mirrored edge)
    // Perpendicular pointing outward: for forward flip, the page flips left,
    // so the mirrored edge's outward direction is to the LEFT (away from page)
    // For backward flip, outward is to the RIGHT
    const perpRad = (angleDeg + 90) * Math.PI / 180
    const offsetX = isForward ? Math.cos(perpRad) * bmW : -Math.cos(perpRad) * bmW
    const offsetY = isForward ? Math.sin(perpRad) * bmW : -Math.sin(perpRad) * bmW

    const bmCx = cx + offsetX / 2
    const bmCy = cy + offsetY / 2

    // CSS: position the bookmark center, rotate to match the edge angle
    // angleDeg is from horizontal; bookmark's natural orientation is vertical (top-to-bottom)
    // So we need to rotate by (angleDeg - 90) to align with the edge
    const rotateDeg = angleDeg - 90

    return {
      style: {
        position: 'absolute' as const,
        top: `${bmCy - bmH / 2}px`,
        left: `${bmCx - bmW / 2}px`,
        right: 'auto',
        transform: `rotate(${rotateDeg}deg)`,
        transformOrigin: 'center center',
        borderRadius: isForward ? '6px 0 0 6px' : '0 6px 6px 0',
        transition: 'none',
      },
      textRotate: 0,
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
            const { style: movStyle, textRotate } = getMovingStyle(i)
            return (
              <button
                key={s}
                className="bookmark bookmark-moving"
                style={movStyle}
              >
                <span style={textRotate ? { display: 'inline-block', transform: `rotate(${textRotate}deg)` } : undefined}>{s}</span>
              </button>
            )
          }

          if (side === 'left') {
            return (
              <button
                key={s}
                className="bookmark bookmark-left"
                onClick={() => flipToPage(i)}
                style={{ top: `${40 + i * 58}px` }}
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
              style={{ top: `${40 + i * 58}px` }}
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
