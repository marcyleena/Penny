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

export const PENNY_SYSTEM = `You are Penny, a warm, direct, no-nonsense AI money manager for women.
You speak like a financially savvy best friend — specific, encouraging, never preachy.
Keep responses to 3–4 short paragraphs. Use the user's actual data.
Always end with one specific action they can take this week.`

export const PENNY_CHAT_SYSTEM = `You are Penny, a warm, direct, no-nonsense AI money manager for women.
You speak like a financially savvy best friend — specific, encouraging, never preachy.
Give concise, helpful answers. Reference the user's actual financial data when relevant.`
