import React, { FC } from 'react';
import { ReactComponent as Logo } from 'assets/svg/logo.svg';

import css from './Header.module.scss';

export const Header: FC = () => (
  <div className={css.root}>
    <div className={css.wrap}>
      <Logo className={css.logo}/>
      <div className={css.logoText}>Git Branch Manager</div>
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