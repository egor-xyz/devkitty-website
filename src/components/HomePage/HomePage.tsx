import React, { Component } from 'react';
import { AnchorButton, Card } from '@blueprintjs/core';
import classNames from 'classnames';
import Snowfall from 'react-snowfall'
import axios from 'axios';
import find from 'lodash/find';

import { ReactComponent as Logo } from 'svg/logo.svg';

import styles from './HomePage.module.scss';

interface State {
  version?: string;
  downloadLink?: string;
}

export default class HomePage extends Component<{}, State> {
  state: State = {};

  componentDidMount(): void {
    this.getVersion();
  }

  getVersion = async () => {
    const res = await axios.get('https://api.github.com/repos/egor-xyz/gbm-site/releases/latest');
    const file = find(res.data.assets, (file) => file.browser_download_url.includes('.dmg'));
    if (!file) return;
    this.setState({
      version: res.data.name,
      downloadLink: file.browser_download_url
    });
  };

  render () {
    const { version, downloadLink } = this.state;
    return (
      <div className={classNames(styles.root, 'bp3-dark')}>
        <Snowfall />
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
            <AnchorButton
              large={true}
              intent={'primary'}
              icon={'download'}
              disabled={!version}
              text={`Download Git Branch Manager (${version})`}
              href={downloadLink}
              target='_blank'
            />
            <div className={styles.btnDesc}>For Mac OS X 10.10 or later.</div>
          </div>
        </ Card>
      </div>
    )
  }
};