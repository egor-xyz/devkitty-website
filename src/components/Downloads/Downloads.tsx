import React from 'react';
import css from './Downloads.module.scss';
import { AnchorButton, Icon } from '@blueprintjs/core';
import { DevKittyLogo } from 'assets/svg';

import { version } from 'version';

interface State {
  loading: boolean;
  version?: string,
  macURL?: string,
  winURL?: string,
}

export const Downloads = () => {
  const macURL = `https://github.com/egor-xyz/devkitty-app/releases/download/${version}/Devkitty.setup.${version.replace('v', '')}.dmg`;
  return (<div className={css.root}>
    <div className={css.wrap}>
      <DevKittyLogo className={css.logo} />
      <div className={css.title}>devkitty</div>
      <div className={css.version}>
        <Icon icon={'confirm'}/>
        <span>{version ?? 'Loading...'}</span>
      </div>
      <div className={css.actions}>
        <div className={css.system}>
          <AnchorButton
            href={macURL}
            className={css.btn}
            icon={'download'}
            large={true}
            text={'Download (macOS)'}
          >
          </AnchorButton>
        </div>
      </div>
    </div>
  </div>);
}