import { useState, useRef, useCallback } from 'react'
import { supabase } from '../../supabase'
import styles from './Timeline.module.css'

export default function Timeline({ events, characters, editMode, onEdit, onAdd, onUpdate }) {
  const [hoveredId, setHoveredId] = useState(null)
  const [filterChars, setFilterChars] = useState([])
  const [offset, setOffset] = useState(0)
  const [localPos, setLocalPos] = useState({})
  const localPosRef = useRef({})
  const offsetRef = useRef(0)
  const containerRef = useRef(null)
  const draggingRef = useRef(null)

  const allSorted = [...events].sort((a, b) => (a.x_offset ?? 0) - (b.x_offset ?? 0))

const filtered = filterChars.length === 0 || filterChars.length === characters.length
  ? allSorted
  : allSorted.filter(e => filterChars.some(id => (e.characters ?? []).includes(id)))

function handleAllToggle() {
  if (filterChars.length === characters.length) {
    setFilterChars([])
  } else {
    setFilterChars(characters.map(c => c.id))
  }
  setOffset(0)
  offsetRef.current = 0
}

  const maxXOffset = allSorted.length > 0 ? Math.max(...allSorted.map(e => e.x_offset ?? 0)) : 0
  const BAR_WIDTH = Math.max(1200, maxXOffset + 300)
  const PADDING = 100
  const BAR_HEIGHT = 600

  function getPos(e) {
    const lx = localPos[e.id]?.x ?? e.x_offset ?? 0
    const ly = localPos[e.id]?.y ?? e.y_offset ?? 0
    return { x: PADDING + lx, y: ly }
  }

  function handleArrow(dir) {
    const step = 300
    const containerWidth = containerRef.current?.offsetWidth || 800
    const maxOffset = -(BAR_WIDTH - containerWidth)
    setOffset(prev => {
      const next = prev + (dir === 'left' ? step : -step)
      const clamped = Math.min(0, Math.max(maxOffset, next))
      offsetRef.current = clamped
      return clamped
    })
  }

  function toggleFilterChar(id) {
    setFilterChars(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    setOffset(0)
    offsetRef.current = 0
  }


  const onMouseDown = useCallback((ev, event) => {
    if (!editMode) return
    ev.stopPropagation()
    ev.preventDefault()

    const startMouseX = ev.clientX
    const startMouseY = ev.clientY
    const startLx = localPosRef.current[event.id]?.x ?? event.x_offset ?? 0
    const startLy = localPosRef.current[event.id]?.y ?? event.y_offset ?? 0
    let moved = false
    let rafId = null

    function animate() {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRef.current.offsetWidth
      const maxOffset = -(BAR_WIDTH - containerWidth)
      const edgeSize = 60
      const curLx = localPosRef.current[event.id]?.x ?? 0
      const dotScreenX = rect.left + PADDING + curLx + offsetRef.current

      let scrolled = false
      if (dotScreenX < rect.left + edgeSize) {
        const speed = Math.max(1, (edgeSize - (dotScreenX - rect.left)) / 4)
        setOffset(prev => {
          const next = Math.min(0, prev + speed)
          offsetRef.current = next
          return next
        })
        const newLx = curLx + speed
        localPosRef.current[event.id] = { ...localPosRef.current[event.id], x: newLx }
        setLocalPos(p => ({ ...p, [event.id]: { ...localPosRef.current[event.id] } }))
        scrolled = true
      } else if (dotScreenX > rect.right - edgeSize) {
        const speed = Math.max(1, (edgeSize - (rect.right - dotScreenX)) / 4)
        setOffset(prev => {
          const next = Math.max(maxOffset, prev - speed)
          offsetRef.current = next
          return next
        })
        const newLx = curLx - speed
        localPosRef.current[event.id] = { ...localPosRef.current[event.id], x: newLx }
        setLocalPos(p => ({ ...p, [event.id]: { ...localPosRef.current[event.id] } }))
        scrolled = true
      }

      if (scrolled) rafId = requestAnimationFrame(animate)
      else rafId = null
    }

    function onMouseMove(e) {
      const dx = e.clientX - startMouseX
      const dy = e.clientY - startMouseY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true

      const clampedY = Math.max(-(BAR_HEIGHT / 2) + 20, Math.min(BAR_HEIGHT / 2 - 20, startLy + dy))
      const newPos = { x: startLx + dx, y: clampedY }
      localPosRef.current[event.id] = newPos
      setLocalPos(prev => ({ ...prev, [event.id]: newPos }))

      if (!rafId) rafId = requestAnimationFrame(animate)
    }

    async function onMouseUp() {
      if (rafId) cancelAnimationFrame(rafId)
      if (moved) {
        const lx = Math.round(localPosRef.current[event.id]?.x ?? 0)
        const ly = Math.round(localPosRef.current[event.id]?.y ?? 0)
        await supabase.from('timeline_events').update({ x_offset: lx, y_offset: ly }).eq('id', event.id)
        onUpdate()
      } else {
        onEdit(event)
      }
      draggingRef.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    draggingRef.current = { id: event.id }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [editMode, onEdit, onUpdate])

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <div className={styles.filters}>
<button
  className={`${styles.filterBtn} ${filterChars.length === 0 || filterChars.length === characters.length ? styles.active : ''}`}
  onClick={handleAllToggle}
>전체</button>
{characters.map(c => (
  <button
    key={c.id}
    className={`${styles.filterBtn} ${filterChars.includes(c.id) ? styles.active : ''}`}
    onClick={() => toggleFilterChar(c.id)}
    style={filterChars.includes(c.id) ? { borderColor: c.accent, color: c.accent } : {}}
  >
    {c.name}
  </button>
))}
        </div>
        {editMode && (
          <button className={styles.addBtn} onClick={() => onAdd(-offset + (containerRef.current?.offsetWidth || 800) - PADDING)}>
            <i className="ti ti-plus" aria-hidden="true" /> 사건 추가
          </button>
        )}
      </div>

      <div className={styles.timelineRow}>
        <button className={styles.arrow} onClick={() => handleArrow('left')}>
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>

        <div className={styles.viewport} ref={containerRef}>
          <div
            className={styles.barWrap}
            style={{
              width: BAR_WIDTH,
              height: BAR_HEIGHT,
              transform: `translateX(${offset}px)`,
              transition: draggingRef.current ? 'none' : 'transform 0.3s ease'
            }}
          >
            <div className={styles.bar} />

            {filtered.map((e) => {
              const { x, y } = getPos(e)
              const isAbove = y <= 0
              const stemHeight = Math.max(0, Math.abs(y) - 7)
              const charList = (e.characters || [])
                .map(id => characters.find(c => c.id === id))
                .filter(Boolean)

              return (
                <div
                  key={e.id}
                  className={styles.eventPin}
                  style={{ left: x, top: `calc(50% + ${y}px)` }}
                >
                  {hoveredId === e.id && (
                    <div
                      className={isAbove ? `${styles.tooltip} ${styles.tooltipTop}` : `${styles.tooltip} ${styles.tooltipBottom}`}
                      style={{
                        background: `linear-gradient(160deg, ${e.color || '#1e1e30'}99 0%, #161618 40%)`,
                        borderColor: e.color || 'var(--purple)',
                        boxShadow: `0 0 16px 4px ${e.color || '#7F77DD'}44`
                      }}
                    >
                      <p className={styles.tooltipDate} style={{ color: e.color || 'var(--purple)' }}>{e.date}</p>
                      <p className={styles.tooltipTitle}>{e.title}</p>
                      {charList.length > 0 && (
                        <div className={styles.tooltipChars}>
                          {charList.map(c => (
                            <span key={c.id} className={styles.tooltipChar} style={{ borderColor: c.accent, color: c.accent }}>
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={styles.dot}
                    style={{
                      background: e.color || 'var(--purple)',
                      '--dotColor': e.color || '#7F77DD',
                      cursor: editMode ? 'grab' : 'pointer'
                    }}
                    onMouseEnter={() => setHoveredId(e.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onMouseDown={(ev) => onMouseDown(ev, e)}
                    onClick={() => { if (!editMode) onEdit(e) }}
                  />

                  {stemHeight > 0 && (
                    <div
                      className={styles.stem}
                      style={{
                        background: e.color || 'var(--purple)',
                        height: stemHeight,
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        ...(isAbove ? { top: '100%' } : { bottom: '100%' })
                      }}
                    />
                  )}

                  <p
                    className={styles.label}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      ...(isAbove
                        ? { top: `calc(100% + ${stemHeight + 4}px)` }
                        : { bottom: `calc(100% + ${stemHeight + 4}px)` })
                    }}
                  >
                    {e.date}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <button className={styles.arrow} onClick={() => handleArrow('right')}>
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      </div>
      {editMode && <p className={styles.hint}>편집 모드에서 점을 드래그해서 자유롭게 움직일 수 있어요.</p>}
    </div>
  )
}