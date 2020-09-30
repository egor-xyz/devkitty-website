import React, { Component } from 'react';
import { ReactComponent as Apple } from 'assets/svg/apple.svg';
import { ReactComponent as Windows } from 'assets/svg/windows.svg';

import css from './Downloads.module.scss';
import { AnchorButton, Icon } from '@blueprintjs/core';
import { getAppVersions } from 'utils';

interface State {
  loading: boolean;
  version?: string,
  macURL?: string,
  winURL?: string,
}

export class Downloads extends Component<{}, State> {
  state: State = {
    loading: true
  };

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const res = await getAppVersions();
    if (!res) return;
    this.setState({
      ...res,
      loading: false,
    });
  }

  render() {
    const {loading, macURL, winURL, version} = this.state;
    return (
      <div className={css.root}>
        <div className={css.wrap}>
          <div className={css.title}>devkitty</div>
          <div className={css.version}>
            <Icon icon={'confirm'}/>
            <span>{version ?? 'Loading...'}</span>
          </div>
          <div className={css.actions}>
            <div className={css.system}>
              <Apple
                height={50}
                fill={'#fff'}
              />
              <AnchorButton
                href={macURL}
                loading={loading}
                className={css.btn}
                icon={'download'}
                large={true}
                text={'devkitty for MacOS'}
              >
              </AnchorButton>
            </div>
            <div className={css.system}>
              <Windows
                height={50}
                fill={'#fff'}
              />
              <AnchorButton
                href={winURL}
                loading={loading}
                className={css.btn}
                large={true}
                icon={'download'}
                text={'devkitty for Windows 10'}
              />
            </div>
          </div>
        </div>
      </div>);
  }
}