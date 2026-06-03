import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import './styles/index.css';

try {
  if (localStorage.getItem('theme') === 'light') {
    document.body.setAttribute('data-theme', 'light');
  }
} catch {
  /* ignore */
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
