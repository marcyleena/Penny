import { getStored } from './useStorage'

export async function callPenny(systemPrompt, userMessage, onChunk) {
  const apiKey = getStored('penny_api_key')
  if (!apiKey) throw new Error('No API key configured')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      stream: !!onChunk,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }

  if (!onChunk) {
    const data = await res.json()
    return data.content[0].text
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
    for (const line of lines) {
      try {
        const json = JSON.parse(line.slice(6))
        if (json.type === 'content_block_delta' && json.delta?.text) {
          full += json.delta.text
          onChunk(full)
        }
      } catch {}
    }
  }
  return full
}

export const PENNY_SYSTEM = `You are Penny, a warm, direct AI money manager built specifically for women. Always open with one specific win from her data this month — something she actually did right, stated specifically with numbers. Then give your honest assessment. Always explain any financial terms in plain English inline (e.g. "your APR — that's the yearly interest rate — is 24%"). End with one specific action she can take this week. Never be preachy. Never use the word 'budget' as a verb. Speak like a financially savvy best friend who happens to know a lot about money. Keep responses to 3–4 short paragraphs.`

export const PENNY_CHAT_SYSTEM = `You are Penny, a warm, direct AI money manager built specifically for women. Speak like a financially savvy best friend — specific, encouraging, never preachy, never condescending. Give concise, helpful answers. Always explain financial terms in plain English when you use them. Reference the user's actual financial data when relevant. Never use the word 'budget' as a verb.`
