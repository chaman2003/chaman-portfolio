import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import { hardScrollToTop } from './lib/scroll-reset.js';
import './styles/index.css';

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
hardScrollToTop();

try {
  if (localStorage.getItem('theme') === 'light') {
    document.body.setAttribute('data-theme', 'light');
  }
} catch {
  /* ignore */
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
