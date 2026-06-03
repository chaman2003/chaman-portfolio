import { askGeminiWithRag } from '../../services/rag.js';
import {
  LAB_ALIASES,
  LAB_RESPONSES,
  LINKEDIN_RAG_CHUNKS,
  RESUME_RAG_CHUNKS,
} from '../../config/lab-commands.js';

export function initLabTerminal(ctx) {
  const { labOutput, labButtons, labForm, labInput, fetchForm, fetchInput } = ctx.dom;
  const { lab, rag } = ctx;

  const getRagDocuments = () =>
    [
      ...RESUME_RAG_CHUNKS,
      ...LINKEDIN_RAG_CHUNKS,
      rag.githubProfileChunk,
      ...rag.githubRagChunks,
    ].filter(Boolean);

  const typeToElement = (el, text) => {
    if (!el) return;
    el.textContent = text;
    el.scrollTop = el.scrollHeight;
  };

  const typeToLab = (text) => typeToElement(labOutput, text);

  const setActiveLabButton = (cmd) => {
    labButtons.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-lab-cmd') === cmd);
    });
  };

  const executeLabCommand = async (rawCommand, opts = { store: true, source: 'lab' }) => {
    const commandRaw = String(rawCommand || '').trim();
    if (!commandRaw || lab.busy) return;

    const command = commandRaw.toLowerCase();
    const normalized = LAB_ALIASES[command] || command;

    if (opts.store !== false && normalized !== 'clear') {
      lab.history.unshift(commandRaw);
      lab.history = Array.from(new Set(lab.history)).slice(0, 20);
      lab.historyCursor = -1;
    }

    setActiveLabButton(normalized);

    if (normalized === 'clear') {
      typeToLab('');
      return;
    }

    const aiPreset = {
      'ai.summary': 'Give a concise professional summary of Chaman S in 5 bullet points.',
      'ai.projects': 'Summarize Chaman’s strongest projects and technical impact.',
      'ai.skills':
        'Group Chaman’s top skills by frontend, backend, AI, and DevOps with short impact notes.',
    };

    let aiQuery = null;
    if (command.startsWith('ask ')) {
      aiQuery = commandRaw.slice(4).trim();
    } else if (aiPreset[normalized]) {
      aiQuery = aiPreset[normalized];
    } else if (!LAB_RESPONSES[normalized]) {
      aiQuery = commandRaw;
    }

    if (aiQuery) {
      try {
        lab.busy = true;
        typeToLab(`> ${commandRaw}\n\nthinking..`);
        const response = await askGeminiWithRag(aiQuery, getRagDocuments(), {
          short: Boolean(aiPreset[normalized]),
          throwErrors: true,
          topK: 6,
        });
        typeToLab(`> ${commandRaw}\n\n${response}`);
      } catch (err) {
        typeToLab(`> ${commandRaw}\n\n${err.message}`);
      } finally {
        lab.busy = false;
      }
      return;
    }

    const response =
      LAB_RESPONSES[normalized] ||
      `Unknown command: ${commandRaw}\nTry: ask summarize my internships`;
    typeToLab(`> ${commandRaw}\n\n${response}`);
  };

  if (labButtons.length) {
    labButtons.forEach((btn) => {
      btn.addEventListener('click', () => executeLabCommand(btn.getAttribute('data-lab-cmd')));
    });
  }

  const handleSharedSubmit = (inputEl, source) => {
    const cmd = inputEl?.value || '';
    if (!cmd.trim()) return;
    executeLabCommand(cmd, { source });
    if (source === 'top') {
      if (ctx.scroll?.scrollTo) {
        ctx.scroll.scrollTo('#lab', { duration: 2.4, offset: -24 });
      } else {
        document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    if (inputEl) inputEl.value = '';
  };

  labForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSharedSubmit(labInput, 'lab');
  });

  fetchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSharedSubmit(fetchInput, 'top');
  });

  labInput?.addEventListener('keydown', (e) => {
    if (!lab.history.length) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      lab.historyCursor = Math.min(lab.historyCursor + 1, lab.history.length - 1);
      labInput.value = lab.history[lab.historyCursor] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      lab.historyCursor = Math.max(lab.historyCursor - 1, -1);
      labInput.value = lab.historyCursor >= 0 ? lab.history[lab.historyCursor] : '';
    }
  });

  executeLabCommand('help', { store: false, source: 'lab' });
}
