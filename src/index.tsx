import 'smoothscroll-anchor-polyfill';
import { App } from 'components';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { createRoot } from 'react-dom/client';
import 'normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import { polyfill } from 'smoothscroll-polyfill';

import './JetBrains-Mono.css';
import './index.css';
import './index.scss';

polyfill();

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
);
