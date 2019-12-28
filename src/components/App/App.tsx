import React from 'react';
import { Downloads, Features, Header } from 'components';

import css from './App.module.scss';

const App = () => {
  return (<>
    <Header/>
    <Features/>
    <button className={css.anchor} id='downloads'/>
    <Downloads/>
  </>)
};
export default App;