import { useMemo, useState } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Skills from './components/Skills/Skills';
import Sections from './components/Sections/Sections';
import LabConsole from './components/LabConsole/LabConsole';
import { PROFILE } from './data/profile';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [queuedTopCommand, setQueuedTopCommand] = useState(null);

  const shellInfo = useMemo(
    () => [
      `Name       : ${PROFILE.name}`,
      `Role       : ${PROFILE.role}`,
      `Location   : ${PROFILE.location}`,
      `Phone      : ${PROFILE.phone}`,
      `Email      : ${PROFILE.email}`,
      'Education  : B.E AI & ML (CGPA 8.7), VKIT (2022-2026)',
      'Intern     : Cortex Craft AI (Jan 2026 - Present)',
      'Intern     : Edunet Foundation (Mar 2025 - Apr 2025)',
      'Core       : MERN | Flask | LLMs | RAG | MCP',
      'DevOps     : Docker | Kubernetes | CI/CD | Linux',
      'Languages  : English | Hindi | Kannada | Telugu'
    ],
    []
  );

  return (
    <div className={`app ${theme}`}>
      <Header theme={theme} onThemeToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
      <main className="container">
        <Hero shellInfo={shellInfo} onSendTopCommand={(cmd) => setQueuedTopCommand({ id: Date.now(), cmd })} />
        <Sections />
        <Skills />
        <LabConsole queuedTopCommand={queuedTopCommand} />
      </main>
    </div>
  );
}
