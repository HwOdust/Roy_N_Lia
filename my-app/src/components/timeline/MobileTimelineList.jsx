import { useState, useEffect } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../../supabase'
import useDragSensors from '../../useDragSensors'
import styles from './Timeline.module.css'

function Item({ e, characters, editMode, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: e.id, disabled: !editMode })
  const charList = (e.characters || [])
    .map(id => characters.find(c => c.id === id))
    .filter(Boolean)

  return (
    <button
      ref={setNodeRef}
      className={`${styles.mItem} ${isDragging ? styles.mDragging : ''}`}
      style={{ '--c': e.color || '#7F77DD', transform: CSS.Transform.toString(transform), transition }}
      onClick={() => onEdit(e)}
      {...attributes}
      {...listeners}
    >
      <span className={styles.mDate}>{e.date}</span>
      <span className={styles.mBox}>
        <span className={styles.mTitle}>{e.title}</span>
        {charList.length > 0 && (
          <span className={styles.mChars}>
            {charList.map(c => (
              <span key={c.id} style={{ color: c.accent }}>{c.name}</span>
            ))}
          </span>
        )}
      </span>
    </button>
  )
}

// 모바일 타임라인: 세로 목록. 편집 모드에서는 꾹 눌러 순서 변경
// 순서를 바꾸면 PC 타임라인의 가로 위치(x_offset)를 앞뒤 사건 사이로 옮겨서 PC에서도 같은 순서가 되게 함
export default function MobileTimelineList({ events, characters, editMode, onEdit, onUpdate }) {
  const [list, setList] = useState(events)
  const sensors = useDragSensors()

  useEffect(() => { setList(events) }, [events])

  async function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex(e => e.id === active.id)
    const newIndex = list.findIndex(e => e.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)

    const before = next[newIndex - 1]
    const after = next[newIndex + 1]
    let x
    if (before && after) x = Math.round(((before.x_offset ?? 0) + (after.x_offset ?? 0)) / 2)
    else if (before) x = (before.x_offset ?? 0) + 100
    else x = Math.max(-90, (after?.x_offset ?? 0) - 100)

    next[newIndex] = { ...next[newIndex], x_offset: x }
    setList(next)
    await supabase.from('timeline_events').update({ x_offset: x }).eq('id', active.id)
    onUpdate()
  }

  if (list.length === 0) return <p className={styles.mEmpty}>표시할 사건이 없어요.</p>

  return (
    <>
      {editMode && <p className={styles.mHint}>꾹 눌러서 끌면 순서를 바꿀 수 있어요.</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={list.map(e => e.id)} strategy={verticalListSortingStrategy}>
          <div className={styles.mList}>
            {list.map(e => (
              <Item key={e.id} e={e} characters={characters} editMode={editMode} onEdit={onEdit} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  )
}
