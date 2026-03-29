import { RESUME_RAG } from '../data/profile';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function pickContext(query, docs, topK = 5) {
  const q = tokenize(query);
  const scored = docs.map((doc) => {
    const d = doc.toLowerCase();
    let score = 0;
    q.forEach((t) => {
      if (d.includes(t)) score += t.length > 5 ? 2 : 1;
    });
    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const winners = scored.filter((x) => x.score > 0).slice(0, topK).map((x) => x.doc);
  return winners.length ? winners : docs.slice(0, topK);
}

export async function askGroqWithRag(query, extraDocs = []) {
  if (!GROQ_API_KEY) return 'Groq key missing. Please set VITE_GROQ_API_KEY in env.';

  const docs = [...RESUME_RAG, ...extraDocs].filter(Boolean);
  const context = pickContext(query, docs);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 420,
      messages: [
        {
          role: 'system',
          content:
            'You are a portfolio assistant. Answer clearly and briefly using only the provided context.'
        },
        {
          role: 'user',
          content: `Question: ${query}\n\nContext:\n${context.join('\n\n')}`
        }
      ]
    })
  });

  if (!response.ok) {
    const txt = await response.text();
    return `Groq error (${response.status}): ${txt.slice(0, 140)}`;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || 'No response generated.';
}
