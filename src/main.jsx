import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

try {
  if (localStorage.getItem('theme') === 'light') {
    document.body.setAttribute('data-theme', 'light');
  }
} catch {
  /* ignore */
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
