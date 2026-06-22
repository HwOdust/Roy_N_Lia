import styles from './Hero.module.css'

export default function Hero() {
  return (
    <div className={styles.hero}>
      <p className={styles.eyebrow}>Original Characters</p>
      <h1 className={styles.title}>
        A world of <em>my own</em> making
      </h1>
      <p className={styles.sub}>이름 없는 세계 속, 이름을 가진 존재들에 대한 기록.</p>
      <div className={styles.scroll}>
        <div className={styles.scrollLine} />
        <span className={styles.scrollText}>scroll</span>
      </div>
    </div>
  )
}
