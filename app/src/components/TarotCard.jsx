import { useState } from 'react'

export default function TarotCard({ card, positionLabel, delay, onClick }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div
      className={`card-slot ${card.reversed ? 'reversed' : 'flipped'}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={() => onClick(card)}
    >
      <div className="card-inner">
        {/* Back */}
        <div className="card-back">
          <div className="card-back-pattern" />
        </div>

        {/* Face */}
        <div className="card-face">
          <div className="card-img-wrap">
            {!imgFailed ? (
              <img
                src={card.image}
                alt={card.nameCN}
                loading="lazy"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="gem-fallback show">
                <span style={{ fontSize: '3.5rem' }}>{card.gemEmoji}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: 6, fontFamily: "'Noto Serif SC',serif" }}>
                  {card.gem}
                </span>
              </div>
            )}
          </div>
          <div className="card-info">
            <div className="card-number">{card.number}</div>
            <div className="card-name-cn">{card.nameCN}</div>
            <div className="card-gem-label">{card.gemEmoji} {card.gem}</div>
          </div>
          {card.reversed && <div className="reversed-badge">逆位</div>}
        </div>
      </div>

      {positionLabel && (
        <div className="position-label">{positionLabel}</div>
      )}
    </div>
  )
}
