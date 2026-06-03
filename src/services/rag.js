import { RESUME_RAG } from '../data/profile';
import { PORTFOLIO_RAG_DOCS } from '../data/portfolioRag';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const BASE_PORTFOLIO_DOCS = [...PORTFOLIO_RAG_DOCS, ...RESUME_RAG];
const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'into',
  'about',
  'what',
  'which',
  'your',
  'you',
  'how',
  'can',
  'are',
  'was',
  'were',
  'have',
  'has',
  'had',
  'who',
  'him',
  'her',
  'his',
  'their',
  'them',
]);

function tokenize(text = '') {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return Array.from(new Set(tokens.filter((t) => !STOP_WORDS.has(t))));
}

function normalizeDoc(doc) {
  return String(doc || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    count += 1;
    idx = haystack.indexOf(needle, idx + needle.length);
  }
  return count;
}

function inferQueryIntents(query, tokens) {
  const q = query.toLowerCase();
  const hasAny = (arr) => arr.some((x) => q.includes(x) || tokens.includes(x));
  return {
    hiring: hasAny([
      'hire',
      'hiring',
      'contact',
      'reach',
      'available',
      'internship',
      'job',
      'collab',
      'collaboration',
    ]),
    projects: hasAny(['project', 'build', 'portfolio', 'work', 'case', 'demo']),
    skills: hasAny(['skill', 'stack', 'tech', 'technology', 'tool', 'framework']),
    education: hasAny(['education', 'degree', 'college', 'cgpa', 'study']),
    experience: hasAny(['experience', 'intern', 'internship', 'role', 'company', 'worked']),
    achievements: hasAny(['achievement', 'award', 'rank', 'sponsorship']),
  };
}

function pickContext(query, docs, topK = 8) {
  const queryText = String(query || '')
    .trim()
    .toLowerCase();
  const qTokens = tokenize(queryText);
  const intents = inferQueryIntents(queryText, qTokens);
  const scored = docs.map((rawDoc, index) => {
    const doc = normalizeDoc(rawDoc);
    const d = doc.toLowerCase();
    let score = 0;

    if (queryText && d.includes(queryText)) {
      score += 20;
    }

    qTokens.forEach((token) => {
      const occurrences = countOccurrences(d, token);
      if (!occurrences) return;
      const tokenWeight = token.length >= 8 ? 3.4 : token.length >= 5 ? 2.4 : 1.3;
      score += Math.min(3, occurrences) * tokenWeight;

      if (d.startsWith(token) || d.includes(`${token}:`) || d.includes(`- ${token}`)) {
        score += 1.5;
      }
    });

    if (
      intents.hiring &&
      /(contact|email|phone|linkedin|hire|hiring|collaboration|internship|available)/.test(d)
    ) {
      score += 8;
    }
    if (intents.projects && /(project|build|demo|source|stack|live)/.test(d)) {
      score += 5;
    }
    if (intents.skills && /(skills|frontend|backend|ai stack|languages|devops|databases)/.test(d)) {
      score += 5;
    }
    if (intents.education && /(education|degree|college|cgpa|institute)/.test(d)) {
      score += 6;
    }
    if (intents.experience && /(experience|intern|role|company|impact)/.test(d)) {
      score += 6;
    }
    if (intents.achievements && /(achievement|rank|award|sponsorship|place)/.test(d)) {
      score += 6;
    }

    return { doc, score, index };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });

  const winners = scored
    .filter((x) => x.score > 0)
    .slice(0, topK)
    .map((x) => x.doc);

  const fallback = docs.slice(0, topK).map(normalizeDoc);
  return winners.length ? winners : fallback;
}

function resolveDocs(extraDocs, { replaceBase = false, topK = 5 } = {}) {
  const merged = replaceBase
    ? extraDocs.filter(Boolean)
    : [...BASE_PORTFOLIO_DOCS, ...extraDocs].filter(Boolean);

  const docs = Array.from(new Set(merged.map(normalizeDoc))).filter(Boolean);
  return { docs, topK };
}

export async function askGeminiWithRag(query, extraDocs = [], options = {}) {
  const { short = false, throwErrors = false, replaceBase = false, topK = 8 } = options;
  const { docs, topK: k } = resolveDocs(extraDocs, { replaceBase, topK });

  if (!GEMINI_API_KEY) {
    const msg = 'Gemini API key missing. Set VITE_GEMINI_API_KEY in your .env file.';
    if (throwErrors) throw new Error(msg);
    return msg;
  }

  const context = pickContext(query, docs, k);
  const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              "You are Chaman's assistant. Keep answers concise, natural, and confident. " +
              'Match a chill professional vibe, with minimal emoji usage. ' +
              'Use the provided portfolio context when the question is about Chaman. ' +
              'For general/off-topic questions, still answer helpfully and briefly instead of refusing. ' +
              'Avoid robotic disclaimers.',
          },
        ],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: `Question: ${query}\n\nContext:\n${context.join('\n\n')}` }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: short ? 220 : 450,
      },
    }),
  });

  if (!response.ok) {
    const txt = await response.text();
    const msg = `Gemini request failed (${response.status}): ${txt.slice(0, 160)}`;
    if (throwErrors) throw new Error(msg);
    return msg;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const answer = text?.trim() || 'No response generated.';
  return answer;
}
