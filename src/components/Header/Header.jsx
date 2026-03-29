import './Header.css';

export default function Header({ theme, onThemeToggle }) {
  return (
    <header className="header panel">
      <div className="brand">CHAMAN.X</div>
      <nav>
        <a href="#skills">Skills</a>
        <a href="#experience">Experience</a>
        <a href="#projects">Projects</a>
        <a href="#lab">Lab</a>
      </nav>
      <button type="button" onClick={onThemeToggle}>
        {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  );
}
