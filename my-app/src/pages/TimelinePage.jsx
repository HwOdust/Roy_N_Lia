import Timeline from '../components/timeline/Timeline'
import styles from './TimelinePage.module.css'

export default function TimelinePage({ events, characters, editMode, onEdit, onAdd, onUpdate }) {
  return (
    <div className={styles.wrap}>
      <Timeline
        events={events}
        characters={characters}
        editMode={editMode}
        onEdit={onEdit}
        onAdd={onAdd}
        onUpdate={onUpdate}
      />
    </div>
  )
}