import styles from './RelationMap.module.css'

export default function RelationMap() {
  return (
    <div className={styles.wrap}>
      <svg className={styles.svg} viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#AFA9EC" opacity="0.6" />
          </marker>
        </defs>

        {/* 관계선 */}
        <line x1="320" y1="70" x2="155" y2="185" stroke="#534AB7" strokeWidth="0.8" opacity="0.5" />
        <line x1="320" y1="70" x2="485" y2="185" stroke="#534AB7" strokeWidth="0.8" opacity="0.5" />
        <line x1="155" y1="185" x2="290" y2="265" stroke="#5a5768" strokeWidth="0.8" opacity="0.5" />
        <line x1="485" y1="185" x2="350" y2="265" stroke="#5a5768" strokeWidth="0.8" opacity="0.5" />
        <line x1="155" y1="185" x2="485" y2="185" stroke="#534AB7" strokeWidth="0.8" opacity="0.3" strokeDasharray="5,4" />
        <line x1="75" y1="125" x2="280" y2="75" stroke="#D85A30" strokeWidth="0.8" opacity="0.35" strokeDasharray="3,3" />

        {/* 관계 레이블 */}
        <text x="225" y="130" fontSize="10" fill="#534AB7" opacity="0.7" fontFamily="Inter">신뢰</text>
        <text x="385" y="130" fontSize="10" fill="#534AB7" opacity="0.7" fontFamily="Inter">견제</text>
        <text x="295" y="236" fontSize="10" fill="#5a5768" opacity="0.7" fontFamily="Inter">동료</text>

        {/* 캐릭터 노드 */}
        <circle cx="320" cy="70" r="40" fill="#1e1e30" stroke="#7F77DD" strokeWidth="0.8" />
        <text x="320" y="66" textAnchor="middle" fontSize="12" fill="#CECBF6" fontWeight="500" fontFamily="Inter">캐릭터 A</text>
        <text x="320" y="82" textAnchor="middle" fontSize="10" fill="#7F77DD" fontFamily="Inter">주인공</text>

        <circle cx="155" cy="185" r="34" fill="#1a1e1a" stroke="#1D9E75" strokeWidth="0.8" />
        <text x="155" y="181" textAnchor="middle" fontSize="11" fill="#9FE1CB" fontWeight="500" fontFamily="Inter">캐릭터 B</text>
        <text x="155" y="196" textAnchor="middle" fontSize="10" fill="#1D9E75" fontFamily="Inter">동료</text>

        <circle cx="485" cy="185" r="34" fill="#1e1a1a" stroke="#D85A30" strokeWidth="0.8" />
        <text x="485" y="181" textAnchor="middle" fontSize="11" fill="#F5C4B3" fontWeight="500" fontFamily="Inter">캐릭터 C</text>
        <text x="485" y="196" textAnchor="middle" fontSize="10" fill="#D85A30" fontFamily="Inter">라이벌</text>

        <circle cx="290" cy="265" r="28" fill="#161618" stroke="#5a5768" strokeWidth="0.8" />
        <text x="290" y="261" textAnchor="middle" fontSize="10" fill="#9996aa" fontWeight="500" fontFamily="Inter">캐릭터 D</text>
        <text x="290" y="276" textAnchor="middle" fontSize="10" fill="#5a5768" fontFamily="Inter">조력자</text>

        <circle cx="350" cy="265" r="28" fill="#161618" stroke="#5a5768" strokeWidth="0.8" />
        <text x="350" y="261" textAnchor="middle" fontSize="10" fill="#9996aa" fontWeight="500" fontFamily="Inter">캐릭터 E</text>
        <text x="350" y="276" textAnchor="middle" fontSize="10" fill="#5a5768" fontFamily="Inter">조력자</text>

        <circle cx="75" cy="125" r="28" fill="#1e1a18" stroke="#D85A30" strokeWidth="0.8" strokeDasharray="3,2" />
        <text x="75" y="121" textAnchor="middle" fontSize="10" fill="#F5C4B3" fontWeight="500" fontFamily="Inter">캐릭터 F</text>
        <text x="75" y="136" textAnchor="middle" fontSize="10" fill="#D85A30" fontFamily="Inter">적대</text>
      </svg>
    </div>
  )
}
