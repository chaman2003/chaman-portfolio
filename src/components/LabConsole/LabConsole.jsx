import { useEffect, useMemo, useState } from 'react';
import { PROFILE } from '../../data/profile';
import { askGeminiWithRag } from '../../utils/rag';
import './LabConsole.css';

const QUICK = ['help', 'about', 'stack', 'contact', 'ai.summary', 'ai.projects', 'ai.skills'];

export default function LabConsole({ queuedTopCommand }) {
  const [output, setOutput] = useState('Type "help" or ask a question.');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const extraDocs = useMemo(
    () => [
      `LinkedIn: ${PROFILE.linkedin}`,
      `GitHub: ${PROFILE.github}`,
      `LeetCode: ${PROFILE.leetcode}`,
      `Role: ${PROFILE.role}`
    ],
    []
  );

  const staticCommands = {
    help: 'Commands: help, about, stack, contact, ai.summary, ai.projects, ai.skills, ask <question>, clear',
    about: `${PROFILE.name} | ${PROFILE.role} | ${PROFILE.location}`,
    stack: 'MERN, Flask, RAG, LLM integrations, Docker, Kubernetes, CI/CD',
    contact: `${PROFILE.email} | ${PROFILE.phone}`
  };

  async function run(commandRaw) {
    const command = commandRaw.trim();
    if (!command || busy) return;

    const normalized = command.toLowerCase();
    if (normalized === 'clear') {
      setOutput('');
      return;
    }

    if (staticCommands[normalized]) {
      setOutput(`> ${command}\n\n${staticCommands[normalized]}`);
      return;
    }

    const preset = {
      'ai.summary': 'Give a concise professional summary of Chaman S in 5 bullet points.',
      'ai.projects': 'Summarize strongest projects with impact.',
      'ai.skills': 'Group skills into frontend, backend, AI, and devops.'
    };

    const askQuery = normalized.startsWith('ask ') ? command.slice(4).trim() : null;
    const query = askQuery || preset[normalized] || command;

    setBusy(true);
    setOutput(`> ${command}\n\nthinking..`);
    const answer = await askGeminiWithRag(query, extraDocs);
    setOutput(`> ${command}\n\n${answer}`);
    setBusy(false);
  }

  useEffect(() => {
    if (!queuedTopCommand?.cmd) return;
    run(queuedTopCommand.cmd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuedTopCommand?.id]);

  return (
    <section id="lab" className="panel">
      <h2>Interactive Lab Console</h2>
      <div className="lab-layout">
        <div className="quick-grid">
          {QUICK.map((cmd) => (
            <button key={cmd} type="button" onClick={() => run(cmd)}>{cmd}</button>
          ))}
        </div>

        <div className="console">
          <div className="console-head">vrik@chaman:~$ interactive-shell</div>
          <pre>{output}</pre>
          <form
            className="console-input"
            onSubmit={(e) => {
              e.preventDefault();
              run(input);
              setInput('');
            }}
          >
            <span>❯</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try: ask summarize internships"
            />
            <button type="submit" disabled={busy}>{busy ? '...' : 'Run'}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
