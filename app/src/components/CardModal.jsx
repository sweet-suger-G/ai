import { useEffect, useState } from 'react'
import { SPREADS } from '../data/tarotCards'

export default function CardModal({ card, posIndex, spreadKey, onClose }) {
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!card) return null

  const isReversed = card.reversed
  const spread = SPREADS[spreadKey]
  const position = spread?.positions[posIndex] ?? ''
  const keywords = isReversed ? card.reversedKW : card.uprightKW
  const otherKw  = isReversed ? card.uprightKW  : card.reversedKW
  const meaning  = isReversed ? card.reversedMeaning : card.uprightMeaning

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-inner">
          {/* Card image / gem fallback */}
          {!imgFailed ? (
            <img
              className="modal-card-img"
              src={card.image}
              alt={card.nameCN}
              style={isReversed ? { transform: 'rotate(180deg)' } : {}}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="modal-gem-fallback">
              <span style={{ fontSize: '5rem' }}>{card.gemEmoji}</span>
            </div>
          )}

          {/* Content */}
          <div className="modal-content">
            <div className="modal-number">{card.number} · {card.name}</div>
            <div className="modal-name">{card.nameCN}</div>
            {isReversed && <div className="modal-reversed">逆位 · Reversed</div>}
            {position && <div className="modal-position">📍 {position}</div>}

            <div className="gem-row">
              <span className="gem-badge">
                {card.gemEmoji} {card.gem} · {card.gemEN}
              </span>
              <span className="gem-meta">{card.element} · {card.planet}</span>
            </div>

            <div className="modal-divider" />

            {/* Meaning */}
            <div className="meaning-section">
              <h3>{isReversed ? '逆位牌义' : '正位牌义'}</h3>
              <div className="keywords">
                {keywords.map(k => (
                  <span key={k} className={`kw-tag${isReversed ? ' reversed' : ''}`}>{k}</span>
                ))}
              </div>
              <p>{meaning}</p>
            </div>

            {/* Other keywords for reference */}
            <div className="meaning-section">
              <h3>{isReversed ? '正位关键词参考' : '逆位关键词参考'}</h3>
              <div className="keywords">
                {otherKw.map(k => (
                  <span key={k} className="kw-tag faded">{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
