import styles from './World.module.css'

export default function World({ worldCards }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {worldCards.map((w) => (
          <div key={w.id} className={styles.card}>
            <div className={styles.icon}>
              <i className={`ti ${w.icon}`} aria-hidden="true" />
            </div>
            <p className={styles.title}>{w.title}</p>
            <p className={styles.desc}>{w.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
