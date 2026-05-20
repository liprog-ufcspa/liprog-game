export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { difficulty, topic } = req.body ?? {};

  if (
    difficulty === undefined ||
    difficulty === null ||
    topic === undefined ||
    topic === null
  ) {
    return res.status(400).json({ error: 'Missing required fields: difficulty, topic' });
  }

  if (difficulty < 1 || difficulty > 3) {
    return res.status(400).json({ error: 'difficulty must be between 1 and 3' });
  }

  // TODO: replace with real Groq API call using process.env.GROQ_API_KEY
  return res.status(200).json({
    question: '',
    options: ['', '', '', ''],
    correct: 0,
  });
}
