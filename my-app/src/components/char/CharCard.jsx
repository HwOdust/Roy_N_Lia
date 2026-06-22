import { useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../../supabase'
import ImageCropModal from '../ImageCropModal'
import styles from './CharCard.module.css'

export default function CharCard({ char, onClick, editMode, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: char.id })
  const fileInputRef = useRef(null)
  const [cropFile, setCropFile] = useState(null)
  const [hovered, setHovered] = useState(false)

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
    boxShadow: hovered && char.color ? `0 0 0 1.5px ${char.color}, 0 0 20px 4px ${char.color}66` : undefined,
  }

async function handleImageUpload(file) {
  if (!file) return
  const ext = file.name.split('.').pop()
  const path = `${char.id}.${ext}`
  await supabase.storage.from('characters').upload(path, file, { upsert: true })
  const { data } = supabase.storage.from('characters').getPublicUrl(path)
  const urlWithCache = `${data.publicUrl}?t=${Date.now()}`

  // canvas로 직접 색상 추출
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = urlWithCache
  img.onload = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 10
    canvas.height = 10
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, 10, 10)
    const pixels = ctx.getImageData(0, 0, 10, 10).data
    let r = 0, g = 0, b = 0
    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i]
      g += pixels[i + 1]
      b += pixels[i + 2]
    }
    const count = pixels.length / 4
    r = Math.round(r / count)
    g = Math.round(g / count)
    b = Math.round(b / count)
    const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
    await supabase.from('characters').update({ image_url: urlWithCache, color: hex }).eq('id', char.id)
    onUpdate()
  }
}

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    setCropFile(file)
    e.target.value = ''
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={cardStyle}
        className={`${styles.card} ${editMode ? styles.editMode : ''}`}
        {...(editMode ? { ...attributes, ...listeners } : {})}
        onClick={() => !editMode && onClick(char)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {char.image_url ? (
          <img src={char.image_url} alt={char.name} className={styles.image} />
        ) : (
          <div className={styles.avatar} style={{ background: char.color, color: char.accent }}>
            {char.initial}
          </div>
        )}

        {editMode ? (
          <div className={styles.editOverlay}>
            <button
              className={styles.editOverlayBtn}
              onClick={(e) => { e.stopPropagation(); fileInputRef.current.click() }}
            >
              <i className="ti ti-photo" aria-hidden="true" />
              <span>사진 변경</span>
            </button>
            <button
              className={styles.editOverlayBtn}
              onClick={(e) => { e.stopPropagation(); onClick(char) }}
            >
              <i className="ti ti-edit" aria-hidden="true" />
              <span>정보 편집</span>
            </button>
            <button
              className={styles.editOverlayBtn}
              onClick={(e) => { e.stopPropagation(); onClick({ ...char, _viewOnly: true }) }}
            >
              <i className="ti ti-eye" aria-hidden="true" />
              <span>미리보기</span>
            </button>
            <input
              ref={fileInputRef}
              type="file" accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className={styles.overlay}>
            <p className={styles.overlayName}>{char.name}</p>
            <p className={styles.overlayRole}>{char.role}</p>
          </div>
        )}
      </div>

      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onCropDone={(croppedFile) => {
            setCropFile(null)
            handleImageUpload(croppedFile)
          }}
          onCancel={() => setCropFile(null)}
        />
      )}
    </>
  )
}