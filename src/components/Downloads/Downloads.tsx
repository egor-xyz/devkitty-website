import React from 'react';
import { AnchorButton, Icon } from '@blueprintjs/core';

import { DevKittyLogo } from 'assets/svg';
import { version } from 'version';

import css from './Downloads.module.scss';

export const Downloads = () => {
  const macURLIntel = `https://github.com/egor-xyz/devkitty/releases/download/${version}/Devkitty-darwin-arm64-${version.replace('v', '')}.zip`;
  const macURLApple = `https://github.com/egor-xyz/devkitty/releases/download/${version}/Devkitty-darwin-x64-${version.replace('v', '')}.zip`;

  return (<div className={css.root}>
    <div className={css.wrap}>
      <img
        alt='devkitty'
        className={css.image}
        src='/images/GitHub-App-Demo.png'
      />
      <DevKittyLogo className={css.logo} />
      <div className={css.title}>devkitty</div>
      <div className={css.version}>
        <Icon icon={'confirm'} />
        <span>{version ?? 'Loading...'}</span>
      </div>
      <div className={css.actions}>
        <div className={css.system}>
          <AnchorButton
            className={css.btn}
            href={macURLIntel}
            icon={'download'}
            large={true}
            text={'Download (Intel)'}
          />

          <AnchorButton
            className={css.btn}
            href={macURLApple}
            icon={'download'}
            large={true}
            text={'Download (Apple Silicon)'}
          />
        </div>
      </div>
    </div>
  </div>);
};