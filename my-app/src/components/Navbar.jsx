import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar({ editMode, onEditClick, user, isOwner, onLogin, onLogout, onWorldChange }) {
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const err = await onLogin(email, password)
    setLoading(false)
    if (err) {
      setError('아이디 또는 비밀번호가 틀렸어요.')
    } else {
      setShowLogin(false)
      setEmail('')
      setPassword('')
    }
  }

  return (
    <>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo}>Unnamed World</NavLink>
        <div className={styles.links}>
          <NavLink to="/characters" className={({ isActive }) => isActive ? styles.activeLink : ''}>Characters</NavLink>
          <NavLink to="/world" className={({ isActive }) => isActive ? styles.activeLink : ''}>World</NavLink>
          <NavLink to="/timeline" className={({ isActive }) => isActive ? styles.activeLink : ''}>Timeline</NavLink>
          <NavLink to="/relations" className={({ isActive }) => isActive ? styles.activeLink : ''}>Relations</NavLink>
          <span className={styles.divider} />
          <NavLink to="/palette" className={({ isActive }) => isActive ? styles.activeLink : ''}>Palette</NavLink>
          <NavLink to="/playlist" className={({ isActive }) => isActive ? styles.activeLink : ''}>Playlist</NavLink>
          <span className={styles.divider} />
          {isOwner && (
            <button
              className={`${styles.editBtn} ${editMode ? styles.editBtnActive : ''}`}
              onClick={onEditClick}
            >
              {editMode ? '편집모드' : '뷰모드'}
            </button>
          )}
          <button className={styles.authBtn} onClick={onWorldChange}>
            <i className="ti ti-world" />
          </button>
          {user ? (
            <button className={styles.authBtn} onClick={onLogout}>로그아웃</button>
          ) : (
            <button className={styles.authBtn} onClick={() => setShowLogin(true)}>로그인</button>
          )}
        </div>
      </nav>

      {showLogin && (
        <div className={styles.modalBg} onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <form className={styles.loginModal} onSubmit={handleSubmit}>
            <p className={styles.loginTitle}>로그인</p>
            <input
              className={styles.loginInput}
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
            <input
              className={styles.loginInput}
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && <p className={styles.loginError}>{error}</p>}
            <button className={styles.loginBtn} type="submit" disabled={loading}>
              {loading ? '...' : '확인'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
