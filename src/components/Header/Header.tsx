import React, { FC } from 'react';
import { motion } from 'framer-motion';

import { DevKittyLogo } from 'assets/svg';

import css from './Header.module.scss';

const MotionSpan = motion.span;

export const Header: FC = () => (
  <div className={css.root}>
    <div className={css.wrap}>
      <DevKittyLogo className={css.logo}/>

      <div className={css.logoText}>
        devkit
        <MotionSpan
          transition={{
            loop: Infinity,
            duration: 2,
            ease: 'linear',
          }}
          initial={{
            opacity: .5,
            y: '10px',
          }}
          animate={{
            opacity: [.5, 0, .5],
          }}
        >ty</MotionSpan>
      </div>
      <nav className={css.menu}>
        <ul>
          <li><a href='/#'>Home</a></li>
          <li><a href='#features'>Features</a></li>
          <li>
            <a href='#downloads'
               className={css.blue}
            >Download</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
);