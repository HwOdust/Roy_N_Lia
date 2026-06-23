import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import ImageCropModal from '../components/ImageCropModal'
import styles from './Home.module.css'

export default function Home({ characters, worldCards, timelineEvents, homeSettings, editMode, onUpdate }) {
  const navigate = useNavigate()
  const [cropFile, setCropFile] = useState(null)
  const [localSettings, setLocalSettings] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (homeSettings) setLocalSettings({ ...homeSettings })
  }, [homeSettings])

  const settings = localSettings ?? homeSettings ?? {}
  const shadowColor = settings.text_shadow_color ?? '#000000'
const textShadow = `0 2px 16px ${shadowColor}, 0 0 40px ${shadowColor}aa`

  async function handleImageUpload(file) {
    const ext = file.name.split('.').pop()
    const path = `hero.${ext}`
    await supabase.storage.from('characters').upload(path, file, { upsert: true })
    const { data } = supabase.storage.from('characters').getPublicUrl(path)
    const url = `${data.publicUrl}?t=${Date.now()}`
    setLocalSettings(p => ({ ...p, hero_image_url: url }))
    await supabase.from('home_settings').update({ hero_image_url: url }).eq('id', homeSettings.id)
  }

  async function handleOpacityChange(val) {
    const opacity = parseFloat(val)
    setLocalSettings(p => ({ ...p, hero_image_opacity: opacity }))
    await supabase.from('home_settings').update({ hero_image_opacity: opacity }).eq('id', homeSettings.id)
  }

  async function handleTextSave(field, value) {
    setLocalSettings(p => ({ ...p, [field]: value }))
    await supabase.from('home_settings').update({ [field]: value }).eq('id', homeSettings.id)
  }

  async function handleShadowColorChange(color) {
    setLocalSettings(p => ({ ...p, text_shadow_color: color }))
    await supabase.from('home_settings').update({ text_shadow_color: color }).eq('id', homeSettings.id)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        {settings.hero_image_url && (
          <img
            src={settings.hero_image_url}
            alt="hero"
            className={styles.heroBg}
            style={{ opacity: settings.hero_image_opacity ?? 0.5 }}
          />
        )}

        {editMode && (
          <div className={styles.heroEdit}>
            <button className={styles.heroEditBtn} onClick={() => fileInputRef.current.click()}>
              <i className="ti ti-photo" /> 배경 사진 변경
            </button>
            <input
              ref={fileInputRef}
              type="file" accept="image/*"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) setCropFile(e.target.files[0]); e.target.value = '' }}
            />
            <div className={styles.opacityRow}>
              <span className={styles.opacityLabel}>글씨 그림자</span>
              <input
                type="color"
                value={shadowColor}
                onChange={e => handleShadowColorChange(e.target.value)}
                className={styles.shadowColorInput}
              />
            </div>
            <div className={styles.opacityRow}>
              <span className={styles.opacityLabel}>투명도</span>
              <input
                type="range" min="0" max="1" step="0.05"
                value={settings.hero_image_opacity ?? 0.5}
                onChange={e => handleOpacityChange(e.target.value)}
                className={styles.opacitySlider}
              />
              <span className={styles.opacityValue}>{Math.round((settings.hero_image_opacity ?? 0.5) * 100)}%</span>
            </div>
          </div>
        )}

        <p className={styles.eyebrow} style={{ textShadow }}> Original Characters</p>

        {editMode ? (
          <h1 className={styles.title}>
            <textarea
              className={styles.titleEdit}
              value={settings.hero_title ?? ''}
              onChange={e => setLocalSettings(p => ({ ...p, hero_title: e.target.value }))}
              onBlur={e => handleTextSave('hero_title', e.target.value)}
              rows={2}
              style={{ textShadow }}
            />
          </h1>
        ) : (
          <h1 className={styles.title} style={{ textShadow }}>{settings.hero_title}</h1>
        )}

        {editMode ? (
          <textarea
            className={styles.subEdit}
            value={settings.hero_sub ?? ''}
            onChange={e => setLocalSettings(p => ({ ...p, hero_sub: e.target.value }))}
            onBlur={e => handleTextSave('hero_sub', e.target.value)}
            rows={2}
            style={{ textShadow }}
          />
        ) : (
          <p className={styles.sub} style={{ textShadow }}>{settings.hero_sub}</p>
        )}
      </div>

      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.previewCard} onClick={() => navigate('/characters')}>
            <p className={styles.previewLabel}>Characters</p>
            <div className={styles.charPreview}>
              {characters.slice(0, 4).map(c => (
                <div key={c.id} className={styles.charThumb} style={{ background: c.color }}>
                  {c.image_url
                    ? <img src={c.image_url} alt={c.name} />
                    : <span style={{ color: c.accent }}>{c.initial}</span>}
                </div>
              ))}
              {characters.length > 4 && (
                <div className={styles.charMore}>+{characters.length - 4}</div>
              )}
            </div>
            <p className={styles.previewSub}>{characters.length}명의 캐릭터 →</p>
          </div>

          <div className={styles.previewCard} onClick={() => navigate('/world')}>
            <p className={styles.previewLabel}>World & Setting</p>
            <div className={styles.worldPreview}>
              {worldCards.slice(0, 2).map(w => (
                <div key={w.id} className={styles.worldItem}>
                  <i className={`ti ${w.icon}`} aria-hidden="true" />
                  <span>{w.title}</span>
                </div>
              ))}
            </div>
            <p className={styles.previewSub}>세계관 보기 →</p>
          </div>

          <div className={styles.previewCard} onClick={() => navigate('/timeline')}>
            <p className={styles.previewLabel}>Timeline</p>
            <div className={styles.timelinePreview}>
              {timelineEvents.slice(0, 3).map(e => (
                <div key={e.id} className={styles.timelineItem}>
                  <div className={styles.timelineDot} style={{ background: e.color || 'var(--purple)' }} />
                  <div>
                    <p className={styles.timelineDate}>{e.date}</p>
                    <p className={styles.timelineTitle}>{e.title}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className={styles.previewSub}>{timelineEvents.length}개의 사건 →</p>
          </div>

          <div className={styles.previewCard} onClick={() => navigate('/relations')}>
            <p className={styles.previewLabel}>Relationship Map</p>
            <div className={styles.relPreview}>
              <i className="ti ti-sitemap" aria-hidden="true" />
            </div>
            <p className={styles.previewSub}>관계도 보기 →</p>
          </div>

          <div className={styles.previewCard} onClick={() => navigate('/palette')}>
            <p className={styles.previewLabel}>Palette</p>
            <div className={styles.relPreview}>
              <i className="ti ti-palette" aria-hidden="true" />
            </div>
            <p className={styles.previewSub}>팔레트 보기 →</p>
          </div>
        </div>
      </div>

      {cropFile && (
        <ImageCropModal
          file={cropFile}
          aspect={2557 / 540}
          onCropDone={(croppedFile) => {
            setCropFile(null)
            handleImageUpload(croppedFile)
          }}
          onCancel={() => setCropFile(null)}
        />
      )}
    </div>
  )
}