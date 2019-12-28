import React, { FC } from 'react';
import { Card } from '@blueprintjs/core';
import classNames from 'classnames';

import { ReactComponent as Logo } from 'svg/logo.svg';

import styles from './HomePage.module.scss';

export const HomePage: FC = () => (
  <div className={classNames(styles.root, 'bp3-dark')}>
    <Card
      className={classNames(styles.card, 'bp3-popover-wrapper', 'bp3-text-large')}
      elevation={4}
      interactive={true}
    >
      <Logo className={styles.logo} />
      <h1 className={styles.title}>Git Branch Manager</h1>
      <img
        className={styles.image}
        src="/images/GBM_preview.png"
        alt="preview"
      />
      <div className={styles.text}>
        Coming soon
      </div>
    </ Card>
  </div>
);