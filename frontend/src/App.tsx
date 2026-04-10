import { useCallback, useEffect, useState, useRef } from 'react'
import { usePageFlip } from './usePageFlip'
import { useAutoPaginate } from './useAutoPaginate'
import { SECTIONS, PROFILE, loadContentData } from './pageData'

/* ─── Page number bar with hover-to-input jump ─── */
function PageNumBar({ pageIdx, getPageInfo, onGlobalJump, onSectionJump }: {
  pageIdx: number
  getPageInfo: (idx: number) => { global: string; section: string | null; sectionIdx: number; subIdx: number; sectionLen: number }
  onGlobalJump: (val: string) => void
  onSectionJump: (val: string, pageIdx: number) => void
}) {
  const info = getPageInfo(pageIdx)
  const [globalHover, setGlobalHover] = useState(false)
  const [sectionHover, setSectionHover] = useState(false)
  const [globalVal, setGlobalVal] = useState('')
  const [sectionVal, setSectionVal] = useState('')
  const globalRef = useRef<HTMLInputElement>(null)
  const sectionRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (globalHover && globalRef.current) globalRef.current.focus() }, [globalHover])
  useEffect(() => { if (sectionHover && sectionRef.current) sectionRef.current.focus() }, [sectionHover])

  // When hover leaves, submit if there's a value
  useEffect(() => {
    if (!globalHover && globalVal) { onGlobalJump(globalVal); setGlobalVal('') }
  }, [globalHover])
  useEffect(() => {
    if (!sectionHover && sectionVal) { onSectionJump(sectionVal, pageIdx); setSectionVal('') }
  }, [sectionHover])

  return (
    <div className="page-num">
      <span
        className="page-num-item"
        onMouseEnter={() => setGlobalHover(true)}
        onMouseLeave={() => setGlobalHover(false)}
      >
        {globalHover ? (
          <input
            ref={globalRef}
            className="page-num-input"
            type="text"
            placeholder={`1-${info.global.split('/')[1]?.trim()}`}
            value={globalVal}
            onChange={e => setGlobalVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { onGlobalJump(globalVal); setGlobalVal(''); setGlobalHover(false) } }}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          />
        ) : info.global}
      </span>
      {info.section && (
        <>
          <span className="page-num-sep">·</span>
          <span
            className="page-num-item"
            onMouseEnter={() => setSectionHover(true)}
            onMouseLeave={() => setSectionHover(false)}
          >
            {sectionHover ? (
              <input
                ref={sectionRef}
                className="page-num-input"
                type="text"
                placeholder={`1-${info.sectionLen}`}
                value={sectionVal}
                onChange={e => setSectionVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onSectionJump(sectionVal, pageIdx); setSectionVal(''); setSectionHover(false) } }}
                onMouseDown={e => e.stopPropagation()}
                onClick={e => e.stopPropagation()}
              />
            ) : info.section}
          </span>
        </>
      )}
    </div>
  )
}

/* ─── Cover page (always 1 physical page) ─── */
function CoverContent() {
  return (
    <div className="cover-body">
      <div className="cover-inner">
        {/* Avatar */}
        <div className="cover-avatar">
          <img className="cover-avatar-img" src={PROFILE.avatar} alt={PROFILE.name} />
        </div>

        {/* Name & role */}
        <h1 className="cover-name">{PROFILE.name}</h1>
        <p className="cover-role">{PROFILE.roleTitle}</p>

        {/* Divider */}
        <div className="cover-divider" />

        {/* Bio */}
        <p className="cover-bio">{PROFILE.bio}</p>

        {/* Social pills */}
        <div className="cover-links">
          {PROFILE.githubUrl && (
            <a className="cover-pill" href={PROFILE.githubUrl} target="_blank" rel="noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
          )}
          {PROFILE.email && (
            <span className="cover-pill cover-pill-email">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
              Email
              <span className="cover-email-tooltip">{PROFILE.email}</span>
            </span>
          )}
        </div>
      </div>

      {/* Flip hint */}
      <p className="cover-flip-hint">翻开 →</p>
    </div>
  )
}

export default function App() {
  // Load content data from backend on mount
  const [dataLoaded, setDataLoaded] = useState(false)
  useEffect(() => {
    loadContentData().finally(() => setDataLoaded(true))
  }, [])

  // We need book dimensions for pagination measurement.
  // Use a sizing ref to get the actual book size.
  const [bookSize, setBookSize] = useState({ w: 0, h: 0 })

  const { pages, sectionToPages, pageToSection, categoryPageMap, ready } = useAutoPaginate(
    dataLoaded ? bookSize.w : 0,
    dataLoaded ? bookSize.h : 0,
  )
  const totalPages = ready ? pages.length : 1

  const {
    state, canvasRef, containerRef, flipToPage,
    getClipPaths, sizeRef,
  } = usePageFlip(totalPages)

  // Measure book size on mount and resize
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current
      if (el) {
        const r = el.getBoundingClientRect()
        setBookSize(prev => {
          if (Math.abs(prev.w - r.width) < 1 && Math.abs(prev.h - r.height) < 1) return prev
          return { w: r.width, h: r.height }
        })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [containerRef])

  // Handle category click → jump to page
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onClick = (e: MouseEvent) => {
      // Project category jump
      const catTarget = (e.target as HTMLElement).closest('[data-jump-category]')
      if (catTarget) {
        const cat = catTarget.getAttribute('data-jump-category')
        if (cat && categoryPageMap[cat] !== undefined) {
          flipToPage(categoryPageMap[cat])
        }
        return
      }
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [categoryPageMap, flipToPage, containerRef])

  const { currentPage, flipping, targetPage, progress, direction } = state
  const { currentClip, backClip, backTransform, showNext } = getClipPaths()

  // ── Page content renderers ──
  const renderPage = useCallback((pageIdx: number) => {
    if (!ready || pageIdx < 0 || pageIdx >= pages.length) return null
    const page = pages[pageIdx]
    // Section 0 (cover) uses special component
    if (page.sectionIndex === 0) return <CoverContent />
    const Content = page.render
    return <Content />
  }, [ready, pages])

  // ── Section ↔ page mapping for bookmarks ──
  const getSectionForPage = (pageIdx: number): number => {
    if (!ready) return 0
    return pageToSection[pageIdx] ?? 0
  }

  const currentSection = getSectionForPage(flipping ? targetPage : currentPage)

  // Bookmark: which section's first page is the bookmark target
  const getBookmarkTargetPage = (sectionIdx: number): number => {
    if (!ready || !sectionToPages[sectionIdx]) return sectionIdx
    return sectionToPages[sectionIdx][0] ?? 0
  }

  const getBookmarkSide = (sectionIdx: number): 'left' | 'right' | 'moving' => {
    const firstPage = getBookmarkTargetPage(sectionIdx)
    const lastPage = ready && sectionToPages[sectionIdx]
      ? sectionToPages[sectionIdx][sectionToPages[sectionIdx].length - 1]
      : firstPage

    if (flipping) {
      const currentSec = getSectionForPage(currentPage)
      const targetSec = getSectionForPage(targetPage)

      if (currentSec !== targetSec) {
        // Determine where this bookmark would be BEFORE and AFTER the flip.
        // Before: based on currentPage; After: based on targetPage.
        const wouldBeLeftBefore = lastPage < currentPage
        const wouldBeLeftAfter = lastPage < targetPage

        // Only animate bookmarks whose side actually changes during this flip
        if (wouldBeLeftBefore !== wouldBeLeftAfter) return 'moving'
      }
    }

    // Section is "left" if all its pages are before currentPage
    if (lastPage < currentPage) return 'left'
    return 'right'
  }

  const getMovingStyle = (sectionIdx: number): { style: React.CSSProperties; textRotate: number } => {
    const bookEl = containerRef.current
    if (!bookEl) return { style: { top: `${40 + sectionIdx * 58}px`, right: '-46px' }, textRotate: 0 }
    const rect = bookEl.getBoundingClientRect()
    const w = rect.width, h = rect.height
    const baseTop = 40 + sectionIdx * 58
    const bmH = 50
    const bmW = 46 // match active bookmark width

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
    const topPt = { x: edgeX, y: baseTop }
    const botPt = { x: edgeX, y: baseTop + bmH }

    const mid = { x: (finger.x + origin.x) / 2, y: (finger.y + origin.y) / 2 }
    const nx = origin.x - finger.x, ny = origin.y - finger.y
    const nLen = Math.sqrt(nx * nx + ny * ny) || 1
    const ux = nx / nLen, uy = ny / nLen

    if (progress < 0.03) {
      if (isForward) return { style: { top: `${baseTop}px`, right: '-46px', left: 'auto', width: '46px', borderRadius: '0 8px 8px 0', transition: 'none' }, textRotate: 0 }
      else return { style: { top: `${baseTop}px`, left: '-46px', right: 'auto', width: '46px', borderRadius: '8px 0 0 8px', transition: 'none' }, textRotate: 0 }
    }

    const foldDirX = -(origin.y - finger.y)
    const foldDirY = origin.x - finger.x
    const midY = (topPt.y + botPt.y) / 2
    if (Math.abs(foldDirY) > 0.001) {
      const t = (midY - mid.y) / foldDirY
      const foldXHere = mid.x + t * foldDirX
      if (isForward && foldXHere > w) return { style: { top: `${baseTop}px`, right: '-46px', left: 'auto', width: '46px', borderRadius: '0 8px 8px 0', transition: 'none' }, textRotate: 0 }
      if (!isForward && foldXHere < 0) return { style: { top: `${baseTop}px`, left: '-46px', right: 'auto', width: '46px', borderRadius: '8px 0 0 8px', transition: 'none' }, textRotate: 0 }
    }

    const mirror = (p: { x: number; y: number }) => {
      const dx = p.x - mid.x, dy = p.y - mid.y
      const dot = dx * ux + dy * uy
      return { x: p.x - 2 * dot * ux, y: p.y - 2 * dot * uy }
    }
    const mTop = mirror(topPt)
    const mBot = mirror(botPt)

    const cx = (mTop.x + mBot.x) / 2
    const cy = (mTop.y + mBot.y) / 2
    const angleDeg = Math.atan2(mBot.y - mTop.y, mBot.x - mTop.x) * 180 / Math.PI

    if (cx < -60 || cx > w + 60 || cy < -60 || cy > h + 60) {
      if (isForward) return { style: { top: `${baseTop}px`, left: '-46px', right: 'auto', width: '46px', borderRadius: '8px 0 0 8px', transition: 'none' }, textRotate: 0 }
      else return { style: { top: `${baseTop}px`, right: '-46px', left: 'auto', width: '46px', borderRadius: '0 8px 8px 0', transition: 'none' }, textRotate: 0 }
    }

    const perpRad = (angleDeg + 90) * Math.PI / 180
    const offsetX = isForward ? Math.cos(perpRad) * bmW : -Math.cos(perpRad) * bmW
    const offsetY = isForward ? Math.sin(perpRad) * bmW : -Math.sin(perpRad) * bmW

    const bmCx = cx + offsetX / 2
    const bmCy = cy + offsetY / 2
    const rotateDeg = angleDeg - 90

    return {
      style: {
        position: 'absolute' as const,
        top: `${bmCy - bmH / 2}px`,
        left: `${bmCx - bmW / 2}px`,
        right: 'auto',
        width: `${bmW}px`,
        transform: `rotate(${rotateDeg}deg)`,
        transformOrigin: 'center center',
        borderRadius: isForward ? '8px 0 0 8px' : '0 8px 8px 0',
        transition: 'none',
      },
      textRotate: 0,
    }
  }

  // ── Page number display ──
  const getPageInfo = (pageIdx: number) => {
    if (!ready) return { global: '1 / 1', section: null as string | null, sectionIdx: 0, subIdx: 0, sectionLen: 1 }
    const section = pageToSection[pageIdx]
    const sectionPages = sectionToPages[section]
    const subIdx = sectionPages ? sectionPages.indexOf(pageIdx) : 0
    const sectionLen = sectionPages ? sectionPages.length : 1
    return {
      global: `${pageIdx + 1} / ${totalPages}`,
      section: sectionLen > 1 ? `${SECTIONS[section]} ${subIdx + 1}/${sectionLen}` : null,
      sectionIdx: section,
      subIdx,
      sectionLen,
    }
  }

  const handleGlobalJump = (val: string) => {
    const n = parseInt(val, 10)
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      flipToPage(n - 1)
    }
  }

  const handleSectionJump = (val: string, pageIdx: number) => {
    if (!ready) return
    const section = pageToSection[pageIdx]
    const sectionPages = sectionToPages[section]
    if (!sectionPages) return
    const n = parseInt(val, 10)
    if (!isNaN(n) && n >= 1 && n <= sectionPages.length) {
      flipToPage(sectionPages[n - 1])
    }
  }

  return (
    <div className="app">
      <div className="book-container">
        <div className="book" ref={containerRef}>
          {/* Layer 1: Next page */}
          {showNext && (
            <div className="page-layer" style={{ zIndex: 1 }}>
              {renderPage(targetPage)}
              <PageNumBar pageIdx={targetPage} getPageInfo={getPageInfo} onGlobalJump={handleGlobalJump} onSectionJump={handleSectionJump} />
            </div>
          )}

          {/* Layer 2: Current page (clipped) */}
          <div
            className="page-layer"
            style={{ clipPath: flipping ? currentClip : 'none', zIndex: 2 }}
          >
            {renderPage(currentPage)}
            <PageNumBar pageIdx={currentPage} getPageInfo={getPageInfo} onGlobalJump={handleGlobalJump} onSectionJump={handleSectionJump} />
          </div>

          {/* Layer 3: Canvas shadows */}
          <canvas ref={canvasRef} className="flip-canvas" style={{ zIndex: 3 }} />

          {/* Layer 4: Mirrored back */}
          {showNext && backClip !== 'none' && (
            <div className="page-back-clip" style={{ clipPath: backClip, zIndex: 4 }}>
              <div
                className="page-layer page-back-mirror"
                style={{ transform: backTransform, transformOrigin: '0 0' }}
              >
                {renderPage(currentPage)}
              </div>
            </div>
          )}

          {/* Loading state */}
          {!ready && (
            <div className="page-layer" style={{ zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>排版中…</p>
            </div>
          )}
        </div>

        {/* Bookmarks — always 4, one per section */}
        {SECTIONS.map((s, i) => {
          const side = getBookmarkSide(i)
          const targetPage = getBookmarkTargetPage(i)

          if (side === 'moving') {
            const { style: movStyle } = getMovingStyle(i)
            const isTarget = i === currentSection
            return (
              <button key={s} className={`bookmark bookmark-moving${isTarget ? ' bookmark-moving-active' : ''}`} style={movStyle}>
                <span>{s}</span>
              </button>
            )
          }

          if (side === 'left') {
            return (
              <button
                key={s}
                className="bookmark bookmark-left"
                onClick={() => flipToPage(targetPage)}
                style={{ top: `${40 + i * 58}px` }}
              >
                {s}
              </button>
            )
          }

          return (
            <button
              key={s}
              className={`bookmark bookmark-right ${i === currentSection ? 'bookmark-active' : ''}`}
              onClick={() => flipToPage(targetPage)}
              style={{ top: `${40 + i * 58}px` }}
            >
              {s}
            </button>
          )
        })}
      </div>

    </div>
  )
}
