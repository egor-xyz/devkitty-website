import React from 'react';
import { ReactComponent as Apple } from 'assets/svg/apple.svg';
import { ReactComponent as Windows } from 'assets/svg/windows.svg';

import css from './Downloads.module.scss';
import { AnchorButton, Icon } from '@blueprintjs/core';

interface State {
  loading: boolean;
  version?: string,
  macURL?: string,
  winURL?: string,
}

const version = process.env.REACT_APP_VERSION;
const macURL = `https://github.com/egor-xyz/devkitty-app/releases/download/v${version}/Devkitty.setup.${version}.dmg`;
const winURL = `https://github.com/egor-xyz/devkitty-app/releases/download/v${version}/Devkitty-Setup-${version}.exe`;

export const Downloads = () => {
  if (!version) return null;
  return (<div className={css.root}>
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