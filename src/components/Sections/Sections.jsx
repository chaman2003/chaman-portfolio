import { useEffect, useMemo, useState } from 'react';
import { EXPERIENCE, PROFILE } from '../../data/profile';
import './Sections.css';

const githubUser = import.meta.env.VITE_GITHUB_USERNAME || 'chaman2003';

export default function Sections() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=8`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRepos(data.filter((x) => x.description).slice(0, 6));
      })
      .catch(() => setRepos([]));
  }, []);

  const projects = useMemo(
    () => [
      { name: 'Epsilora AI', stack: 'React, TypeScript, Gemini API', link: 'https://epsilora.vercel.app/' },
      { name: 'PrintChakra AI', stack: 'Flask, OCR, Socket.IO', link: 'https://github.com/chaman2003/Printchakra-AI' },
      { name: 'PeakHive', stack: 'MERN, JWT, Dashboard Analytics', link: 'https://peakhive.vercel.app/' }
    ],
    []
  );

  return (
    <>
      <section id="experience" className="panel">
        <h2>Experience</h2>
        <div className="grid-2">
          {EXPERIENCE.map((item) => (
            <article className="item" key={item.org}>
              <h4>{item.org}</h4>
              <p className="muted">{item.period}</p>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className="panel">
        <h2>Featured Projects</h2>
        <div className="grid-3">
          {projects.map((p) => (
            <article className="item" key={p.name}>
              <h4>{p.name}</h4>
              <p>{p.stack}</p>
              <a href={p.link} target="_blank" rel="noreferrer">Open →</a>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Live GitHub Snapshot</h2>
        <div className="grid-3">
          {repos.length
            ? repos.map((repo) => (
                <article key={repo.id} className="item">
                  <h4>{repo.name}</h4>
                  <p>{repo.description}</p>
                  <a href={repo.html_url} target="_blank" rel="noreferrer">Repo →</a>
                </article>
              ))
            : <p className="muted">Loading repositories...</p>}
        </div>
      </section>

      <section className="panel">
        <h2>Profiles</h2>
        <div className="grid-3">
          <article className="item"><h4>GitHub</h4><a href={PROFILE.github} target="_blank" rel="noreferrer">{PROFILE.github}</a></article>
          <article className="item"><h4>LinkedIn</h4><a href={PROFILE.linkedin} target="_blank" rel="noreferrer">{PROFILE.linkedin}</a></article>
          <article className="item"><h4>LeetCode</h4><a href={PROFILE.leetcode} target="_blank" rel="noreferrer">{PROFILE.leetcode}</a></article>
        </div>
      </section>
    </>
  );
}
