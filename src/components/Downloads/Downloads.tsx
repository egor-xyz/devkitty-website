import { AnchorButton, Icon } from '@blueprintjs/core';
import DevkittyLogo from 'assets/svg/devKitty.svg?react';
import { useVersion } from 'store/useVersions';

import css from './Downloads.module.scss';

export const Downloads = () => {
  const { download, version } = useVersion();

  return (
    <div className={css.root}>
      <div className={css.wrap}>
        <img
          alt='devkitty'
          className={css.image}
          src='/images/GitHub-App-Demo.png'
        />

        <DevkittyLogo className={css.logo} />
        <div className={css.title}>devkitty</div>

        <div className={css.version}>
          <Icon icon={'confirm'} />
          <span>{version}</span>
        </div>

        <div className={css.actions}>
          <div className={css.system}>
            <AnchorButton
              className={css.btn}
              href={download.apple()}
              icon={'download'}
              large
              text={'Download (Apple)'}
            />

            <AnchorButton
              className={css.btn}
              href={download.intel()}
              icon={'download'}
              large
              text={'Download (Intel)'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
