import localQuestions from '../data/questions.json'

const SHEETS_URL = import.meta.env.VITE_SHEETS_URL ?? ''


// ─── Parser CSV ──────────────────────────────────────────────────────────────
// Lida com campos entre aspas e quebras de linha dentro deles (RFC 4180)
function parseCSV(raw) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < raw.length; i++) {
    const ch   = raw[i]
    const next = raw[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++ } // aspas escapadas
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


// ─── Transformação ───────────────────────────────────────────────────────────
// Converte as linhas do CSV no formato { easy, medium, hard }
// Linha 1 é o cabeçalho e é descartada
// Colunas esperadas: difficulty | text | code | option1-4 | correctIndex
function rowsToQuestions(rows) {
  const [, ...data] = rows
  const result = { easy: [], medium: [], hard: [] }

  for (const row of data) {
    const [difficulty, text, code, opt1, opt2, opt3, opt4, correctIndex] = row
    const key = difficulty?.trim().toLowerCase()
    if (!key || !result[key] || !text?.trim()) continue

    const question = {
      text:         text.trim(),
      options:      [opt1, opt2, opt3, opt4].map(o => o?.trim() ?? ''),
      correctIndex: parseInt(correctIndex?.trim(), 10),
    }
    if (code?.trim()) question.code = code.trim().replace(/\\n/g, '\n')

    result[key].push(question)
  }

  return result
}

function hasAllDifficulties(questions) {
  return ['easy', 'medium', 'hard'].every(d => questions[d]?.length > 0)
}


// ─── Fetch principal ─────────────────────────────────────────────────────────
// Tenta buscar do Google Sheets; em caso de falha usa o JSON local
export async function fetchQuestions() {
  if (SHEETS_URL) {
    try {
      const res = await fetch(SHEETS_URL, { signal: AbortSignal.timeout(6000) })
      if (!res.ok) throw new Error()

      const questions = rowsToQuestions(parseCSV(await res.text()))
      if (!hasAllDifficulties(questions)) throw new Error()

      return questions
    } catch { /* usa fallback local */ }
  }

  return localQuestions
}
