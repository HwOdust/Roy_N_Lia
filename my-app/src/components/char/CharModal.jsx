import { useState, useEffect, useRef } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../../supabase'
import PalettePicker from '../palette/PalettePicker'
import styles from './CharModal.module.css'

const DUMMY_PLAYLIST = [
  { id: 1, title: 'Song Title', artist: 'Artist Name', memo: '이 캐릭터의 테마곡' },
  { id: 2, title: 'Another Song', artist: 'Artist', memo: '감정선을 잘 표현함' },
]

const TABS = [
  { id: 'milestone', label: '마일스톤' },
  { id: 'playlist', label: '플리' },
]

function SortableMilestone({ m, editMode, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className={styles.milestone}>
      {editMode && (
        <span className={styles.dragHandle} {...attributes} {...listeners}>
          <i className="ti ti-grip-vertical" />
        </span>
      )}
      <span className={styles.milestoneDate}>{m.date}</span>
      <div className={styles.milestoneBody}>
        <p className={styles.milestoneTitle}>{m.title}</p>
        {m.description && <p className={styles.milestoneDesc}>{m.description}</p>}
      </div>
      {editMode && (
        <div className={styles.milestoneActions}>
          <button className={styles.milestoneActionBtn} onClick={() => onEdit(m)}>
            <i className="ti ti-pencil" />
          </button>
          <button className={styles.milestoneActionBtn} onClick={() => onDelete(m.id)}>
            <i className="ti ti-trash" />
          </button>
        </div>
      )}
    </div>
  )
}

function SortableField({ f, i, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: f._id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className={styles.fieldRow}>
      <span className={styles.dragHandle} {...attributes} {...listeners}>
        <i className="ti ti-grip-vertical" />
      </span>
      <div className={styles.fieldInputs}>
        <input
          className={styles.input}
          placeholder="항목명 (예: 나이)"
          value={f.key}
          onChange={(e) => onUpdate(i, 'key', e.target.value)}
        />
        <textarea
          className={styles.input}
          placeholder="내용"
          value={f.value}
          rows={3}
          onChange={(e) => onUpdate(i, 'value', e.target.value)}
        />
      </div>
      <button className={styles.removeFieldBtn} onClick={() => onRemove(i)}>
        <i className="ti ti-x" aria-hidden="true" />
      </button>
    </div>
  )
}

function MilestoneForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { date: '', title: '', description: '' })
  return (
    <div className={styles.milestoneForm}>
      <input
        className={styles.input}
        placeholder="날짜 (예: 124년 3월)"
        value={form.date}
        onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
      />
      <input
        className={styles.input}
        placeholder="제목"
        value={form.title}
        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
      />
      <textarea
        className={styles.input}
        placeholder="설명 (선택)"
        value={form.description}
        rows={2}
        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
      />
      <div className={styles.milestoneFormBtns}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.saveBtn} onClick={() => onSave(form)}>저장</button>
      </div>
    </div>
  )
}

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
  const [activeTab, setActiveTab] = useState('milestone')
  const [milestones, setMilestones] = useState([])
  const [addingMilestone, setAddingMilestone] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState(null)
  const colorBtnRef = useRef(null)
  const accentBtnRef = useRef(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    if (!isNew && char) {
      setForm({
        name: char.name || '',
        role: char.role || '',
        initial: char.initial || '',
        description: char.description || '',
        color: char.color || '#1e1e30',
        accent: char.accent || '#AFA9EC',
        fields: (char.fields || []).map((f, i) => ({ ...f, _id: `field-${i}-${Date.now()}` }))
      })
    }
  }, [char])

  useEffect(() => {
    if (char?.id && !isNew) fetchMilestones()
  }, [char?.id])

  async function fetchMilestones() {
    const { data } = await supabase
      .from('character_milestones')
      .select('*')
      .eq('character_id', char.id)
      .order('order_index')
    if (data) setMilestones(data)
  }

  async function handleAddMilestone(formData) {
    const { data } = await supabase.from('character_milestones').insert([{
      character_id: char.id,
      date: formData.date,
      title: formData.title,
      description: formData.description,
      order_index: milestones.length
    }]).select().single()
    if (data) setMilestones(p => [...p, data])
    setAddingMilestone(false)
  }

  async function handleEditMilestone(formData) {
    await supabase.from('character_milestones').update({
      date: formData.date,
      title: formData.title,
      description: formData.description
    }).eq('id', editingMilestone.id)
    setMilestones(p => p.map(m => m.id === editingMilestone.id ? { ...m, ...formData } : m))
    setEditingMilestone(null)
  }

  async function handleDeleteMilestone(id) {
    await supabase.from('character_milestones').delete().eq('id', id)
    setMilestones(p => p.filter(m => m.id !== id))
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = milestones.findIndex(m => m.id === active.id)
    const newIndex = milestones.findIndex(m => m.id === over.id)
    const newOrder = arrayMove(milestones, oldIndex, newIndex)
    setMilestones(newOrder)
    await Promise.all(
      newOrder.map((m, i) =>
        supabase.from('character_milestones').update({ order_index: i }).eq('id', m.id)
      )
    )
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function addField() {
    setForm({ ...form, fields: [...form.fields, { key: '', value: '', _id: `field-new-${Date.now()}` }] })
  }

  function removeField(i) {
    const fields = form.fields.filter((_, idx) => idx !== i)
    setForm({ ...form, fields })
  }

  function updateField(i, k, v) {
    const fields = form.fields.map((f, idx) => idx === i ? { ...f, [k]: v } : f)
    setForm({ ...form, fields })
  }

  function handleFieldDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = form.fields.findIndex(f => f._id === active.id)
    const newIndex = form.fields.findIndex(f => f._id === over.id)
    setForm({ ...form, fields: arrayMove(form.fields, oldIndex, newIndex) })
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
                    <input className={styles.input} name="initial" value={form.initial} onChange={handleChange} maxLength={10} />
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
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFieldDragEnd}>
                    <SortableContext items={form.fields.map(f => f._id)} strategy={verticalListSortingStrategy}>
                      {form.fields.map((f, i) => (
                        <SortableField
                          key={f._id}
                          f={f}
                          i={i}
                          onUpdate={updateField}
                          onRemove={removeField}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
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
                {char.initial && (
                  <div className={styles.row}>
                    <span className={styles.key}>이니셜</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text2)' }}>{char.initial}</span>
                  </div>
                )}
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

          {editMode && !char._viewOnly && !isNew && (
            <div className={styles.btnRow}>
              <button className={styles.deleteBtn} onClick={handleDelete}>삭제</button>
              <button className={styles.saveBtn} onClick={handleSave}>저장</button>
            </div>
          )}
          {editMode && !char._viewOnly && isNew && (
            <div className={styles.btnRow}>
              <button className={styles.saveBtn} onClick={handleSave}>저장</button>
            </div>
          )}

          {!char._new && (
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
            <div className={styles.tabs}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* 마일스톤 탭 */}
            {activeTab === 'milestone' && (
              <div className={styles.milestoneList}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={milestones.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    {milestones.map(m => (
                      editingMilestone?.id === m.id ? (
                        <MilestoneForm
                          key={m.id}
                          initial={editingMilestone}
                          onSave={handleEditMilestone}
                          onCancel={() => setEditingMilestone(null)}
                        />
                      ) : (
                        <SortableMilestone
                          key={m.id}
                          m={m}
                          editMode={editMode && !char._viewOnly}
                          onEdit={setEditingMilestone}
                          onDelete={handleDeleteMilestone}
                        />
                      )
                    ))}
                  </SortableContext>
                </DndContext>

                {milestones.length === 0 && !addingMilestone && (
                  <p className={styles.empty}>마일스톤이 없어요.</p>
                )}

                {addingMilestone && (
                  <MilestoneForm
                    onSave={handleAddMilestone}
                    onCancel={() => setAddingMilestone(false)}
                  />
                )}

                {editMode && !char._viewOnly && !addingMilestone && (
                  <button className={styles.addItemBtn} onClick={() => setAddingMilestone(true)}>
                    <i className="ti ti-plus" /> 마일스톤 추가
                  </button>
                )}
              </div>
            )}

            {/* 플리 탭 */}
            {activeTab === 'playlist' && (
              <div className={styles.playlistList}>
                {DUMMY_PLAYLIST.map((p) => (
                  <div key={p.id} className={styles.playlistItem}>
                    <div className={styles.playlistInfo}>
                      <p className={styles.playlistTitle}>{p.title}</p>
                      <p className={styles.playlistArtist}>{p.artist}</p>
                    </div>
                    {p.memo && <p className={styles.playlistMemo}>{p.memo}</p>}
                  </div>
                ))}
                {editMode && !char._viewOnly && (
                  <button className={styles.addItemBtn}>
                    <i className="ti ti-plus" /> 곡 추가
                  </button>
                )}
              </div>
            )}
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