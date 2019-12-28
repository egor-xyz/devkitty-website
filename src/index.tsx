import ReactDOM from 'react-dom';
import { polyfill } from 'smoothscroll-polyfill';
import 'smoothscroll-anchor-polyfill';

import { App } from 'components';

import * as serviceWorker from './serviceWorker';

import 'normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import './JetBrains-Mono.css';
import './index.scss';

polyfill();

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.register();
