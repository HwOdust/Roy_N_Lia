import RelationMap from '../components/RelationMap'
import styles from './Relations.module.css'

export default function Relations({ characters }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>캐릭터들 사이의 관계를 시각적으로 정리했어요.</p>
      <RelationMap characters={characters} />
    </div>
  )
}
