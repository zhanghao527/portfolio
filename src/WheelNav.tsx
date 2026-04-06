import { useState, useCallback } from 'react'

interface Props {
  sections: string[]
  activeIndex: number
  onSelect: (index: number) => void
}

const COLORS = ['#00f0ff', '#7b61ff', '#ff6b9d']
const RADIUS = 120
const INNER_RADIUS = 40

function sectorPath(cx: number, cy: number, r: number, ir: number, startAngle: number, endAngle: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy + r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(endAngle))
  const y2 = cy + r * Math.sin(toRad(endAngle))
  const ix1 = cx + ir * Math.cos(toRad(endAngle))
  const iy1 = cy + ir * Math.sin(toRad(endAngle))
  const ix2 = cx + ir * Math.cos(toRad(startAngle))
  const iy2 = cy + ir * Math.sin(toRad(startAngle))
  const large = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${x1} ${y1}`,
    `A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    `L ${ix1} ${iy1}`,
    `A ${ir} ${ir} 0 ${large} 0 ${ix2} ${iy2}`,
    'Z',
  ].join(' ')
}

export default function WheelNav({ sections, activeIndex, onSelect }: Props) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  const cx = RADIUS + 10
  const cy = RADIUS + 10
  const size = (RADIUS + 10) * 2
  const sectorAngle = 360 / sections.length

  const handleMouseEnter = useCallback(() => setVisible(true), [])
  const handleMouseLeave = useCallback(() => {
    setVisible(false)
    setHovered(null)
  }, [])

  // Trigger: a slim pill that peeks from the top edge, only bottom half visible
  const triggerWidth = 120
  const triggerHeight = 40

  return (
    <>
      {/* Trigger — half-hidden pill at top center */}
      <div
        onMouseEnter={handleMouseEnter}
        style={{
          position: 'fixed',
          top: -triggerHeight / 2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: triggerWidth,
          height: triggerHeight,
          borderRadius: '0 0 20px 20px',
          background: 'linear-gradient(180deg, rgba(123,97,255,0.25) 0%, rgba(123,97,255,0.08) 100%)',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 6,
          transition: 'all 0.3s',
          opacity: visible ? 0 : 1,
          pointerEvents: visible ? 'none' : 'auto',
        }}
      >
        {/* Three small dots + down chevron */}
        <svg width="40" height="14" viewBox="0 0 40 14" fill="none">
          <circle cx="12" cy="7" r="2.5" fill={COLORS[0]} opacity="0.7" />
          <circle cx="20" cy="7" r="2.5" fill={COLORS[1]} opacity="0.7" />
          <circle cx="28" cy="7" r="2.5" fill={COLORS[2]} opacity="0.7" />
        </svg>
      </div>

      {/* Wheel overlay — slides down from top center */}
      <div
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          top: visible ? 16 : -size,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size,
          height: size,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 0.3s ease, top 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1001,
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Subtle background circle */}
          <circle
            cx={cx} cy={cy} r={RADIUS + 4}
            fill="rgba(10,10,10,0.85)"
            stroke="rgba(123,97,255,0.15)"
            strokeWidth="1"
          />
          {sections.map((label, i) => {
            const startAngle = -90 + i * sectorAngle
            const endAngle = startAngle + sectorAngle
            const midAngle = startAngle + sectorAngle / 2
            const toRad = (deg: number) => (deg * Math.PI) / 180
            const labelR = (RADIUS + INNER_RADIUS) / 2 + 10
            const lx = cx + labelR * Math.cos(toRad(midAngle))
            const ly = cy + labelR * Math.sin(toRad(midAngle))
            const isActive = activeIndex === i
            const isHovered = hovered === i

            return (
              <g key={i}>
                <path
                  d={sectorPath(cx, cy, RADIUS, INNER_RADIUS, startAngle, endAngle)}
                  fill={
                    isActive
                      ? `${COLORS[i]}33`
                      : isHovered
                        ? `${COLORS[i]}22`
                        : 'rgba(255,255,255,0.03)'
                  }
                  stroke={isActive || isHovered ? COLORS[i] : 'rgba(255,255,255,0.08)'}
                  strokeWidth={isActive ? 2 : 1}
                  style={{ cursor: 'pointer', transition: 'fill 0.25s, stroke 0.25s' }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onSelect(i)}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isActive || isHovered ? COLORS[i] : '#666'}
                  fontSize="13"
                  fontWeight={isActive ? 700 : 400}
                  style={{ pointerEvents: 'none', transition: 'fill 0.25s' }}
                >
                  {label}
                </text>
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r={INNER_RADIUS - 6} fill="rgba(10,10,10,0.9)" />
          <circle cx={cx} cy={cy} r={4} fill="#7b61ff" opacity={0.5} />
        </svg>
      </div>
    </>
  )
}
