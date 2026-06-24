import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabase'
import PalettePicker from '../palette/PalettePicker'
import styles from './TimelineModal.module.css'

export default function TimelineModal({ event, characters, editMode, paletteTags, onClose, onUpdate }) {
  const isNew = event?._new
  const [viewOnly, setViewOnly] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const colorBtnRef = useRef(null)
  const [form, setForm] = useState({
    title: '', description: '', date: '', date_sort: 0, characters: [], color: '#7F77DD'
  })

  useEffect(() => {
    if (!isNew && event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        date_sort: event.date_sort || 0,
        characters: event.characters || [],
        color: event.color || '#7F77DD'
      })
    }
    setViewOnly(false)
  }, [event])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function toggleChar(id) {
    const already = form.characters.includes(id)
    setForm({
      ...form,
      characters: already
        ? form.characters.filter(c => c !== id)
        : [...form.characters, id]
    })
  }

  async function handleSave() {
    const payload = {
      title: form.title,
      description: form.description,
      date: form.date,
      characters: form.characters,
      color: form.color
    }
    if (isNew) {
      await supabase.from('timeline_events').insert([payload])
    } else {
      await supabase.from('timeline_events').update(payload).eq('id', event.id)
    }
    onUpdate()
    onClose()
  }

  async function handleDelete() {
    if (!confirm(`"${event.title}" 사건을 삭제할까요?`)) return
    await supabase.from('timeline_events').delete().eq('id', event.id)
    onUpdate()
    onClose()
  }

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (!showPalette) return
    function handleClick(e) {
      if (!e.target.closest('[data-palette]') && !colorBtnRef.current?.contains(e.target)) {
        setShowPalette(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [showPalette])

  if (!event) return null

  const charList = (form.characters || [])
    .map(id => characters.find(c => c.id === id))
    .filter(Boolean)

  return (
    <div className={styles.bg} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          <i className="ti ti-x" aria-hidden="true" />
        </button>

        {!isNew && editMode && (
          <button className={styles.modeToggle} onClick={() => setViewOnly(!viewOnly)}>
            <i className={`ti ${viewOnly ? 'ti-edit' : 'ti-eye'}`} aria-hidden="true" />
            {viewOnly ? '편집' : '미리보기'}
          </button>
        )}

        {!isNew && (viewOnly || !editMode) ? (
          <>
            <div className={styles.viewHeader} style={{ borderColor: form.color || 'var(--purple)' }}>
              <p className={styles.viewDate}>{form.date}</p>
              <p className={styles.viewTitle}>{form.title}</p>
            </div>
            {charList.length > 0 && (
              <div className={styles.viewChars}>
                {charList.map(c => (
                  <span key={c.id} className={styles.viewChar} style={{ borderColor: c.accent, color: c.accent }}>
                    {c.name}
                  </span>
                ))}
              </div>
            )}
            {form.description && (
              <>
                <div className={styles.divider} />
                <p className={styles.viewDesc}>{form.description}</p>
              </>
            )}
          </>
        ) : (
          <>
            <p className={styles.title}>{isNew ? '사건 추가' : '사건 편집'}</p>
            <div className={styles.formGrid}>
              <label className={styles.label} style={{ gridColumn: '1 / -1' }}>사건명
                <input className={styles.input} name="title" value={form.title} onChange={handleChange} />
              </label>
              <label className={styles.label} style={{ gridColumn: '1 / -1' }}>날짜 표시
                <input className={styles.input} name="date" placeholder="예: 900년 6월 22일" value={form.date} onChange={handleChange} />
              </label>
              <label className={styles.label}>색상
                <div className={styles.colorRow}>
                  <input type="color" name="color" value={form.color} onChange={handleChange} className={styles.colorInput} />
                  <button
                    ref={colorBtnRef}
                    className={styles.paletteBtn}
                    onClick={() => setShowPalette(p => !p)}
                    type="button"
                  >
                    <i className="ti ti-palette" />
                  </button>
                </div>
              </label>
              <label className={styles.label} style={{ gridColumn: '1 / -1' }}>설명
                <textarea className={styles.input} name="description" value={form.description} onChange={handleChange} rows={3} />
              </label>
            </div>

            <p className={styles.charLabel}>캐릭터 태그</p>
            <div className={styles.charGrid}>
              {characters.map(c => (
                <button
                  key={c.id}
                  className={`${styles.charBtn} ${form.characters.includes(c.id) ? styles.charBtnActive : ''}`}
                  style={form.characters.includes(c.id) ? { borderColor: c.accent, color: c.accent } : {}}
                  onClick={() => toggleChar(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className={styles.btnRow}>
              {!isNew && (
                <button className={styles.deleteBtn} onClick={handleDelete}>삭제</button>
              )}
              <button className={styles.saveBtn} onClick={handleSave}>저장</button>
            </div>
          </>
        )}
      </div>

      {showPalette && (
        <div data-palette>
          <PalettePicker
            paletteTags={paletteTags}
            anchorRef={colorBtnRef}
            onSelect={(color) => {
              setForm(p => ({ ...p, color }))
              setShowPalette(false)
            }}
          />
        </div>
      )}
    </div>
  )
}