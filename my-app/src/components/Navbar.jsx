import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar({ editMode, onEditClick }) {
  return (
    <nav className={styles.nav}>
      <NavLink to="/" className={styles.logo}>Unnamed World</NavLink>
      <div className={styles.links}>
        <NavLink to="/characters" className={({ isActive }) => isActive ? styles.activeLink : ''}>Characters</NavLink>
        <NavLink to="/world" className={({ isActive }) => isActive ? styles.activeLink : ''}>World</NavLink>
        <NavLink to="/timeline" className={({ isActive }) => isActive ? styles.activeLink : ''}>Timeline</NavLink>
        <NavLink to="/relations" className={({ isActive }) => isActive ? styles.activeLink : ''}>Relations</NavLink>
        <NavLink to="/palette" className={({ isActive }) => isActive ? styles.activeLink : ''}>Palette</NavLink>
        <NavLink to="/playlist" className={({ isActive }) => isActive ? styles.activeLink : ''}>Playlist</NavLink>
        <button
          className={`${styles.editBtn} ${editMode ? styles.editBtnActive : ''}`}
          onClick={onEditClick}
        >
          {editMode ? '편집모드' : '뷰모드'}
        </button>
      </div>
    </nav>
  )
}