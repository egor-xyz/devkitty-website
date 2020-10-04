import React, { FC } from 'react';

import css from './Header.module.scss';
import { DevKittyLogo } from 'assets/svg';

export const Header: FC = () => (
  <div className={css.root}>
    <div className={css.wrap}>
      <DevKittyLogo className={css.logo}/>

      <div className={css.logoText}>devkitty.app</div>
      <nav className={css.menu}>
        <ul>
          <li><a href='/#'>Home</a></li>
          <li><a href='#features'>Features</a></li>
          <li><a href='#downloads'>Download</a></li>
        </ul>
      </nav>
    </div>
  </div>
);