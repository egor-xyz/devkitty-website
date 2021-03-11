import React, { FC } from 'react';
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
      <DevKittyLogo className={css.logo}/>

      <a
        href='/#'
        className={css.logoText}>
        devkit
        <MotionSpan
          transition={{
            loop: Infinity,
            duration: 7,
            ease: 'linear',
          }}
          initial={{
            opacity: .5,
            y: '10px',
          }}
          animate={{
            // •••• •• −−••−− => HI!
            opacity: [
              ...dot, ...dot, ...dot, ...dot,
              ...pause,
              ...dot, ...dot,
              ...pause,
              ...dashe, ...dashe, ...dot, ...dot, ...dashe, ...dashe,
              ...pause, ...pause, ...pause, ...pause,
            ],
          }}
        >ty</MotionSpan>
      </a>
      <nav className={css.menu}>
        <ul>
          <li><a href='/#'>Home</a></li>
          <li><a href='#features'>Features</a></li>
          <li>
            <a href='#downloads'
               className={css.blue}
            >Download ({version})</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
);