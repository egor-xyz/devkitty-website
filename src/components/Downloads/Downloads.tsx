import { AnchorButton, Icon } from '@blueprintjs/core';

import { DevkittyLogo } from 'assets/svg';
import { useVersion } from 'store/useVersions';

import css from './Downloads.module.scss';

export const Downloads = () => {
  const { version, download } = useVersion();

  return (
    <div className={css.root}>
      <div className={css.wrap}>
        <img
          alt="devkitty"
          className={css.image}
          src="/images/GitHub-App-Demo.png"
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
              href={download.intel()}
              icon={'download'}
              large={true}
              text={'Download (Intel)'}
            />

            <AnchorButton
              className={css.btn}
              href={download.apple()}
              icon={'download'}
              large={true}
              text={'Download (Apple Silicon)'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
