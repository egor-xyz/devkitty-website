import React, { FC } from 'react';
import { gbmFeatures } from 'utils';
import { Icon } from '@blueprintjs/core';
import { motion, useTransform, useViewportScroll } from 'framer-motion';

import css from './Features.module.scss';

const MotionDiv = motion.div;

export const Features: FC = () => {
  const {scrollYProgress} = useViewportScroll()

  const imageTiming = [0, .2];

  const width = useTransform(scrollYProgress, imageTiming, ['100vw', '50vw'])

  const scale = useTransform(scrollYProgress, [.21, .4], [1, .7])

  const opacity = useTransform(scrollYProgress, [.2, .27], [0, 1])

  return (<div className={css.root}>
    <MotionDiv
      className={css.image}
      style={{
        width: width,
        scale,
      }}
    >
      <img
        src="/images/gbm-main-shadow.png"
        alt="app screenshot"
      />
    </MotionDiv>

    <div className={css.imagePadding}/>

    <MotionDiv
      initial={{
        opacity: 0,
        y: -20,
      }}
      style={{
        opacity,
      }}
      id='features'
      className={css.block}
    >
      <div className={css.title}>Git Branch Manager</div>
      <div className={css.titleDesc}>Manage your projects with ease</div>

      {gbmFeatures.map(({icon, title}, index) => (
        <div
          key={index}
          className={css.text}
        >
          <Icon
            className={css.icon}
            iconSize={30}
            icon={icon}
          />
          <span>{title}</span>
        </div>
      ))}
    </MotionDiv>
  </div>);
}
