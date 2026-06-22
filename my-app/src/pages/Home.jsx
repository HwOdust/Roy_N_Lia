import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home({ characters, worldCards, timelineEvents }) {
  const navigate = useNavigate()

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Original Characters</p>
        <h1 className={styles.title}>A world of <em>my own</em> making</h1>
        <p className={styles.sub}>이름 없는 세계 속, 이름을 가진 존재들에 대한 기록.</p>
      </div>

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
      </div>
    </div>
  )
}
