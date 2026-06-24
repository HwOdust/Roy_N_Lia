import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabase'
import PalettePicker from '../palette/PalettePicker'
import styles from './CharModal.module.css'

const DUMMY_MILESTONES = [
  { id: 1, date: '124년 3월', title: '첫 번째 사건', description: '어떤 일이 일어났다.' },
  { id: 2, date: '130년', title: '두 번째 사건', description: '또 다른 일이 일어났다.' },
  { id: 3, date: '145년 여름', title: '세 번째 사건', description: '그리고 또.' },
]

export default function CharModal({ char, editMode, paletteTags, onClose, onUpdate }) {
  const isNew = char?._new
  const [form, setForm] = useState({
    name: '', role: '', initial: '',
    description: '', color: '#1e1e30', accent: '#AFA9EC',
    fields: []
  })
  const [showPaletteColor, setShowPaletteColor] = useState(false)
  const [showPaletteAccent, setShowPaletteAccent] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const colorBtnRef = useRef(null)
  const accentBtnRef = useRef(null)

  useEffect(() => {
    if (!isNew && char) {
      setForm({
        name: char.name || '',
        role: char.role || '',
        initial: char.initial || '',
        description: char.description || '',
        color: char.color || '#1e1e30',
        accent: char.accent || '#AFA9EC',
        fields: char.fields || []
      })
    }
  }, [char])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function addField() {
    setForm({ ...form, fields: [...form.fields, { key: '', value: '' }] })
  }

  function removeField(i) {
    const fields = form.fields.filter((_, idx) => idx !== i)
    setForm({ ...form, fields })
  }

  function updateField(i, k, v) {
    const fields = form.fields.map((f, idx) => idx === i ? { ...f, [k]: v } : f)
    setForm({ ...form, fields })
  }

  async function handleSave() {
    const payload = {
      name: form.name, role: form.role, initial: form.initial,
      description: form.description, color: form.color, accent: form.accent,
      fields: form.fields.filter(f => f.key || f.value)
    }
    if (isNew) {
      const { data: newChar } = await supabase.from('characters').insert([payload]).select().single()
      if (newChar) {
        await supabase.from('palette_tags').insert([{
          name: newChar.name,
          color: newChar.accent,
          type: 'character',
          character_id: newChar.id,
          order_index: newChar.order_index ?? 0
        }])
      }
    } else {
      await supabase.from('characters').update(payload).eq('id', char.id)
      const { data: existing } = await supabase.from('palette_tags').select('id').eq('character_id', char.id).single()
      if (existing) {
        await supabase.from('palette_tags').update({
          name: form.name,
          color: form.accent,
          order_index: char.order_index ?? 0
        }).eq('character_id', char.id)
      } else {
        await supabase.from('palette_tags').insert([{
          name: form.name,
          color: form.accent,
          type: 'character',
          character_id: char.id,
          order_index: char.order_index ?? 0
        }])
      }
    }
    onUpdate()
    onClose()
  }

  async function handleDelete() {
    if (!confirm(`${char.name}을(를) 삭제할까요?`)) return
    await supabase.from('characters').delete().eq('id', char.id)
    onUpdate()
    onClose()
  }

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (!showPaletteColor && !showPaletteAccent) return
    function handleClick(e) {
      if (!e.target.closest('[data-palette]') &&
        !colorBtnRef.current?.contains(e.target) &&
        !accentBtnRef.current?.contains(e.target)) {
        setShowPaletteColor(false)
        setShowPaletteAccent(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [showPaletteColor, showPaletteAccent])

  if (!char) return null

  return (
    <div className={styles.bg} onClick={(e) => e.target === e.currentTarget && onClose()} style={{ background: 'rgba(0,0,0,0.72)' }}>
      <div className={`${styles.wrapper} ${expanded ? styles.wrapperExpanded : ''}`}>

        {/* 왼쪽: 기존 모달 */}
        <div
          className={styles.modal}
          style={{
            background: (char.color && (!editMode || char._viewOnly))
              ? `linear-gradient(160deg, ${char.color} 0%, #161618 35%)`
              : undefined
          }}
        >
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <i className="ti ti-x" aria-hidden="true" />
          </button>

          {/* 스크롤 영역 */}
          <div className={styles.modalScroll}>
            {editMode && !char._viewOnly ? (
              <>
                <p className={styles.editTitle}>{isNew ? '캐릭터 추가' : '캐릭터 편집'}</p>
                <div className={styles.formGrid}>
                  <label className={styles.label}>이름
                    <input className={styles.input} name="name" value={form.name} onChange={handleChange} />
                  </label>
                  <label className={styles.label}>역할
                    <input className={styles.input} name="role" value={form.role} onChange={handleChange} />
                  </label>
                  <label className={styles.label}>이니셜
                    <input className={styles.input} name="initial" value={form.initial} onChange={handleChange} maxLength={2} />
                  </label>
                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>소개
                    <textarea className={styles.input} name="description" value={form.description} onChange={handleChange} rows={3} />
                  </label>
                  <label className={styles.label}>카드 배경색
                    <div className={styles.colorRow}>
                      <input type="color" name="color" value={form.color} onChange={handleChange} className={styles.colorInput} />
                      <button ref={colorBtnRef} className={styles.paletteBtn} onClick={() => { setShowPaletteColor(p => !p); setShowPaletteAccent(false) }} type="button">
                        <i className="ti ti-palette" />
                      </button>
                    </div>
                  </label>
                  <label className={styles.label}>이니셜 색
                    <div className={styles.colorRow}>
                      <input type="color" name="accent" value={form.accent} onChange={handleChange} className={styles.colorInput} />
                      <button ref={accentBtnRef} className={styles.paletteBtn} onClick={() => { setShowPaletteAccent(p => !p); setShowPaletteColor(false) }} type="button">
                        <i className="ti ti-palette" />
                      </button>
                    </div>
                  </label>
                </div>
                <div className={styles.fieldsSection}>
                  <div className={styles.fieldsHeader}>
                    <p className={styles.fieldsTitle}>추가 정보</p>
                    <button className={styles.addFieldBtn} onClick={addField}>
                      <i className="ti ti-plus" aria-hidden="true" /> 항목 추가
                    </button>
                  </div>
                  {form.fields.map((f, i) => (
                    <div key={i} className={styles.fieldRow}>
                      <input
                        className={styles.input}
                        placeholder="항목명 (예: 나이)"
                        value={f.key}
                        onChange={(e) => updateField(i, 'key', e.target.value)}
                      />
                      <textarea
                        className={styles.input}
                        placeholder="내용"
                        value={f.value}
                        rows={3}
                        onChange={(e) => updateField(i, 'value', e.target.value)}
                      />
                      <button className={styles.removeFieldBtn} onClick={() => removeField(i)}>
                        <i className="ti ti-x" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.btnRow}>
                  {!isNew && (
                    <button className={styles.deleteBtn} onClick={handleDelete}>삭제</button>
                  )}
                  <button className={styles.saveBtn} onClick={handleSave}>저장</button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.hero}>
                  {char.image_url ? (
                    <img src={char.image_url} alt={char.name} className={styles.heroImg} />
                  ) : (
                    <div className={styles.heroAvatar} style={{ background: char.color, color: char.accent }}>
                      {char.initial}
                    </div>
                  )}
                  <div className={styles.heroInfo}>
                    <p className={styles.name}>{char.name}</p>
                    <p className={styles.role}>{char.role}</p>
                  </div>
                </div>
                <div className={styles.divider} />
                <div className={styles.row}>
                  <span className={styles.key}>이니셜 색</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: char.accent, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text2)' }}>{char.accent?.toUpperCase()}</span>
                  </span>
                </div>
                {char.fields?.length > 0 ? (
                  char.fields.map((f, i) => (
                    <div key={i} className={styles.row}>
                      <span className={styles.key}>{f.key}</span>
                      <span>{f.value}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.empty}>등록된 정보가 없어요.</p>
                )}
                {char.description && (
                  <>
                    <div className={styles.divider} />
                    <p className={styles.key} style={{ marginBottom: '6px' }}>소개</p>
                    <p className={styles.desc}>{char.description}</p>
                  </>
                )}
              </>
            )}
          </div>

          {/* 확장 버튼 - 항상 하단 고정 */}
          {!editMode && !char._new && (
            <div className={styles.expandBtnWrap}>
              <button className={styles.expandBtn} onClick={() => setExpanded(p => !p)}>
                <i className={`ti ti-chevron-${expanded ? 'left' : 'right'}`} />
              </button>
            </div>
          )}
        </div>

        {/* 오른쪽: 패널 */}
        {expanded && (
          <div className={styles.panel}>
            <p className={styles.panelTitle}>마일스톤</p>
            <div className={styles.milestoneList}>
              {DUMMY_MILESTONES.map((m) => (
                <div key={m.id} className={styles.milestone}>
                  <span className={styles.milestoneDate}>{m.date}</span>
                  <div>
                    <p className={styles.milestoneTitle}>{m.title}</p>
                    <p className={styles.milestoneDesc}>{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {showPaletteColor && (
        <div data-palette>
          <PalettePicker
            paletteTags={paletteTags}
            anchorRef={colorBtnRef}
            onSelect={(color) => {
              setForm(p => ({ ...p, color }))
              setShowPaletteColor(false)
            }}
          />
        </div>
      )}

      {showPaletteAccent && (
        <div data-palette>
          <PalettePicker
            paletteTags={paletteTags}
            anchorRef={accentBtnRef}
            onSelect={(color) => {
              setForm(p => ({ ...p, accent: color }))
              setShowPaletteAccent(false)
            }}
          />
        </div>
      )}
    </div>
  )
}