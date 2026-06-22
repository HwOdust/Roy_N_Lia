import { useState, useEffect } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, arrayMove
} from '@dnd-kit/sortable'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CharCard from './components/CharCard'
import CharModal from './components/CharModal'
import RelationMap from './components/RelationMap'
import { supabase } from './supabase'
import styles from './App.module.css'

export default function App() {
  const [characters, setCharacters] = useState([])
  const [worldCards, setWorldCards] = useState([])
  const [selectedChar, setSelectedChar] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  }))

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: chars } = await supabase.from('characters').select('*').order('order_index')
    const { data: worlds } = await supabase.from('world_cards').select('*').order('order_index')
    if (chars) setCharacters(chars)
    if (worlds) setWorldCards(worlds)
  }

  function handleEditClick() {
    if (editMode) {
      setEditMode(false)
    } else {
      setShowPasswordModal(true)
      setPasswordInput('')
      setPasswordError(false)
    }
  }

  function handlePasswordSubmit() {
    if (passwordInput === import.meta.env.VITE_EDIT_PASSWORD) {
      setEditMode(true)
      setShowPasswordModal(false)
    } else {
      setPasswordError(true)
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = characters.findIndex(c => c.id === active.id)
    const newIndex = characters.findIndex(c => c.id === over.id)
    const newOrder = arrayMove(characters, oldIndex, newIndex)
    setCharacters(newOrder)

    await Promise.all(
      newOrder.map((c, i) =>
        supabase.from('characters').update({ order_index: i }).eq('id', c.id)
      )
    )
  }

  return (
    <div>
      <Navbar editMode={editMode} onEditClick={handleEditClick} />
      <Hero />

      <section className={styles.section} id="characters">
        <p className={styles.sectionLabel}>Characters</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={characters.map(c => c.id)} strategy={rectSortingStrategy}>
            <div className={styles.gallery}>
              {characters.map((c) => (
                <CharCard
                  key={c.id} char={c}
                  onClick={setSelectedChar}
                  editMode={editMode}
                  onUpdate={fetchData}
                />
              ))}
              {editMode && (
                <div className={styles.addCard} onClick={() => setSelectedChar({ _new: true })}>
                  <i className="ti ti-plus" aria-hidden="true" />
                  <span>추가</span>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <section className={styles.section} id="world">
        <p className={styles.sectionLabel}>World &amp; Setting</p>
        <div className={styles.worldGrid}>
          {worldCards.map((w) => (
            <div key={w.id} className={styles.worldCard}>
              <div className={styles.worldIcon}>
                <i className={`ti ${w.icon}`} aria-hidden="true" />
              </div>
              <p className={styles.worldTitle}>{w.title}</p>
              <p className={styles.worldDesc}>{w.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} id="relations">
        <p className={styles.sectionLabel}>Relationship Map</p>
        <p className={styles.relIntro}>
          캐릭터들 사이의 관계를 시각적으로 정리했어요.
        </p>
        <RelationMap characters={characters} />
      </section>

      <footer className={styles.footer}>
        made with <span style={{ color: 'var(--purple)' }}>♡</span> — Unnamed World
      </footer>

{selectedChar && (
  <CharModal
    char={selectedChar}
    editMode={editMode}
    onClose={() => setSelectedChar(null)}
    onUpdate={() => {
  fetchData()
}}
  />
)}
      {showPasswordModal && (
        <div className={styles.modalBg} onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)}>
          <div className={styles.passwordModal}>
            <p className={styles.passwordTitle}>편집 모드</p>
            <input
              className={styles.passwordInput}
              type="password"
              placeholder="비밀번호 입력"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              autoFocus
            />
            {passwordError && <p className={styles.passwordError}>비밀번호가 틀렸어요.</p>}
            <button className={styles.passwordBtn} onClick={handlePasswordSubmit}>확인</button>
          </div>
        </div>
      )}
    </div>
  )
}