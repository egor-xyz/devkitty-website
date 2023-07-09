import { FC } from 'react';

import { DevKittyLogo } from 'assets/svg';

import css from './Title.module.scss';

export const Title: FC = () => (
  <div className={css.title}>
    <DevKittyLogo className={css.logo} />
    <div className={css.titleName}>
      <span>devkit</span>
      <div className={css.flip}>
        <div>:Git</div>
        <div>ty</div>
        <div>:Github</div>
        <div>ty</div>
        <div>&nbsp</div>
      </div>
    </div>
  </div>
);