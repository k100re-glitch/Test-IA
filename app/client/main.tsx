import { createRoot } from 'react-dom/client';
import App, { Preview } from './App.js';
import './styles.css';
import { installSmoothScroll } from './smoothScroll.js';
const preview = new URLSearchParams(location.search).get('preview') === '1';
if (preview) document.body.classList.add('preview-body');
createRoot(document.getElementById('root')!).render(
  preview ? <Preview /> : <App />,
);
// L'aperçu en iframe garde le défilement du navigateur : il montre un
// scénario à l'échelle réelle, l'inertie de l'atelier n'y a rien à faire.
if (!preview) installSmoothScroll();
