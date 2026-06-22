import styles from './Navbar.module.css'

export default function Navbar({ editMode, onEditClick }) {
  return (
    <nav className={styles.nav}>
      <a href="#" className={styles.logo}>Unnamed World</a>
      <div className={styles.links}>
        <a href="#characters">Characters</a>
        <a href="#world">World</a>
        <a href="#relations">Relations</a>
        <button
          className={`${styles.editBtn} ${editMode ? styles.editBtnActive : ''}`}
          onClick={onEditClick}
        >
          {editMode ? '편집 종료' : '편집'}
        </button>
      </div>
    </nav>
  )
}