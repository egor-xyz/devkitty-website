import { App } from 'components';
import { createRoot } from 'react-dom/client';

import './index.css';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
