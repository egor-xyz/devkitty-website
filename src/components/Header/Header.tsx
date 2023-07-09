import { FC } from 'react';
import { motion } from 'framer-motion';

import { DevKittyLogo } from 'assets/svg';
import { version } from 'version';

import css from './Header.module.scss';

const MotionSpan = motion.span;

const dot = [.5, 0];
const dashe = [.5, .5, .5, 0];
const pause = [0, 0];

export const Header: FC = () => (
  <div className={css.root}>
    <div className={css.wrap}>
      <DevKittyLogo className={css.logo} />

      <a
        className={css.logoText}
        href='/#'
      >
        devkit
        <MotionSpan
          animate={{
            // •••• •• −−••−− => HI!
            opacity: [
              ...dot, ...dot, ...dot, ...dot,
              ...pause,
              ...dot, ...dot,
              ...pause,
              ...dashe, ...dashe, ...dot, ...dot, ...dashe, ...dashe,
              ...pause, ...pause, ...pause, ...pause
            ]
          }}
          initial={{
            opacity: .5,
            y: '10px'
          }}
          transition={{
            duration: 7,
            ease: 'linear',
            repeat: Infinity
          }}
        >ty</MotionSpan>
      </a>
      <nav className={css.menu}>
        <ul>
          <li><a href='/#'>Home</a></li> { /* eslint-disable-line */}
          <li><a href='#features'>Features</a></li> { /* eslint-disable-line */}
          <li>
            { /* eslint-disable-next-line */}
            <a
              className={css.blue}
              href='#downloads'
            >Download ({version})</a>
          </li>
        </ul>
      </nav>

      <div className={css.github}>
        <a
          aria-label='Star egor-xyz/devkitty on GitHub'
          className='github-button'
          data-icon='octicon-star'
          data-show-count='true'
          data-size='large'
          href='https://github.com/egor-xyz/devkitty'
        >Star</a>
      </div>
    </div>
  </div>
);