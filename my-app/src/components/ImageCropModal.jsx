import { useState, useRef, useCallback } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import styles from './ImageCropModal.module.css'

export default function ImageCropModal({ file, onCropDone, onCancel }) {
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const imgRef = useRef(null)
  const srcUrl = useRef(URL.createObjectURL(file)).current

  const onImageLoad = useCallback((e) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget
    const c = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 3 / 4, width, height),
      width, height
    )
    setCrop(c)
  }, [])

  async function handleDone() {
    if (!completedCrop || !imgRef.current) return
    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = Math.floor(completedCrop.width * scaleX)
    canvas.height = Math.floor(completedCrop.height * scaleY)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0,
      canvas.width,
      canvas.height
    )
    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], file.name, { type: 'image/jpeg' })
      onCropDone(croppedFile)
    }, 'image/jpeg', 0.95)
  }

  return (
    <div className={styles.bg}>
      <div className={styles.modal}>
        <p className={styles.title}>사진 자르기</p>
        <p className={styles.sub}>3:4 비율로 자동 설정돼요. 드래그로 조정할 수 있어요.</p>
        <div className={styles.cropWrap}>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={3 / 4}
            minWidth={50}
          >
            <img
              ref={imgRef}
              src={srcUrl}
              onLoad={onImageLoad}
              className={styles.cropImg}
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>
        <div className={styles.btnRow}>
          <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
          <button className={styles.doneBtn} onClick={handleDone}>완료</button>
        </div>
      </div>
    </div>
  )
}