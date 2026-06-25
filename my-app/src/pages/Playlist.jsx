import { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../supabase'
import styles from './Playlist.module.css'

function getYoutubeId(url) {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([^&?\s]+)/)
  return match ? match[1] : null
}

function SongCard({ song, characters, editMode, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const ytId = getYoutubeId(song.youtube_url)
  const songChars = (song.characters || []).map(id => characters.find(c => c.id === id)).filter(Boolean)

  return (
    <div ref={setNodeRef} style={style} className={styles.card}>
      {editMode && (
        <span className={styles.dragHandle} {...attributes} {...listeners}>
          <i className="ti ti-grip-vertical" />
        </span>
      )}
      {ytId ? (
        <div className={styles.thumb}>
          <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={song.title} />
          <a href={song.youtube_url} target="_blank" rel="noopener noreferrer" className={styles.playBtn}>
            <i className="ti ti-player-play-filled" />
          </a>
        </div>
      ) : (
        <div className={styles.thumbEmpty}><i className="ti ti-music" /></div>
      )}
      <div className={styles.info}>
        <p className={styles.songTitle}>{song.title}</p>
        {song.artist && <p className={styles.artist}>{song.artist}</p>}
        {song.memo && <p className={styles.memo}>{song.memo}</p>}
        {songChars.length > 0 && (
          <div className={styles.charTags}>
            {songChars.map(c => (
              <span key={c.id} className={styles.charTag} style={{ borderColor: c.accent, color: c.accent }}>
                {c.name}
              </span>
            ))}
          </div>
        )}
      </div>
      {editMode && (
        <div className={styles.cardActions}>
          <button className={styles.actionBtn} onClick={() => onEdit(song)}><i className="ti ti-pencil" /></button>
          <button className={styles.actionBtn} onClick={() => onDelete(song.id)}><i className="ti ti-trash" /></button>
        </div>
      )}
    </div>
  )
}

export default function Playlist({ characters, editMode, onUpdate }) {
  const [songs, setSongs] = useState([])
  const [filterChars, setFilterChars] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSong, setEditingSong] = useState(null)
  const [form, setForm] = useState({ title: '', artist: '', youtube_url: '', memo: '', characters: [] })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => { fetchSongs() }, [])

  async function fetchSongs() {
    const { data } = await supabase.from('playlist').select('*').order('order_index')
    if (data) setSongs(data)
  }

  function handleAllToggle() {
    setShowAll(p => !p)
    setFilterChars([])
  }

  function toggleFilter(id) {
    setShowAll(true)
    setFilterChars(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id])
  }

  function toggleFormChar(id) {
    setForm(p => ({
      ...p,
      characters: p.characters.includes(id)
        ? p.characters.filter(c => c !== id)
        : [...p.characters, id]
    }))
  }

  const filtered = !showAll
    ? []
    : filterChars.length === 0
      ? songs
      : songs.filter(s => filterChars.every(id => s.characters?.includes(id)))

  function openAdd() {
    setEditingSong(null)
    setForm({ title: '', artist: '', youtube_url: '', memo: '', characters: [] })
    setShowForm(true)
  }

  function openEdit(song) {
    setEditingSong(song)
    setForm({
      title: song.title || '',
      artist: song.artist || '',
      youtube_url: song.youtube_url || '',
      memo: song.memo || '',
      characters: song.characters || []
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim()) return
    const payload = { title: form.title, artist: form.artist, youtube_url: form.youtube_url, memo: form.memo, characters: form.characters }
    if (editingSong) {
      await supabase.from('playlist').update(payload).eq('id', editingSong.id)
    } else {
      await supabase.from('playlist').insert([{ ...payload, order_index: songs.length }])
    }
    setShowForm(false)
    fetchSongs()
    onUpdate()
  }

  async function handleDelete(id) {
    if (!confirm('삭제할까요?')) return
    await supabase.from('playlist').delete().eq('id', id)
    fetchSongs()
    onUpdate()
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = songs.findIndex(s => s.id === active.id)
    const newIndex = songs.findIndex(s => s.id === over.id)
    const newOrder = arrayMove(songs, oldIndex, newIndex)
    setSongs(newOrder)
    await Promise.all(newOrder.map((s, i) =>
      supabase.from('playlist').update({ order_index: i }).eq('id', s.id)
    ))
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.filterRow}>
        <button
          className={`${styles.filterBtn} ${showAll && filterChars.length === 0 ? styles.filterBtnActive : ''}`}
          style={showAll && filterChars.length === 0 ? { borderColor: 'var(--purple)', color: 'var(--purple)' } : {}}
          onClick={handleAllToggle}
        >전체</button>
        {characters.map(c => (
          <button
            key={c.id}
            className={`${styles.filterBtn} ${filterChars.includes(c.id) ? styles.filterBtnActive : ''}`}
            style={filterChars.includes(c.id) ? { borderColor: c.accent, color: c.accent } : {}}
            onClick={() => toggleFilter(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
      <p className={styles.filterNote}>
        {filterChars.length > 0 ? '선택한 캐릭터 모두 포함된 곡만 표시' : '\u00A0'}
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map(s => s.id)} strategy={rectSortingStrategy}>
          <div className={styles.grid}>
            {filtered.map(song => (
              <SongCard
                key={song.id}
                song={song}
                characters={characters}
                editMode={editMode}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
            {editMode && (
              <button className={styles.addCard} onClick={openAdd}>
                <i className="ti ti-plus" /> 곡 추가
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {showForm && (
        <div className={styles.modalBg} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className={styles.modal}>
            <button className={styles.close} onClick={() => setShowForm(false)}><i className="ti ti-x" /></button>
            <p className={styles.modalTitle}>{editingSong ? '곡 수정' : '곡 추가'}</p>
            <div className={styles.formGrid}>
              <label className={styles.label}>제목
                <input className={styles.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </label>
              <label className={styles.label}>아티스트
                <input className={styles.input} value={form.artist} onChange={e => setForm(p => ({ ...p, artist: e.target.value }))} />
              </label>
              <label className={styles.label} style={{ gridColumn: '1 / -1' }}>유튜브 링크
                <input className={styles.input} placeholder="https://youtube.com/..." value={form.youtube_url} onChange={e => setForm(p => ({ ...p, youtube_url: e.target.value }))} />
              </label>
              <label className={styles.label} style={{ gridColumn: '1 / -1' }}>메모
                <textarea className={styles.input} rows={3} value={form.memo} onChange={e => setForm(p => ({ ...p, memo: e.target.value }))} />
              </label>
            </div>
            <p className={styles.charLabel}>캐릭터 태그</p>
            <div className={styles.charGrid}>
              {characters.map(c => (
                <button
                  key={c.id}
                  className={`${styles.charBtn} ${form.characters.includes(c.id) ? styles.charBtnActive : ''}`}
                  style={form.characters.includes(c.id) ? { borderColor: c.accent, color: c.accent } : {}}
                  onClick={() => toggleFormChar(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className={styles.btnRow}>
              <button className={styles.saveBtn} onClick={handleSave}>저장</button>
            </div>
          </div>    
        </div>
      )}
    </div>
  )
}