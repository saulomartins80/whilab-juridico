import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()

// Cache simples em memória (curto prazo)
const cache = new Map<string, { data: any; expiresAt: number }>()
const TTL_MS = 60_000 // 60s

function getCached(key: string) {
  const entry = cache.get(key)
  if (entry && entry.expiresAt > Date.now()) return entry.data
  if (entry) cache.delete(key)
  return null
}

function setCached(key: string, data: any) {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS })
}

router.post('/market-data', async (req, res) => {
  try {
    const { symbols = [], cryptos = [], commodities = [], fiis = [], etfs = [], currencies = [] } = req.body || {}

    // Montar lista única de símbolos
    const list: string[] = [...symbols, ...cryptos, ...commodities, ...fiis, ...etfs, ...currencies].filter(Boolean)
    if (list.length === 0) return res.status(400).json({ success: false, message: 'Nenhum símbolo informado' })

    const key = JSON.stringify(list.sort())
    const cached = getCached(key)
    if (cached) return res.json({ success: true, data: cached, cached: true, lastUpdated: new Date().toISOString() })

    // Buscar sequencialmente com timeout curto por símbolo (Yahoo chart endpoint)
    const results: Record<string, { price: number; change: number }> = {}

    for (const symbol of list) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8_000)
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d`
      try {
        const r = await fetch(url, { signal: controller.signal })
        clearTimeout(timeout)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data: any = await r.json()
        const meta = data?.chart?.result?.[0]?.meta
        const previous = Number(meta?.chartPreviousClose || 0)
        const current = Number(meta?.regularMarketPrice || 0)
        const change = current - previous
        results[symbol] = { price: current, change }
      } catch (e) {
        clearTimeout(timeout)
        // fallback: não falhar o pacote inteiro
        results[symbol] = results[symbol] || { price: 0, change: 0 }
      }
    }

    setCached(key, results)
    return res.json({ success: true, data: results, cached: false, lastUpdated: new Date().toISOString() })
  } catch (error: any) {
    console.error('[marketRoutes] error:', error)
    return res.status(500).json({ success: false, message: 'Erro ao buscar dados de mercado' })
  }
})

export default router
