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
import { supabase, getWorldSlug } from './supabase'
import { WorldContext } from './WorldContext'
import styles from './App.module.css'
import Palette from './pages/Palette'
import Playlist from './pages/Playlist'
import WorldSelect from './pages/WorldSelect'

export default function App() {
  const [user, setUser] = useState(null)
  const [worlds, setWorlds] = useState([])
  const [worldId, setWorldId] = useState(() => sessionStorage.getItem('worldId') || null)
  const [worldEntered, setWorldEntered] = useState(() => !!sessionStorage.getItem('worldId'))
  const [characters, setCharacters] = useState([])
  const [worldCards, setWorldCards] = useState([])
  const [timelineEvents, setTimelineEvents] = useState([])
  const [selectedChar, setSelectedChar] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [timelineSettings, setTimelineSettings] = useState({ start_year: 0, end_year: 1000, zoom: 1 })
  const [paletteTags, setPaletteTags] = useState([])
  const [playlist, setPlaylist] = useState([])
  const [homeSettings, setHomeSettings] = useState({
    hero_title: 'A world of my own making',
    hero_sub: '이름 없는 세계 속, 이름을 가진 존재들에 대한 기록.',
    hero_image_url: null,
    hero_image_opacity: 0.5
  })

  // 로그인 상태 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) setEditMode(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  // 세계관 목록 로드
  useEffect(() => {
    supabase.from('worlds').select('id, name, slug, is_private, password')
      .then(({ data }) => { if (data) setWorlds(data) })
  }, [])

  function handleEnterWorld(world) {
    sessionStorage.setItem('worldId', world.id)
    setWorldId(world.id)
    setWorldEntered(true)
  }

  useEffect(() => {
    if (worldId) fetchData()
  }, [worldId])

  async function fetchData() {
    if (!worldId) return
    const { data: chars } = await supabase.from('characters').select('*').eq('world_id', worldId).order('order_index')
    const { data: worlds } = await supabase.from('world_cards').select('*').eq('world_id', worldId).order('order_index')
    const { data: events } = await supabase.from('timeline_events').select('*').eq('world_id', worldId).order('x_offset')
    const { data: settings } = await supabase.from('timeline_settings').select('*').eq('world_id', worldId).limit(1).single()
    const { data: palette } = await supabase.from('palette_tags').select('*').eq('world_id', worldId).order('order_index')
    const { data: playlistData } = await supabase.from('playlist').select('*').eq('world_id', worldId).order('order_index')
    const { data: hs } = await supabase.from('home_settings').select('*').eq('world_id', worldId).limit(1).single()
    if (chars) setCharacters(chars)
    if (worlds) setWorldCards(worlds)
    if (events) setTimelineEvents(events)
    if (settings) setTimelineSettings(settings)
    if (palette) setPaletteTags(palette)
    if (playlistData) setPlaylist(playlistData)
    if (hs) setHomeSettings(hs)
  }

  async function handleLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setEditMode(false)
  }

  // 로그인한 유저가 이 세계관 주인인지 확인
  const isOwner = user && worldId
    ? (() => {
        // worlds 테이블의 owner_email과 비교는 별도 체크 없이
        // Supabase Auth 로그인 자체가 주인임을 증명
        return true
      })()
    : false

  async function refreshWorlds() {
    const { data: worldsData } = await supabase.from('worlds').select('id, name, slug, is_private, password')
    if (!worldsData) return
    const withImages = await Promise.all(worldsData.map(async w => {
      const { data: hs } = await supabase.from('home_settings').select('hero_image_url').eq('world_id', w.id).limit(1).single()
      return { ...w, hero_image_url: hs?.hero_image_url ?? null }
    }))
    setWorlds(withImages)
  }

  if (!worldEntered) {
    return (
      <WorldSelect
        worlds={worlds}
        onEnter={handleEnterWorld}
        isOwner={!!user}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onWorldsUpdate={refreshWorlds}
      />
    )
  }

  return (
    <WorldContext.Provider value={worldId}>
    <div>
      <Navbar
        editMode={editMode}
        onEditClick={() => setEditMode(v => !v)}
        user={user}
        isOwner={isOwner}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onWorldChange={() => { sessionStorage.removeItem('worldId'); setWorldEntered(false); setWorldId(null); setEditMode(false) }}
      />

      <Routes>
        <Route path="/" element={
          <Home
            characters={characters}
            worldCards={worldCards}
            timelineEvents={timelineEvents}
            homeSettings={homeSettings}
            editMode={editMode}
            onUpdate={fetchData}
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
        <Route path="/palette" element={
          <Palette
            paletteTags={paletteTags}
            characters={characters}
            editMode={editMode}
            onUpdate={fetchData}
          />
        } />
        <Route path="/playlist" element={
          <Playlist
            characters={characters}
            playlist={playlist}
            editMode={editMode}
            onUpdate={fetchData}
          />
        } />
      </Routes>

      <footer className={styles.footer}>
        made with <span style={{ color: 'var(--purple)' }}>♡</span> — Unnamed World
      </footer>

      {selectedChar && (
        <CharModal
          char={selectedChar}
          editMode={editMode}
          paletteTags={paletteTags}
          onClose={() => setSelectedChar(null)}
          onUpdate={fetchData}
        />
      )}

      {selectedEvent && (
        <TimelineModal
          event={selectedEvent}
          characters={characters}
          editMode={editMode}
          paletteTags={paletteTags}
          onClose={() => setSelectedEvent(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
    </WorldContext.Provider>
  )
}
