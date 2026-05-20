import localQuestions from '../data/questions.json'

// Cole aqui a URL da sua planilha publicada como CSV:
// Planilha > Arquivo > Compartilhar > Publicar na Web > CSV > Copiar link
// Formato esperado das colunas (linha 1 = cabeçalho, ignorado):
// difficulty | text | code | option1 | option2 | option3 | option4 | correctIndex
const SHEETS_URL = import.meta.env.VITE_SHEETS_URL ?? ''

// Parser CSV que lida com campos entre aspas e quebras de linha dentro deles
function parseCSV(raw) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    const next = raw[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++ }
      else if (ch === '"')             inQuotes = false
      else                             field += ch
    } else {
      if      (ch === '"')  inQuotes = true
      else if (ch === ',')  { row.push(field); field = '' }
      else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++
        row.push(field); field = ''
        if (row.some(Boolean)) rows.push(row)
        row = []
      } else {
        field += ch
      }
    }
  }

  if (field || row.length) { row.push(field); if (row.some(Boolean)) rows.push(row) }
  return rows
}

function sheetsToQuestions(rows) {
  const [, ...data] = rows // descarta cabeçalho
  const result = { easy: [], medium: [], hard: [] }

  for (const row of data) {
    const [difficulty, text, code, opt1, opt2, opt3, opt4, correctIndex] = row
    const key = difficulty?.trim().toLowerCase()
    if (!key || !result[key] || !text?.trim()) continue

    const question = {
      text: text.trim(),
      options: [opt1, opt2, opt3, opt4].map(o => o?.trim() ?? ''),
      correctIndex: parseInt(correctIndex?.trim(), 10),
    }
    if (code?.trim()) question.code = code.trim()

    result[key].push(question)
  }

  return result
}

function isValid(q) {
  return ['easy', 'medium', 'hard'].every(d => q[d]?.length > 0)
}

export async function fetchQuestions() {
  if (SHEETS_URL) {
    try {
      const res = await fetch(SHEETS_URL, { signal: AbortSignal.timeout(6000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const text = await res.text()
      const rows = parseCSV(text)
      const questions = sheetsToQuestions(rows)

      if (!isValid(questions)) throw new Error('Planilha sem dados suficientes')

      console.info('[questions] Carregado do Google Sheets ✓')
      return questions
    } catch (err) {
      console.warn('[questions] Sheets falhou, usando fallback local:', err.message)
    }
  } else {
    console.info('[questions] VITE_SHEETS_URL não configurado, usando fallback local')
  }

  return localQuestions
}
