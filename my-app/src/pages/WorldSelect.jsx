import { useState } from 'react'
import styles from './WorldSelect.module.css'

export default function WorldSelect({ worlds, onEnter }) {
  const [selected, setSelected] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

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

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Choose your world</p>
        <div className={styles.grid}>
          {worlds.map(w => (
            <button key={w.id} className={styles.card} onClick={() => handleCardClick(w)}>
              <p className={styles.cardName}>{w.name}</p>
              {w.is_private && <span className={styles.lock}><i className="ti ti-lock" /></span>}
            </button>
          ))}
        </div>
      </div>

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
    </div>
  )
}
