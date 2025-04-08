 
import type { FC } from 'react';

import DevkittyLogo from 'assets/svg/devKitty.svg?react';
import { motion } from 'framer-motion';
import GitHubButton from 'react-github-btn';
import { useVersion } from 'store/useVersions';

import css from './Header.module.scss';

const MotionSpan = motion.span;

const dot = [0.5, 0];
const dashe = [0.5, 0.5, 0.5, 0];
const pause = [0, 0];

export const Header: FC = () => {
  const { version } = useVersion();

  return (
    <div className={css.root}>
      <div className={css.wrap}>
        <DevkittyLogo className={css.logo} />

        <a
          className={css.logoText}
          href='/#'
        >
          devkit
          <MotionSpan
            // prettier-ignore
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
              opacity: 0.5,
              y: '10px'
            }}
            transition={{
              duration: 7,
              ease: 'linear',
              repeat: Infinity
            }}
          >
            ty
          </MotionSpan>
        </a>

        <nav className={css.menu}>
          <ul>
            <li>
              <a href='/#'>Home</a>
            </li>{' '}

            <li>
              <a href='#features'>Features</a>
            </li>{' '}

            <li>
              <a
                className={css.blue}
                href='#downloads'
              >
                Download ({version})
              </a>
            </li>
          </ul>
        </nav>

        <div className={css.github}>
          <GitHubButton
            aria-label='Star egor-xyz/devkitty on GitHub'
            data-icon='octicon-star'
            data-show-count='true'
            data-size='large'
            href='https://github.com/egor-xyz/devkitty'
          >
            Star
          </GitHubButton>
        </div>
      </div>
    </div>
  );
};
