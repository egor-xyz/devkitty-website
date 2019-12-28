import { Downloads, Features, Header } from 'components';

import css from './App.module.scss';

export const App = () => (<div className={css.root}>
  <Header />
  <Features />
  <button
    className={css.anchor}
    id='downloads'
  />
  <Downloads />
</div>);
