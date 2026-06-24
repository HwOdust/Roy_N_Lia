import { supabase } from '../supabase'
import { useState } from 'react'
import styles from './Palette.module.css'

export default function Palette({ paletteTags, characters, onUpdate, editMode }) {
  const [form, setForm] = useState({ name: '', color: '#7F77DD', type: 'event' })

  const charTags = [...paletteTags.filter(t => t.type === 'character')]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  const eventTags = paletteTags.filter(t => t.type === 'event')

  async function handleAdd() {
    if (!form.name.trim()) return
    await supabase.from('palette_tags').insert([{ ...form }])
    setForm({ name: '', color: '#7F77DD', type: 'event' })
    onUpdate()
  }

  async function handleDelete(id) {
    await supabase.from('palette_tags').delete().eq('id', id)
    onUpdate()
  }

  async function handleColorChange(id, color) {
    await supabase.from('palette_tags').update({ color }).eq('id', id)
    const tag = paletteTags.find(t => t.id === id)
    if (tag?.character_id) {
      await supabase.from('characters').update({ accent: color }).eq('id', tag.character_id)
    }
  }

  async function handleColorBlur(id, color) {
    await handleColorChange(id, color)
    onUpdate()
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Characters</p>
        <div className={styles.tagGrid}>
          {charTags.map(t => (
            <div key={t.id} className={styles.tagCard}>
              <div className={styles.colorDot} style={{ background: t.color }} />
              <p className={styles.tagName}>{t.name}</p>
              {editMode && (
                <input
                  type="color"
                  value={t.color}
                  className={styles.colorInput}
                  onChange={e => handleColorChange(t.id, e.target.value)}
                  onBlur={e => handleColorBlur(t.id, e.target.value)}
                />
              )}
              <div className={styles.tooltip} style={{ boxShadow: `0 0 0 1px var(--border2), 0 0 24px 6px ${t.color}55, 0 4px 24px rgba(0,0,0,0.4)` }}>
                <div className={styles.tooltipSwatch} style={{ background: t.color }} />
                <div>
                  <p className={styles.tooltipName}>{t.name}</p>
                  <p className={styles.tooltipCode}>{t.color.toUpperCase()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Events</p>
        <div className={styles.tagGrid}>
          {eventTags.map(t => (
            <div key={t.id} className={styles.tagCard}>
              <div className={styles.colorDot} style={{ background: t.color }} />
              <p className={styles.tagName}>{t.name}</p>
              {editMode && (
                <>
                  <input
                    type="color"
                    value={t.color}
                    className={styles.colorInput}
                    onChange={e => handleColorChange(t.id, e.target.value)}
                    onBlur={e => handleColorBlur(t.id, e.target.value)}
                  />
                  <button className={styles.deleteBtn} onClick={() => handleDelete(t.id)}>
                    <i className="ti ti-x" />
                  </button>
                </>
              )}
              <div className={styles.tooltip} style={{ boxShadow: `0 0 0 1px var(--border2), 0 0 24px 6px ${t.color}55, 0 4px 24px rgba(0,0,0,0.4)` }}>
                <div className={styles.tooltipSwatch} style={{ background: t.color }} />
                <div>
                  <p className={styles.tooltipName}>{t.name}</p>
                  <p className={styles.tooltipCode}>{t.color.toUpperCase()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {editMode && (
          <div className={styles.addRow}>
            <input
              className={styles.nameInput}
              placeholder="사건 유형 이름 (예: 개전, 종전)"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <input
              type="color"
              value={form.color}
              className={styles.colorInput}
              onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
            />
            <button className={styles.addBtn} onClick={handleAdd}>
              <i className="ti ti-plus" /> 추가
            </button>
          </div>
        )}
      </div>
    </div>
  )
}