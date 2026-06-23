import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CharModal from './components/char/CharModal'
import TimelineModal from './components/timeline/TimelineModal'
import Home from './pages/Home'
import Characters from './pages/Characters'
import World from './pages/World'
import TimelinePage from './pages/TimelinePage'
import Relations from './pages/Relations'
import { supabase } from './supabase'
import styles from './App.module.css'

export default function App() {
  const [characters, setCharacters] = useState([])
  const [worldCards, setWorldCards] = useState([])
  const [timelineEvents, setTimelineEvents] = useState([])
  const [selectedChar, setSelectedChar] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: chars } = await supabase.from('characters').select('*').order('order_index')
    const { data: worlds } = await supabase.from('world_cards').select('*').order('order_index')
const { data: events } = await supabase.from('timeline_events').select('*').order('x_offset')    
if (chars) setCharacters(chars)
    if (worlds) setWorldCards(worlds)
    if (events) setTimelineEvents(events)
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

  return (
    <div>
      <Navbar editMode={editMode} onEditClick={handleEditClick} />

      <Routes>
        <Route path="/" element={
          <Home
            characters={characters}
            worldCards={worldCards}
            timelineEvents={timelineEvents}
          />
        } />
        <Route path="/characters" element={
          <Characters
            characters={characters}
            setCharacters={setCharacters}
            editMode={editMode}
            onCharClick={setSelectedChar}
            onUpdate={fetchData}
          />
        } />
        <Route path="/world" element={
          <World worldCards={worldCards} />
        } />
        <Route path="/timeline" element={
          <TimelinePage
            events={timelineEvents}
            characters={characters}
            editMode={editMode}
            onEdit={setSelectedEvent}
onAdd={(x) => setSelectedEvent({ _new: true, initialX: x })}
            onUpdate={fetchData}
          />
        } />
        <Route path="/relations" element={
          <Relations characters={characters} />
        } />
      </Routes>

      <footer className={styles.footer}>
        made with <span style={{ color: 'var(--purple)' }}>♡</span> — Unnamed World
      </footer>

      {selectedChar && (
        <CharModal
          char={selectedChar}
          editMode={editMode}
          onClose={() => setSelectedChar(null)}
          onUpdate={fetchData}
        />
      )}

      {selectedEvent && (
        <TimelineModal
          event={selectedEvent}
          characters={characters}
          editMode={editMode}
          onClose={() => setSelectedEvent(null)}
          onUpdate={fetchData}
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