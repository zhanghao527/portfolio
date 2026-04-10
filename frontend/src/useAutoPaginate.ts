/**
 * Auto-pagination hook.
 *
 * Takes section content definitions and splits them into physical pages
 * that fit within the book's page height. Uses a hidden measurement
 * container to calculate real rendered heights.
 *
 * Returns:
 * - pages: array of React components (one per physical page)
 * - sectionToPages: mapping from section index to physical page indices
 * - pageToSection: mapping from physical page index to section index
 */

import { useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { createElement } from 'react'
import {
  SECTIONS, PROJECTS, TECHS, TECH_GROUPS, BLOG_CHAPTERS, PROJECT_CATEGORIES,
  type ProjectItem, type TechGroup,
} from './pageData'

// ── Renderable page slice ──

export interface PageSlice {
  sectionIndex: number
  /** Render function for this page slice */
  render: () => ReactNode
}

// ── Section header height (title + subtitle + divider) ──
const HEADER_APPROX = 100 // px — first page of section (h1 + subtitle + divider)
const CONTINUE_HEADER_APPROX = 50 // px — continuation pages ("项目（续）" + divider)
const PAGE_NUM_HEIGHT = 40 // px for the page number at bottom
const PAGE_PADDING_TOP = 44
const PAGE_PADDING_BOTTOM = 20

/**
 * Measures the height of a single item rendered inside a container
 * with the same width as the book page.
 */
function measureItems(
  containerWidth: number,
  items: { className: string; html: string }[],
): number[] {
  const measurer = document.createElement('div')
  measurer.style.cssText = `
    position: absolute; top: -9999px; left: -9999px;
    width: ${containerWidth}px;
    padding: 0 40px;
    font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #333;
    visibility: hidden;
    pointer-events: none;
  `
  document.body.appendChild(measurer)

  const heights: number[] = []
  for (const item of items) {
    const el = document.createElement('div')
    el.className = item.className
    el.innerHTML = item.html
    measurer.appendChild(el)
    heights.push(el.getBoundingClientRect().height)
    measurer.removeChild(el)
  }

  document.body.removeChild(measurer)
  return heights
}

// ── Item renderers (return HTML strings for measurement, React elements for display) ──

function projectCardHTML(p: ProjectItem): string {
  const screenshotHTML = p.screenshot
    ? `<div class="project-thumb"><img src="${p.screenshot}" /></div>`
    : `<div class="project-thumb project-thumb-empty"><span class="project-thumb-icon">${p.icon}</span></div>`
  return `<div class="project-card">
    ${screenshotHTML}
    <div class="project-card-body">
      <div class="project-card-meta"><span class="project-cat">${p.category}</span></div>
      <h3>${p.name}</h3>
      <span class="project-desc">${p.desc}</span>
    </div>
  </div>`
}

function techTagHTML(t: { name: string; icon: string }): string {
  return `<span class="tech-tag"><span class="tech-tag-icon">${t.icon}</span>${t.name}</span>`
}

function techGroupHTML(g: { category: string; items: { name: string; icon: string }[] }): string {
  return `<div class="tech-group">
    <h3 class="tech-group-title">${g.category}</h3>
    <div class="tech-list">${g.items.map(t => techTagHTML(t)).join('')}</div>
  </div>`
}

// ── Pagination logic ──

interface PaginateResult {
  pages: PageSlice[]
  sectionToPages: number[][]
  pageToSection: number[]
  categoryPageMap: Record<string, number>
  blogChapterPageMap: Record<number, number>
}

export function useAutoPaginate(bookWidth: number, bookHeight: number): PaginateResult & { ready: boolean } {
  const [result, setResult] = useState<PaginateResult>({
    pages: [],
    sectionToPages: [],
    pageToSection: [],
    categoryPageMap: {},
    blogChapterPageMap: {},
  })
  const [ready, setReady] = useState(false)
  const prevKey = useRef('')

  const paginate = useCallback(() => {
    if (bookWidth < 100 || bookHeight < 100) return

    const usableHeight = bookHeight - PAGE_NUM_HEIGHT

    const pages: PageSlice[] = []
    const sectionToPages: number[][] = [[], [], [], []]
    const pageToSection: number[] = []
    let categoryPageMap: Record<string, number> = {}
    let blogChapterPageMap: Record<number, number> = {}

    // ── Section 0: Cover (always 1 page) ──
    sectionToPages[0].push(pages.length)
    pageToSection.push(0)
    pages.push({
      sectionIndex: 0,
      render: () => null, // Cover uses special component, handled in App
    })

    // ── Section 1: Projects (grouped by category) ──
    {
      // Build category groups in order
      const groups: { category: string; items: ProjectItem[] }[] = []
      for (const cat of PROJECT_CATEGORIES) {
        const items = PROJECTS.filter(p => p.category === cat)
        if (items.length > 0) groups.push({ category: cat, items })
      }

      // Measure each group as a block (category title + 2-col grid of cards)
      const gap = 10
      const groupHeights: number[] = []
      for (const g of groups) {
        const el = document.createElement('div')
        el.style.cssText = `
          position: absolute; top: -9999px; left: -9999px;
          width: ${bookWidth}px; padding: 0 40px;
          visibility: hidden; pointer-events: none;
          font-family: 'Inter', -apple-system, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif;
        `
        el.innerHTML = `
          <h3 class="project-group-title">${g.category}</h3>
          <div class="project-grid">${g.items.map(p => projectCardHTML(p)).join('')}</div>
        `
        document.body.appendChild(el)
        groupHeights.push(el.getBoundingClientRect().height)
        document.body.removeChild(el)
      }

      const contentHeight = usableHeight - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM
      const groupGap = 20 // gap between category groups
      let currentGroups: number[] = []
      let currentH = HEADER_APPROX

      for (let g = 0; g < groups.length; g++) {
        const gH = groupHeights[g] + (currentGroups.length > 0 ? groupGap : 0)
        if (currentH + gH > contentHeight && currentGroups.length > 0) {
          sectionToPages[1].push(pages.length)
          pageToSection.push(1)
          pages.push({ sectionIndex: 1, render: () => null })
          currentGroups = [g]
          currentH = CONTINUE_HEADER_APPROX + groupHeights[g]
        } else {
          currentGroups.push(g)
          currentH += gH
        }
      }
      if (currentGroups.length > 0) {
        sectionToPages[1].push(pages.length)
        pageToSection.push(1)
        pages.push({ sectionIndex: 1, render: () => null })
      }

      // Assign renderers
      const projectPageIndices = sectionToPages[1]
      let gStart = 0
      for (let pi = 0; pi < projectPageIndices.length; pi++) {
        const globalIdx = projectPageIndices[pi]
        const isFirst = pi === 0
        const cH = contentHeight
        let h = isFirst ? HEADER_APPROX : CONTINUE_HEADER_APPROX
        let gCount = 0
        for (let g = gStart; g < groups.length; g++) {
          const gH = groupHeights[g] + (gCount > 0 ? groupGap : 0)
          if (h + gH > cH && gCount > 0) break
          h += gH
          gCount++
        }
        const sliceGroups = groups.slice(gStart, gStart + gCount)
        const totalSub = projectPageIndices.length
        pages[globalIdx] = {
          sectionIndex: 1,
          render: createProjectPageRenderer(sliceGroups, isFirst, pi, totalSub),
        }
        gStart += gCount
      }

      // Build category → page mapping
      let cgStart = 0
      for (let pi = 0; pi < projectPageIndices.length; pi++) {
        const globalIdx = projectPageIndices[pi]
        const cH = contentHeight
        let h = pi === 0 ? HEADER_APPROX : CONTINUE_HEADER_APPROX
        let cgCount = 0
        for (let g = cgStart; g < groups.length; g++) {
          const gH = groupHeights[g] + (cgCount > 0 ? groupGap : 0)
          if (h + gH > cH && cgCount > 0) break
          h += gH
          cgCount++
        }
        for (let g = cgStart; g < cgStart + cgCount; g++) {
          categoryPageMap[groups[g].category] = globalIdx
        }
        cgStart += cgCount
      }
    }

    // ── Section 2: Tech (grouped by category) ──
    {
      // Measure each group block height
      const groupHeights: number[] = []
      for (const g of TECH_GROUPS) {
        const el = document.createElement('div')
        el.style.cssText = `
          position: absolute; top: -9999px; left: -9999px;
          width: ${bookWidth}px; padding: 0 40px;
          visibility: hidden; pointer-events: none;
          font-family: 'Inter', -apple-system, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif;
        `
        el.innerHTML = techGroupHTML(g)
        document.body.appendChild(el)
        groupHeights.push(el.getBoundingClientRect().height)
        document.body.removeChild(el)
      }

      const contentHeight = usableHeight - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM
      const groupGap = 16
      let currentGroups: number[] = []
      let currentH = HEADER_APPROX

      for (let g = 0; g < TECH_GROUPS.length; g++) {
        const gH = groupHeights[g] + (currentGroups.length > 0 ? groupGap : 0)
        if (currentH + gH > contentHeight && currentGroups.length > 0) {
          sectionToPages[2].push(pages.length)
          pageToSection.push(2)
          pages.push({ sectionIndex: 2, render: () => null })
          currentGroups = [g]
          currentH = CONTINUE_HEADER_APPROX + groupHeights[g]
        } else {
          currentGroups.push(g)
          currentH += gH
        }
      }
      if (currentGroups.length > 0) {
        sectionToPages[2].push(pages.length)
        pageToSection.push(2)
        pages.push({ sectionIndex: 2, render: () => null })
      }

      // Assign renderers
      const techPageIndices = sectionToPages[2]
      let gStart = 0
      for (let pi = 0; pi < techPageIndices.length; pi++) {
        const globalIdx = techPageIndices[pi]
        const isFirst = pi === 0
        const cH = contentHeight
        let h = isFirst ? HEADER_APPROX : CONTINUE_HEADER_APPROX
        let gCount = 0
        for (let g = gStart; g < TECH_GROUPS.length; g++) {
          const gH = groupHeights[g] + (gCount > 0 ? groupGap : 0)
          if (h + gH > cH && gCount > 0) break
          h += gH
          gCount++
        }
        const sliceGroups = TECH_GROUPS.slice(gStart, gStart + gCount)
        pages[globalIdx] = {
          sectionIndex: 2,
          render: createTechPageRenderer(sliceGroups, isFirst, pi, techPageIndices.length),
        }
        gStart += gCount
      }
    }

    // ── Section 3: Blog (single TOC page with links to 语雀) ──
    {
      sectionToPages[3].push(pages.length)
      pageToSection.push(3)
      pages.push({
        sectionIndex: 3,
        render: createBlogTocRenderer(),
      })
    }

    setResult({ pages, sectionToPages, pageToSection, categoryPageMap, blogChapterPageMap })
    setReady(true)
  }, [bookWidth, bookHeight])

  useEffect(() => {
    const key = `${bookWidth}x${bookHeight}`
    if (key === prevKey.current) return
    prevKey.current = key
    // Delay to ensure CSS is loaded
    requestAnimationFrame(() => paginate())
  }, [paginate])

  return { ...result, ready }
}

// ── Measurement helpers ──

// ── Render factories ──
// These return functions that produce React elements (not JSX directly)
// so they can be stored in the pages array.

function createProjectPageRenderer(
  groups: { category: string; items: ProjectItem[] }[],
  showHeader: boolean,
  subPage: number, totalSub: number,
) {
  const totalProjects = PROJECTS.length
  const activeCategories = PROJECT_CATEGORIES.filter(c => PROJECTS.some(p => p.category === c))
  const totalCategories = activeCategories.length

  return function ProjectPage() {
    const statsEl = createElement('div', { className: 'page-header-stats' },
      createElement('span', { className: 'stat-item stat-item-hover', onMouseDown: (e: any) => e.stopPropagation() },
        `${totalCategories} 个领域`,
        createElement('span', { className: 'stat-tooltip' },
          createElement('div', { className: 'stat-tooltip-inner' },
            ...activeCategories.map(c =>
              createElement('span', {
                className: 'stat-tooltip-row',
                key: c,
                'data-jump-category': c,
              },
                c,
                createElement('span', { className: 'stat-tooltip-count' },
                  `${PROJECTS.filter(p => p.category === c).length}`
                ),
              )
            )
          ),
        ),
      ),
      createElement('span', { className: 'stats-dot' }, '·'),
      createElement('span', { className: 'stat-item stat-item-hover', onMouseDown: (e: any) => e.stopPropagation() },
        `${totalProjects} 个项目`,
        createElement('span', { className: 'stat-tooltip' },
          createElement('div', { className: 'stat-tooltip-inner' },
            ...PROJECTS.map(p =>
              createElement('span', {
                className: 'stat-tooltip-row',
                key: p.name,
                'data-jump-category': p.category,
              },
                createElement('span', null, p.icon, ' ', p.name),
                createElement('span', { className: 'stat-tooltip-count' }, p.category),
              )
            )
          ),
        ),
      ),
    )

    return (
      createElement('div', { className: 'page-body' },
        showHeader && createElement('div', { className: 'page-header-row' },
          createElement('div', null,
            createElement('h1', null, '项目 ', createElement('span', { className: 'page-header-sub' }, '我搭建和参与的一些平台与作品')),
          ),
          statsEl,
        ),
        showHeader && createElement('div', { className: 'divider' }),
        !showHeader && totalSub > 1 && createElement('div', { className: 'page-header-row' },
          createElement('p', { className: 'page-continue' }, '项目（续）'),
          statsEl,
        ),
        !showHeader && totalSub > 1 && createElement('div', { className: 'divider' }),
        ...groups.map(g =>
          createElement('div', { className: 'project-group', key: g.category },
            createElement('h3', { className: 'project-group-title' }, g.category),
            createElement('div', { className: 'project-grid' },
              ...g.items.map(p => {
                const thumb = p.screenshot
                  ? createElement('div', { className: 'project-thumb', key: 'thumb' },
                      createElement('img', { src: p.screenshot, alt: p.name, loading: 'lazy' }))
                  : createElement('div', { className: 'project-thumb project-thumb-empty', key: 'thumb' },
                      createElement('span', { className: 'project-thumb-icon' }, p.icon))

                const githubIcon = createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'currentColor' },
                  createElement('path', { d: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z' }))

                const body = createElement('div', { className: 'project-card-body', key: 'body' },
                  createElement('h3', null, p.name),
                  createElement('span', { className: 'project-desc' }, p.desc),
                  createElement('div', { className: 'project-card-footer' },
                    p.link ? createElement('span', { className: 'project-link-hint' }, '查看 →') : createElement('span', null),
                    p.github ? createElement('a', {
                      className: 'project-github',
                      href: p.github,
                      target: '_blank',
                      rel: 'noreferrer',
                      onClick: (e: any) => e.stopPropagation(),
                      onMouseDown: (e: any) => e.stopPropagation(),
                    }, githubIcon) : null,
                  ),
                )

                if (p.link) {
                  return createElement('a', {
                    className: 'project-card project-card-link',
                    key: p.name,
                    href: p.link,
                    target: '_blank',
                    rel: 'noreferrer',
                  }, thumb, body)
                }
                return createElement('div', { className: 'project-card', key: p.name }, thumb, body)
              })
            ),
          )
        ),
      )
    )
  }
}

function createTechPageRenderer(
  groups: TechGroup[],
  showHeader: boolean,
  subPage: number, totalSub: number,
) {
  const totalTechs = TECH_GROUPS.reduce((sum, g) => sum + g.items.length, 0)
  const totalCategories = TECH_GROUPS.length

  return function TechPage() {
    const statsEl = createElement('div', { className: 'page-header-stats' },
      createElement('span', { className: 'stat-item' }, `${totalCategories} 个分类`),
      createElement('span', { className: 'stats-dot' }, '·'),
      createElement('span', { className: 'stat-item' }, `${totalTechs} 项技术`),
    )

    return (
      createElement('div', { className: 'page-body' },
        showHeader && createElement('div', { className: 'page-header-row' },
          createElement('div', null,
            createElement('h1', null, '技术栈 ', createElement('span', { className: 'page-header-sub' }, '我日常使用和熟悉的技术')),
          ),
          statsEl,
        ),
        showHeader && createElement('div', { className: 'divider' }),
        !showHeader && totalSub > 1 && createElement('div', { className: 'page-header-row' },
          createElement('p', { className: 'page-continue' }, '技术栈（续）'),
          statsEl,
        ),
        !showHeader && totalSub > 1 && createElement('div', { className: 'divider' }),
        createElement('div', { className: 'tech-groups' },
          ...groups.map(g =>
            createElement('div', { className: 'tech-group', key: g.category },
              createElement('h3', { className: 'tech-group-title' }, g.category),
              createElement('div', { className: 'tech-list' },
                ...g.items.map(t =>
                  createElement('span', { className: 'tech-tag', key: t.name },
                    createElement('span', { className: 'tech-tag-icon' }, t.icon),
                    t.name,
                  )
                )
              ),
            )
          ),
        ),
      )
    )
  }
}

function createBlogTocRenderer() {
  return function BlogTocPage() {
    return (
      createElement('div', { className: 'page-body' },
        createElement('h1', null, '博客 ', createElement('span', { className: 'page-header-sub' }, '写点技术思考和踩坑记录')),
        createElement('div', { className: 'divider' }),
        createElement('div', { className: 'blog-toc' },
          createElement('h3', { className: 'blog-toc-label' }, '目  录'),
          ...BLOG_CHAPTERS.map((ch, i) =>
            createElement('a', {
              className: 'blog-toc-entry',
              key: ch.name,
              href: ch.link || '#',
              target: ch.link ? '_blank' : undefined,
              rel: ch.link ? 'noreferrer' : undefined,
            },
              createElement('span', { className: 'blog-toc-chapter-num' }, `${toChineseNum(i + 1)}`),
              createElement('span', { className: 'blog-toc-chapter-name' }, ch.name),
              createElement('span', { className: 'blog-toc-dots' }),
              createElement('span', { className: 'blog-toc-desc' }, ch.desc),
            )
          ),
        ),
      )
    )
  }
}

function toChineseNum(n: number): string {
  const nums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  return nums[n - 1] || String(n)
}

