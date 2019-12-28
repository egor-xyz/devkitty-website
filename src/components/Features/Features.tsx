import React, { FC } from 'react';
import { gbmFeatures } from 'utils';
import { Icon } from '@blueprintjs/core';
import { motion, useTransform, useViewportScroll } from 'framer-motion';

import css from './Features.module.scss';

const MotionImg = motion.img;
const MotionDiv = motion.div;

export const Features: FC = () => {
  const {scrollYProgress} = useViewportScroll()
  const xPosAnim = useTransform(scrollYProgress, [0, .2], ['-50%', '-100%'])
  const scale = useTransform(scrollYProgress, [0, .2], [1, .6])
  const opacity = useTransform(scrollYProgress, [.2, .27], [0, 1])
  return (<div className={css.root}>
    <MotionImg
      initial={{
        y: '-50%',
        x: '-50%',
      }}
      className={css.image}
      style={{
        x: xPosAnim,
        scale
      }}
      src="/images/gbm-main-shadow.png"
      alt="app screenshot"
    />

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
      <div className={css.titleDesc}>One screen git tool for multiple projects</div>

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