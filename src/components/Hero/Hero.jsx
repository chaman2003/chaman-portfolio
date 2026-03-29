import { useState } from 'react';
import { PROFILE } from '../../data/profile';
import './Hero.css';

export default function Hero({ shellInfo, onSendTopCommand }) {
  const [input, setInput] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    onSendTopCommand(cmd);
    setInput('');
    document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="hero">
      <div className="panel hero-main">
        <p className="muted">Professional Portfolio</p>
        <h1>{PROFILE.name}</h1>
        <p>{PROFILE.role}</p>
        <p className="muted">{PROFILE.summary}</p>
        <div className="tags">
          <span>📍 {PROFILE.location}</span>
          <span>✉️ {PROFILE.email}</span>
          <span>📞 {PROFILE.phone}</span>
        </div>
      </div>

      <aside className="panel hero-shell">
        <h3>Professional Snapshot</h3>
        <div className="shell">
          <div className="shell-head">chaman@archlinux:~ intelligent-shell</div>
          <pre className="shell-body">{shellInfo.join('\n')}</pre>
          <form className="shell-input" onSubmit={submit}>
            <span>❯</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type query here, output appears in lab below"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </aside>
    </section>
  );
}
