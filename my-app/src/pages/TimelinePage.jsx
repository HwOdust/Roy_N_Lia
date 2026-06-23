import Timeline from '../components/timeline/Timeline'
import styles from './TimelinePage.module.css'

export default function TimelinePage({ events, characters, editMode, onEdit, onAdd, onUpdate, settings, onSettingsUpdate }) {
  return (
  <Timeline
    events={events}
    characters={characters}
    editMode={editMode}
    onEdit={onEdit}
    onAdd={onAdd}
    onUpdate={onUpdate}
    settings={settings}
    onSettingsUpdate={onSettingsUpdate}
  />
)
}