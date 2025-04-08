import 'smoothscroll-anchor-polyfill';
import { App } from 'components';
import { createRoot } from 'react-dom/client';
import { polyfill } from 'smoothscroll-polyfill';
import 'normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';

import './JetBrains-Mono.css';
import './index.scss';

polyfill();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);

