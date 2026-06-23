import { useState, useEffect, useRef } from 'react'
import styles from './PalettePicker.module.css'

export default function PalettePicker({ paletteTags, onSelect, anchorRef }) {
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [hoveredTag, setHoveredTag] = useState(null)
  const pickerRef = useRef(null)

  const charTags = paletteTags.filter(t => t.type === 'character')
  const eventTags = paletteTags.filter(t => t.type === 'event')

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 8, left: rect.left })
    }
  }, [anchorRef])

  return (
    <div ref={pickerRef} className={styles.picker} style={{ top: pos.top, left: pos.left }}>
      {charTags.length > 0 && (
        <div className={styles.group}>
          <p className={styles.groupLabel}>캐릭터</p>
          <div className={styles.dots}>
            {charTags.map(t => (
              <div key={t.id} className={styles.dotWrap} onMouseEnter={() => setHoveredTag(t.id)} onMouseLeave={() => setHoveredTag(null)}>
                <button
                  className={styles.dot}
                  style={{ background: t.color }}
                  onClick={() => onSelect(t.color)}
                />
                {hoveredTag === t.id && (
<div className={styles.tooltip} style={{ boxShadow: `0 0 0 1px var(--border2), 0 0 24px 6px ${t.color}55, 0 4px 24px rgba(0,0,0,0.4)` }}>
                    <div className={styles.tooltipSwatch} style={{ background: t.color }} />
                    <div>
                      <p className={styles.tooltipName}>{t.name}</p>
                      <p className={styles.tooltipCode}>{t.color.toUpperCase()}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {eventTags.length > 0 && (
        <div className={styles.group}>
          <p className={styles.groupLabel}>사건 유형</p>
          <div className={styles.dots}>
            {eventTags.map(t => (
              <div key={t.id} className={styles.dotWrap} onMouseEnter={() => setHoveredTag(t.id)} onMouseLeave={() => setHoveredTag(null)}>
                <button
                  className={styles.dot}
                  style={{ background: t.color }}
                  onClick={() => onSelect(t.color)}
                />
                {hoveredTag === t.id && (
<div className={styles.tooltip} style={{ boxShadow: `0 0 0 1px var(--border2), 0 0 24px 6px ${t.color}55, 0 4px 24px rgba(0,0,0,0.4)` }}>
                    <div className={styles.tooltipSwatch} style={{ background: t.color }} />
                    <div>
                      <p className={styles.tooltipName}>{t.name}</p>
                      <p className={styles.tooltipCode}>{t.color.toUpperCase()}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}