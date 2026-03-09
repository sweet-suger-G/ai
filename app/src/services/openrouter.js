const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL   = 'google/gemini-2.0-flash-lite-preview'
const API_KEY = import.meta.env.VITE_OPENROUTER_KEY

export async function analyzeReading({ spreadLabel, intent, cards, positions }) {
  const cardLines = cards.map((c, i) => {
    const pos = positions[i] ? `【${positions[i]}】` : ''
    const dir = c.reversed ? '（逆位）' : '（正位）'
    const kw  = c.reversed ? c.reversedKW.join('、') : c.uprightKW.join('、')
    return `${pos} ${c.nameCN}${c.name ? `·${c.name}` : ''} ${dir} — 关键词：${kw}`
  }).join('\n')

  const intentLine = intent?.trim()
    ? `提问者的问题/意图：「${intent.trim()}」\n`
    : ''

  const prompt = `你是一位擅长塔罗牌综合解读的占卜师，风格温柔、富有诗意，用中文回答。

${intentLine}本次牌阵：${spreadLabel}
抽出的牌如下：
${cardLines}

请根据以上信息，给出一段整体的综合解读。要求：
- 结合牌阵每个位置的含义与对应牌的正逆位
- 各张牌之间的能量联系与叙事
- 对提问者的建议或洞见
- 语言优美，约300字，不要分条列举，用自然段落叙述`

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      max_tokens: 600,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '解读内容为空，请重试。'
}
