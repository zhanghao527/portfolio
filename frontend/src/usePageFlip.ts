/**
 * 单页仿真翻页引擎 v4
 *
 * 四层结构：
 * 1. DOM: 下一页（底层，全显示）
 * 2. DOM: 当前页（clip-path polygon 沿折线裁剪，只显示未翻起部分）
 * 3. DOM: 当前页镜像（clip-path 裁剪到纸张背面区域，低透明度 + 镜像变换）
 * 4. Canvas: 纸张背面底色 + 折痕阴影 + 投射阴影
 */

import { useRef, useState, useCallback, useEffect } from 'react'

interface Point { x: number; y: number }

export interface FlipState {
  currentPage: number
  flipping: boolean
  direction: 'forward' | 'backward'
  targetPage: number
  finger: Point
  corner: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  progress: number
}

const INITIAL: FlipState = {
  currentPage: 0, flipping: false, direction: 'forward',
  targetPage: 0, finger: { x: 0, y: 0 }, corner: 'bottom-right', progress: 0,
}

// ── Geometry ──

function getFoldLine(finger: Point, origin: Point) {
  const mid: Point = { x: (finger.x + origin.x) / 2, y: (finger.y + origin.y) / 2 }
  return { mid, dirX: -(origin.y - finger.y), dirY: origin.x - finger.x }
}

function foldLineIntersections(mid: Point, dirX: number, dirY: number, w: number, h: number): Point[] {
  const pts: Point[] = []
  if (dirY !== 0) { const t = -mid.y / dirY; const x = mid.x + t * dirX; if (x >= -0.5 && x <= w + 0.5) pts.push({ x: clamp(x, 0, w), y: 0 }) }
  if (dirY !== 0) { const t = (h - mid.y) / dirY; const x = mid.x + t * dirX; if (x >= -0.5 && x <= w + 0.5) pts.push({ x: clamp(x, 0, w), y: h }) }
  if (dirX !== 0) { const t = -mid.x / dirX; const y = mid.y + t * dirY; if (y >= -0.5 && y <= h + 0.5) pts.push({ x: 0, y: clamp(y, 0, h) }) }
  if (dirX !== 0) { const t = (w - mid.x) / dirX; const y = mid.y + t * dirY; if (y >= -0.5 && y <= h + 0.5) pts.push({ x: w, y: clamp(y, 0, h) }) }
  const unique: Point[] = []
  for (const p of pts) { if (!unique.some(u => Math.abs(u.x - p.x) < 1 && Math.abs(u.y - p.y) < 1)) unique.push(p) }
  return unique.slice(0, 2)
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

function sideOfFoldLine(p: Point, mid: Point, dx: number, dy: number): number {
  return (p.x - mid.x) * dy - (p.y - mid.y) * dx
}

function rectCorners(w: number, h: number): Point[] {
  return [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }]
}

function clipRectByFoldLine(
  foldPts: Point[], mid: Point, dirX: number, dirY: number,
  w: number, h: number, origin: Point
): { kept: Point[]; flipped: Point[] } {
  if (foldPts.length < 2) return { kept: rectCorners(w, h), flipped: [] }
  const corners = rectCorners(w, h)
  const originSign = sideOfFoldLine(origin, mid, dirX, dirY)
  const kept: Point[] = []
  const flipped: Point[] = []
  for (let i = 0; i < corners.length; i++) {
    const c = corners[i]
    const next = corners[(i + 1) % corners.length]
    const cSide = sideOfFoldLine(c, mid, dirX, dirY)
    if (cSide * originSign <= 0) kept.push(c); else flipped.push(c)
    const nextSide = sideOfFoldLine(next, mid, dirX, dirY)
    if (cSide * nextSide < 0) {
      const fp = foldPts.find(p => isOnEdge(p, c, next))
      if (fp) { kept.push(fp); flipped.push(fp) }
    }
  }
  return { kept, flipped }
}

function isOnEdge(p: Point, a: Point, b: Point): boolean {
  return p.x >= Math.min(a.x, b.x) - 1 && p.x <= Math.max(a.x, b.x) + 1 &&
         p.y >= Math.min(a.y, b.y) - 1 && p.y <= Math.max(a.y, b.y) + 1
}

function mirrorPoint(p: Point, mid: Point, nx: number, ny: number): Point {
  const len = Math.sqrt(nx * nx + ny * ny) || 1
  const ux = nx / len, uy = ny / len
  const dx = p.x - mid.x, dy = p.y - mid.y
  const dot = dx * ux + dy * uy
  return { x: p.x - 2 * dot * ux, y: p.y - 2 * dot * uy }
}

function pointsToPolygonCSS(pts: Point[], w: number, h: number): string {
  if (pts.length < 3) return 'none'
  return `polygon(${pts.map(p => `${(p.x / w * 100).toFixed(2)}% ${(p.y / h * 100).toFixed(2)}%`).join(', ')})`
}

// ── Hook ──

export function usePageFlip(totalPages: number) {
  const [state, setState] = useState<FlipState>(INITIAL)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef(0)
  const stateRef = useRef(state)
  stateRef.current = state

  const dragActive = useRef(false)
  const hasMoved = useRef(false)
  const startPos = useRef<Point>({ x: 0, y: 0 })
  const dragCorner = useRef<FlipState['corner']>('bottom-right')
  const dragTarget = useRef(0)
  const dragDir = useRef<'forward' | 'backward'>('forward')
  const sizeRef = useRef({ w: 600, h: 800 })

  // Cache container size
  const updateSize = useCallback(() => {
    const el = containerRef.current
    if (el) {
      const r = el.getBoundingClientRect()
      sizeRef.current = { w: r.width, h: r.height }
    }
  }, [])

  const getCornerOrigin = useCallback((corner: FlipState['corner'], w: number, h: number): Point => {
    switch (corner) {
      case 'top-right': return { x: w, y: 0 }
      case 'bottom-right': return { x: w, y: h }
      case 'top-left': return { x: 0, y: 0 }
      case 'bottom-left': return { x: 0, y: h }
    }
  }, [])

  // ── Draw canvas (shadows only, no content) ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const dpr = window.devicePixelRatio || 1
    const { w, h } = sizeRef.current
    canvas.width = w * dpr; canvas.height = h * dpr
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    const { flipping, finger, corner } = stateRef.current
    if (!flipping) return

    const origin = getCornerOrigin(corner, w, h)
    const nx = origin.x - finger.x, ny = origin.y - finger.y
    const { mid, dirX, dirY } = getFoldLine(finger, origin)
    const foldPts = foldLineIntersections(mid, dirX, dirY, w, h)
    if (foldPts.length < 2) return

    const { flipped } = clipRectByFoldLine(foldPts, mid, dirX, dirY, w, h, origin)
    if (flipped.length < 3) return

    const mirrored = flipped.map(p => mirrorPoint(p, mid, nx, ny))

    // 1. Paper back base color (under the mirrored DOM layer)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(mirrored[0].x, mirrored[0].y)
    for (let i = 1; i < mirrored.length; i++) ctx.lineTo(mirrored[i].x, mirrored[i].y)
    ctx.closePath()
    ctx.clip()
    ctx.fillStyle = '#eae8e2'
    ctx.fillRect(0, 0, w, h)
    // Gradient
    const gradAngle = Math.atan2(ny, nx)
    const backGrad = ctx.createLinearGradient(mid.x, mid.y, mid.x + Math.cos(gradAngle) * 80, mid.y + Math.sin(gradAngle) * 80)
    backGrad.addColorStop(0, 'rgba(0,0,0,0.06)')
    backGrad.addColorStop(0.5, 'rgba(0,0,0,0.02)')
    backGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = backGrad
    ctx.fillRect(0, 0, w, h)
    ctx.restore()

    // 2. Fold line shadow
    ctx.save()
    const fLen = Math.sqrt(dirX * dirX + dirY * dirY) || 1
    const fdx = dirX / fLen, fdy = dirY / fLen
    const nLen = Math.sqrt(nx * nx + ny * ny) || 1
    const shadowNx = -nx / nLen, shadowNy = -ny / nLen
    const shadowW = 15
    const sg = ctx.createLinearGradient(mid.x, mid.y, mid.x + shadowNx * shadowW, mid.y + shadowNy * shadowW)
    sg.addColorStop(0, 'rgba(0,0,0,0.12)')
    sg.addColorStop(1, 'rgba(0,0,0,0)')
    const ext = Math.max(w, h) * 2
    ctx.beginPath()
    ctx.moveTo(mid.x - fdx * ext, mid.y - fdy * ext)
    ctx.lineTo(mid.x + fdx * ext, mid.y + fdy * ext)
    ctx.lineTo(mid.x + fdx * ext + shadowNx * shadowW, mid.y + fdy * ext + shadowNy * shadowW)
    ctx.lineTo(mid.x - fdx * ext + shadowNx * shadowW, mid.y - fdy * ext + shadowNy * shadowW)
    ctx.closePath()
    ctx.fillStyle = sg
    ctx.fill()
    ctx.restore()

    // 3. Drop shadow
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(mirrored[0].x, mirrored[0].y)
    for (let i = 1; i < mirrored.length; i++) ctx.lineTo(mirrored[i].x, mirrored[i].y)
    ctx.closePath()
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = shadowNx * 5
    ctx.shadowOffsetY = shadowNy * 5
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fill()
    ctx.restore()
  }, [getCornerOrigin])

  // ── Clip paths ──
  const getClipPaths = useCallback((): {
    currentClip: string
    backClip: string
    backTransform: string
    showNext: boolean
  } => {
    const { flipping, finger, corner } = stateRef.current
    if (!flipping) return { currentClip: 'none', backClip: 'none', backTransform: '', showNext: false }

    const container = containerRef.current
    if (!container) return { currentClip: 'none', backClip: 'none', backTransform: '', showNext: false }
    const { w, h } = sizeRef.current

    const origin = getCornerOrigin(corner, w, h)
    const nx = origin.x - finger.x, ny = origin.y - finger.y
    const { mid, dirX, dirY } = getFoldLine(finger, origin)
    const foldPts = foldLineIntersections(mid, dirX, dirY, w, h)
    if (foldPts.length < 2) return { currentClip: 'none', backClip: 'none', backTransform: '', showNext: false }

    const { kept, flipped } = clipRectByFoldLine(foldPts, mid, dirX, dirY, w, h, origin)

    const currentClip = kept.length >= 3 ? pointsToPolygonCSS(kept, w, h) : 'none'

    // Mirror the flipped polygon for the back face clip
    const mirrored = flipped.map(p => mirrorPoint(p, mid, nx, ny))
    const backClip = mirrored.length >= 3 ? pointsToPolygonCSS(mirrored, w, h) : 'none'

    // CSS transform to mirror content about the fold line
    // We use a matrix that reflects about the fold line passing through `mid`
    const nLen = Math.sqrt(nx * nx + ny * ny) || 1
    const ux = nx / nLen, uy = ny / nLen
    // Reflection matrix about line through origin with direction (ux, uy):
    // [1-2ux², -2ux·uy, 0]
    // [-2ux·uy, 1-2uy², 0]
    // But we need to translate to mid first, reflect, translate back
    const a = 1 - 2 * ux * ux
    const b = -2 * ux * uy
    const c = -2 * ux * uy
    const d = 1 - 2 * uy * uy
    // translate(-mid) → reflect → translate(mid)
    const tx = mid.x - a * mid.x - b * mid.y
    const ty = mid.y - c * mid.x - d * mid.y
    const backTransform = `matrix(${a.toFixed(6)}, ${c.toFixed(6)}, ${b.toFixed(6)}, ${d.toFixed(6)}, ${tx.toFixed(2)}, ${ty.toFixed(2)})`

    return { currentClip, backClip, backTransform, showNext: true }
  }, [getCornerOrigin])

  /** Get the fold line intersection with the right edge of the page (for bookmark positioning) */
  const getFoldRightEdgeY = useCallback((): number | null => {
    const { flipping, finger, corner } = stateRef.current
    if (!flipping) return null
    const container = containerRef.current
    if (!container) return null
    const rect = container.getBoundingClientRect()
    const w = rect.width, h = rect.height
    const origin = getCornerOrigin(corner, w, h)
    const { mid, dirX, dirY } = getFoldLine(finger, origin)
    // Intersection with right edge x=w
    if (dirX === 0) return null
    const t = (w - mid.x) / dirX
    const y = mid.y + t * dirY
    if (y >= 0 && y <= h) return y
    return null
  }, [getCornerOrigin])

  /** Get the fold line intersection with the left edge of the page */
  const getFoldLeftEdgeY = useCallback((): number | null => {
    const { flipping, finger, corner } = stateRef.current
    if (!flipping) return null
    const container = containerRef.current
    if (!container) return null
    const rect = container.getBoundingClientRect()
    const w = rect.width, h = rect.height
    const origin = getCornerOrigin(corner, w, h)
    const { mid, dirX, dirY } = getFoldLine(finger, origin)
    if (dirX === 0) return null
    const t = -mid.x / dirX
    const y = mid.y + t * dirY
    if (y >= 0 && y <= h) return y
    return null
  }, [getCornerOrigin])

  // ── Animation ──
  const animateTo = useCallback((targetFinger: Point, duration: number, onDone?: () => void) => {
    const sf = { ...stateRef.current.finger }
    const t0 = performance.now()
    const container = containerRef.current
    const w = container ? container.getBoundingClientRect().width : 600
    const isR = stateRef.current.corner.includes('right')
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const e = t // linear
      const x = sf.x + (targetFinger.x - sf.x) * e
      const y = sf.y + (targetFinger.y - sf.y) * e
      const progress = isR ? clamp((w - x) / w, 0, 1) : clamp(x / w, 0, 1)
      setState(prev => ({ ...prev, finger: { x, y }, progress }))
      if (t < 1) animRef.current = requestAnimationFrame(tick)
      else onDone?.()
    }
    cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(tick)
  }, [])

  const flipToPage = useCallback((idx: number, zone: 'top' | 'middle' | 'bottom' = 'bottom') => {
    const cur = stateRef.current.currentPage
    if (idx === cur || stateRef.current.flipping || idx < 0 || idx >= totalPages) return
    const container = containerRef.current
    if (!container) return
    updateSize()
    const { w, h } = sizeRef.current
    const dir = idx > cur ? 'forward' : 'backward'

    // Origin and target depend on zone
    let corner: FlipState['corner']
    let origin: Point
    let target: Point

    if (dir === 'forward') {
      if (zone === 'top') {
        corner = 'top-right'
        origin = { x: w, y: 0 }
        target = { x: -w * 0.5, y: h * 0.15 }
      } else if (zone === 'middle') {
        // Scroll-like: start from right-middle, sweep straight left
        corner = 'bottom-right'
        origin = { x: w, y: h }
        target = { x: -w * 0.5, y: h }
      } else {
        corner = 'bottom-right'
        origin = { x: w, y: h }
        target = { x: -w * 0.5, y: h * 0.85 }
      }
    } else {
      if (zone === 'top') {
        corner = 'top-left'
        origin = { x: 0, y: 0 }
        target = { x: w * 1.5, y: h * 0.15 }
      } else if (zone === 'middle') {
        corner = 'bottom-left'
        origin = { x: 0, y: h }
        target = { x: w * 1.5, y: h }
      } else {
        corner = 'bottom-left'
        origin = { x: 0, y: h }
        target = { x: w * 1.5, y: h * 0.85 }
      }
    }

    setState(prev => ({ ...prev, direction: dir, targetPage: idx, corner, finger: origin, progress: 0 }))
    requestAnimationFrame(() => {
      setState(prev => ({ ...prev, flipping: true }))
      animateTo(target, 1000, () => {
        setState(prev => ({ ...prev, currentPage: idx, progress: 1 }))
        requestAnimationFrame(() => { setState({ ...INITIAL, currentPage: idx }) })
      })
    })
  }, [totalPages, animateTo, updateSize])

  // ── Mouse / touch ──
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ZONE = 80
    const detectCorner = (rx: number, ry: number, w: number, h: number): FlipState['corner'] | null => {
      const r = rx > w - ZONE, l = rx < ZONE, t = ry < ZONE, b = ry > h - ZONE
      if (r && t) return 'top-right'; if (r && b) return 'bottom-right'; if (r) return 'bottom-right'
      if (l && t) return 'top-left'; if (l && b) return 'bottom-left'; if (l) return 'bottom-left'
      return null
    }
    const onDown = (cx: number, cy: number) => {
      if (stateRef.current.flipping) return
      const rect = container.getBoundingClientRect()
      const rx = cx - rect.left, ry = cy - rect.top
      if (rx < -10 || rx > rect.width + 10 || ry < -10 || ry > rect.height + 10) return
      const c = detectCorner(rx, ry, rect.width, rect.height)
      if (!c) return
      const isR = c.includes('right'), cur = stateRef.current.currentPage
      if (isR && cur >= totalPages - 1) return
      if (!isR && cur <= 0) return
      dragActive.current = true; hasMoved.current = false
      startPos.current = { x: cx, y: cy }
      dragCorner.current = c
      dragDir.current = isR ? 'forward' : 'backward'
      dragTarget.current = isR ? cur + 1 : cur - 1
    }
    const onMove = (cx: number, cy: number) => {
      if (!dragActive.current) return
      if (!hasMoved.current && Math.abs(cx - startPos.current.x) < 6 && Math.abs(cy - startPos.current.y) < 6) return
      const rect = container.getBoundingClientRect()
      const rx = cx - rect.left, ry = cy - rect.top, w = rect.width
      if (!hasMoved.current) {
        hasMoved.current = true
        setState(prev => ({ ...prev, flipping: true, direction: dragDir.current, targetPage: dragTarget.current, corner: dragCorner.current, finger: { x: rx, y: ry }, progress: 0 }))
      }
      const isR = dragCorner.current.includes('right')
      setState(prev => ({ ...prev, finger: { x: rx, y: ry }, progress: isR ? clamp((w - rx) / w, 0, 1) : clamp(rx / w, 0, 1) }))
    }
    const onUp = (cx: number, cy: number) => {
      if (!dragActive.current) return
      dragActive.current = false
      if (!hasMoved.current) {
        const rect = container.getBoundingClientRect()
        const rx = cx - rect.left, ry = cy - rect.top
        const h = rect.height
        // Detect zone: top third, middle third, bottom third
        const zone: 'top' | 'middle' | 'bottom' = ry < h * 0.33 ? 'top' : ry > h * 0.67 ? 'bottom' : 'middle'
        if (rx > rect.width * 0.6 && stateRef.current.currentPage < totalPages - 1) flipToPage(stateRef.current.currentPage + 1, zone)
        else if (rx < rect.width * 0.4 && stateRef.current.currentPage > 0) flipToPage(stateRef.current.currentPage - 1, zone)
        return
      }
      const p = stateRef.current.progress, rect = container.getBoundingClientRect()
      const w = rect.width, h = rect.height, c = stateRef.current.corner, isR = c.includes('right')
      if (p > 0.2) {
        // Continue from current finger position to fully flipped — duration proportional to remaining distance
        const currentFinger = stateRef.current.finger
        const tgt = isR ? { x: -w * 0.5, y: currentFinger.y } : { x: w * 1.5, y: currentFinger.y }
        const remaining = 1 - p
        const duration = Math.max(150, remaining * 400)
        animateTo(tgt, duration, () => {
          const target = dragTarget.current
          setState(prev => ({ ...prev, currentPage: target, progress: 1 }))
          requestAnimationFrame(() => { setState({ ...INITIAL, currentPage: target }) })
        })
      } else {
        animateTo(getCornerOrigin(c, w, h), 250, () => { setState(prev => ({ ...prev, flipping: false, progress: 0 })) })
      }
    }
    const md = (e: MouseEvent) => { onDown(e.clientX, e.clientY); if (dragActive.current) e.preventDefault() }
    const mm = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    const mu = (e: MouseEvent) => onUp(e.clientX, e.clientY)
    const ts = (e: TouchEvent) => { if (e.touches.length === 1) onDown(e.touches[0].clientX, e.touches[0].clientY) }
    const tm = (e: TouchEvent) => { if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY) }
    const te = (e: TouchEvent) => { const t = e.changedTouches[0]; if (t) onUp(t.clientX, t.clientY) }
    container.addEventListener('mousedown', md)
    window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu)
    container.addEventListener('touchstart', ts, { passive: true })
    window.addEventListener('touchmove', tm, { passive: true }); window.addEventListener('touchend', te)
    return () => {
      container.removeEventListener('mousedown', md)
      window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu)
      container.removeEventListener('touchstart', ts)
      window.removeEventListener('touchmove', tm); window.removeEventListener('touchend', te)
      cancelAnimationFrame(animRef.current)
    }
  }, [totalPages, flipToPage, animateTo, getCornerOrigin])

  useEffect(() => { draw() }, [state, draw])

  // Keep size cached
  useEffect(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [updateSize])

  return { state, canvasRef, containerRef, flipToPage, getClipPaths, getFoldRightEdgeY, getFoldLeftEdgeY }
}
