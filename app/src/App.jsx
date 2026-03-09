import { useState, useCallback } from 'react'
import { CARDS, SPREADS, drawCards } from './data/tarotCards'
import TarotCard from './components/TarotCard'
import CardModal from './components/CardModal'
import GestureCamera from './components/GestureCamera'
import { analyzeReading } from './services/openrouter'

export default function App() {
  const [spreadKey, setSpreadKey]   = useState('ring')
  const [drawn, setDrawn]           = useState(false)
  const [cards, setCards]           = useState([])
  const [intent, setIntent]         = useState('')
  const [modal, setModal]           = useState(null)  // { card, posIndex }
  const [history, setHistory]       = useState([])
  const [aiReading, setAiReading]   = useState(null)   // null | 'loading' | string
  const [aiError, setAiError]       = useState(null)

  const spread = SPREADS[spreadKey]

  const handleDraw = () => {
    const result = drawCards(spread.count)
    setCards(result)
    setDrawn(true)
    // Save to history
    const entry = {
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      spread: spread.label,
      intent: intent.trim(),
      cards: result.map(c => `${c.nameCN}${c.reversed ? '(逆)' : ''}`).join('、'),
    }
    setHistory(prev => [entry, ...prev].slice(0, 10))
  }

  const handleReset = () => {
    setDrawn(false)
    setCards([])
    setIntent('')
    setSpreadKey('ring')
    setAiReading(null)
    setAiError(null)
  }

  const handleAiAnalyze = async () => {
    setAiReading('loading')
    setAiError(null)
    try {
      const text = await analyzeReading({
        spreadLabel: spread.label,
        intent,
        cards,
        positions: spread.positions,
      })
      setAiReading(text)
    } catch (e) {
      setAiError(e.message)
      setAiReading(null)
    }
  }

  const openModal = useCallback((card, posIndex) => {
    setModal({ card, posIndex })
  }, [])

  const closeModal = useCallback(() => setModal(null), [])

  return (
    <>
      {/* Starfield */}
      <div className="stars" />

      <div className="container">
        {/* Header */}
        <header className="header">
          <span className="header-gem">💎</span>
          <h1>珠宝塔罗</h1>
          <p className="header-subtitle">Jewelry Tarot · 以宝石之光，观命运之道</p>
          <div className="divider" />
          <p className="intro">
            每一张塔罗牌，都与一块珍贵的宝石相对应。<br />
            选择你的牌阵，静心冥想你的问题，<br />
            让珠宝的灵性为你揭示命运的密语。
          </p>
        </header>

        {/* Spread Selector */}
        <section className="spread-section">
          <h2>选择牌阵 · Choose Your Spread</h2>
          <div className="spread-options">
            {Object.entries(SPREADS).map(([key, s]) => (
              <button
                key={key}
                className={`spread-btn${spreadKey === key ? ' active' : ''}`}
                onClick={() => { if (!drawn) setSpreadKey(key) }}
                disabled={drawn}
              >
                <span className="spread-btn-icon">{s.icon}</span>
                <span className="spread-btn-label">{s.label}</span>
                <span className="spread-btn-desc">{s.subtitle}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Intent */}
        <div className="intent-wrap">
          <input
            className="intent-input"
            type="text"
            placeholder="✦ 在心中默想你的问题（可选）"
            value={intent}
            maxLength={80}
            onChange={e => setIntent(e.target.value)}
            disabled={drawn}
          />
        </div>

        {/* Gesture Camera */}
        <GestureCamera
          onDraw={handleDraw}
          onReset={handleReset}
          canDraw={!drawn}
          drawn={drawn}
        />

        {/* Draw / Reset */}
        <div className="draw-section">
          <button className="draw-btn" onClick={handleDraw} disabled={drawn}>
            ✦ 抽取塔罗 ✦
          </button>
          {drawn && (
            <button className="reset-btn" onClick={handleReset}>
              重新占卜
            </button>
          )}
        </div>

        {/* Cards */}
        {drawn && (
          <>
            <div className={`cards-area${spreadKey === 'crown' ? ' celtic' : ''}`}>
              {cards.map((card, i) => (
                <TarotCard
                  key={card.id}
                  card={card}
                  positionLabel={spread.positions[i]}
                  delay={i * 0.12}
                  onClick={(c) => openModal(c, i)}
                />
              ))}
            </div>
            <p className="hint">
              点击牌面查看详细解读 · Click a card to reveal its wisdom
            </p>
          </>
        )}

        {/* AI Analysis */}
        {drawn && (
          <section className="ai-section">
            <div className="ai-header">
              <h2>✦ AI 综合解读</h2>
              <button
                className="ai-btn"
                onClick={handleAiAnalyze}
                disabled={aiReading === 'loading'}
              >
                {aiReading === 'loading' ? '解读中…' : aiReading ? '重新解读' : '✦ 请 AI 解读'}
              </button>
            </div>
            {aiReading === 'loading' && (
              <div className="ai-loading">
                <span className="ai-loading-dot" />
                <span className="ai-loading-dot" />
                <span className="ai-loading-dot" />
                <span>正在聆听星辰的低语…</span>
              </div>
            )}
            {aiError && (
              <div className="ai-error">⚠ {aiError}</div>
            )}
            {aiReading && aiReading !== 'loading' && (
              <div className="ai-result">
                <div className="ai-divider" />
                <p>{aiReading}</p>
              </div>
            )}
          </section>
        )}

        {/* Reading History */}
        {history.length > 0 && (
          <section className="history-section">
            <h2>占卜记录 · Reading History</h2>
            <div className="history-list">
              {history.map((h, i) => (
                <div key={i} className="history-item">
                  <span className="history-item-time">{h.time} · {h.spread}</span>
                  <div className="history-item-cards">
                    {h.intent && <span style={{ color: 'var(--text-sub)', marginRight: 8 }}>「{h.intent}」</span>}
                    {h.cards}
                  </div>
                </div>
              ))}
            </div>
            <button className="history-clear" onClick={() => setHistory([])}>
              清除记录
            </button>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer>
        <p>珠宝塔罗 · Jewelry Tarot &nbsp;·&nbsp; 牌面图像来自 Rider-Waite 公版塔罗牌（Public Domain）</p>
        <p style={{ marginTop: 6 }}>宝石对应参考：GemSelect · 牌义参考：Biddy Tarot / labyrinthos.co</p>
      </footer>

      {/* Modal */}
      {modal && (
        <CardModal
          card={modal.card}
          posIndex={modal.posIndex}
          spreadKey={spreadKey}
          onClose={closeModal}
        />
      )}
    </>
  )
}
