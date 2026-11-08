import '@fontsource-variable/baloo-2';
import '@fontsource/chewy';
import '@fontsource-variable/geist-mono';
import '@fontsource/gochi-hand';
import '@fontsource/lilita-one';
import { App } from 'components';
import { createRoot } from 'react-dom/client';

import { openExternalLinksInNewTab } from '../lib/externalLinks';
import { markDownloadSupport } from '../lib/platform';
import '../index.css';

openExternalLinksInNewTab();
markDownloadSupport();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
