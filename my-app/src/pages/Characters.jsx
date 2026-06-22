import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, arrayMove
} from '@dnd-kit/sortable'
import CharCard from '../components/char/CharCard'
import { supabase } from '../supabase'
import styles from './Characters.module.css'

export default function Characters({ characters, setCharacters, editMode, onCharClick, onUpdate }) {
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  }))

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
    <div className={styles.wrap}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={characters.map(c => c.id)} strategy={rectSortingStrategy}>
          <div className={styles.gallery}>
            {characters.map((c) => (
              <CharCard
                key={c.id} char={c}
                onClick={onCharClick}
                editMode={editMode}
                onUpdate={onUpdate}
              />
            ))}
            {editMode && (
              <div className={styles.addCard} onClick={() => onCharClick({ _new: true })}>
                <i className="ti ti-plus" aria-hidden="true" />
                <span>추가</span>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
