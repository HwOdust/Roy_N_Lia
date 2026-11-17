import { useState } from 'react'
import { supabase } from '../supabase'
import styles from './WorldSelect.module.css'

export default function WorldSelect({ worlds, onEnter, isOwner, onLogin, onLogout, user, onWorldsUpdate }) {
  const [selected, setSelected] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', is_private: false, password: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [loginPw, setLoginPw] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleCardClick(world) {
    if (world.is_private) {
      setSelected(world)
      setPassword('')
      setError(false)
    } else {
      onEnter(world)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (password === selected.password) {
      onEnter(selected)
    } else {
      setError(true)
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setLoginError('')
    const err = await onLogin(email, loginPw)
    setLoading(false)
    if (err) {
      setLoginError('아이디 또는 비밀번호가 틀렸어요.')
    } else {
      setShowLogin(false)
      setEmail('')
      setLoginPw('')
    }
  }

  async function handleAddSubmit(e) {
    e.preventDefault()
    if (!addForm.name.trim()) return
    setAddLoading(true)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    await supabase.from('worlds').insert([{
      name: addForm.name,
      slug: addForm.name.toLowerCase().replace(/\s+/g, '-'),
      is_private: addForm.is_private,
      password: addForm.is_private ? addForm.password : null,
      owner_email: authUser?.email ?? ''
    }])
    setAddLoading(false)
    setShowAdd(false)
    setAddForm({ name: '', is_private: false, password: '' })
    onWorldsUpdate()
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topRight}>
        {user ? (
          <button className={styles.authBtn} onClick={onLogout}>로그아웃</button>
        ) : (
          <button className={styles.authBtn} onClick={() => setShowLogin(true)}>로그인</button>
        )}
      </div>

      <div className={styles.inner}>
        <p className={styles.eyebrow}>Choose your world</p>
        <div className={styles.grid}>
          {worlds.map(w => (
            <button key={w.id} className={styles.card} onClick={() => handleCardClick(w)}>
              {w.hero_image_url && (
                <img src={w.hero_image_url} className={styles.cardImg} alt="" />
              )}
              <div className={styles.cardOverlay}>
                <p className={styles.cardName}>{w.name}</p>
                {w.is_private && <i className="ti ti-lock" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }} />}
              </div>
            </button>
          ))}
          {isOwner && (
            <button className={styles.addCard} onClick={() => setShowAdd(true)}>
              <i className="ti ti-plus" />
            </button>
          )}
        </div>
      </div>

      {/* 세계관 비밀번호 모달 */}
      {selected && (
        <div className={styles.modalBg} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <form className={styles.modal} onSubmit={handleSubmit}>
            <p className={styles.modalTitle}>{selected.name}</p>
            <input
              className={styles.input}
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              autoFocus
            />
            {error && <p className={styles.error}>비밀번호가 틀렸어요.</p>}
            <button className={styles.btn} type="submit">입장</button>
          </form>
        </div>
      )}

      {/* 로그인 모달 */}
      {showLogin && (
        <div className={styles.modalBg} onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <form className={styles.modal} onSubmit={handleLoginSubmit}>
            <p className={styles.modalTitle}>로그인</p>
            <input
              className={styles.input}
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
            <input
              className={styles.input}
              type="password"
              placeholder="비밀번호"
              value={loginPw}
              onChange={e => setLoginPw(e.target.value)}
            />
            {loginError && <p className={styles.error}>{loginError}</p>}
            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? '...' : '확인'}
            </button>
          </form>
        </div>
      )}

      {/* 세계관 추가 모달 */}
      {showAdd && (
        <div className={styles.modalBg} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <form className={styles.modal} onSubmit={handleAddSubmit}>
            <p className={styles.modalTitle}>새 세계관</p>
            <input
              className={styles.input}
              placeholder="세계관 이름"
              value={addForm.name}
              onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
              autoFocus
            />
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={addForm.is_private}
                onChange={e => setAddForm(p => ({ ...p, is_private: e.target.checked }))}
              />
              <span>비공개 (비밀번호 필요)</span>
            </label>
            {addForm.is_private && (
              <input
                className={styles.input}
                type="password"
                placeholder="비밀번호"
                value={addForm.password}
                onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))}
              />
            )}
            <button className={styles.btn} type="submit" disabled={addLoading}>
              {addLoading ? '...' : '추가'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
