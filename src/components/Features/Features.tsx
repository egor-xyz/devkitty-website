import React, { FC } from 'react';
import { gbmFeatures } from 'utils';
import { Icon } from '@blueprintjs/core';
import { motion, useTransform, useViewportScroll } from 'framer-motion';

import css from './Features.module.scss';
import { DevKittyLogo } from 'assets/svg';

const MotionDiv = motion.div;
const MotionImg = motion.img;

export const Features: FC = () => {
  const {scrollYProgress} = useViewportScroll()
  const imageTiming = [0, .2];
  const width = useTransform(scrollYProgress, imageTiming, ['100vw', '50vw'])
  const scale = useTransform(scrollYProgress, imageTiming, [1, .7])
  const opacity = useTransform(scrollYProgress, [.18, .31], [0, 1])

  let style = {};
  let style2 = {};
  if (window.innerWidth >= 800) {
    style = {
      width: width,
      scale,
    }
    style2 = {
      opacity,
    }
  }

  return (<div className={css.root}>
    <MotionDiv
      className={css.image}
      style={style}
    >
      <MotionImg
        srcSet="/images/gbm-main.png 4x"
        alt="app screenshot"
        animate={{
          scale: [0, 1]
        }}
      />
    </MotionDiv>

    <div className={css.imagePadding}/>

    <MotionDiv
      style={style2}
      id='features'
      className={css.block}
    >
      <div className={css.title}>
        <DevKittyLogo className={css.logo} />
        <div className={css.titleName}>
          <span>devkit</span>
          <div className={css.flip}>
            <div>&nbsp;:&nbsp;GitHub</div>
            <div>&nbsp;:&nbsp;Jenkins</div>
            <div>&nbsp;:&nbsp;Git</div>
            <div>ty</div>
            <div>&nbsp</div>
          </div>
        </div>
      </div>

      <div className={css.titleDesc}>
        Swiss army knife for developers
      </div>

      <div className={css.modules}>
        Git (GitHub, GitLab, Bitbucket...)
        <span>|</span>
        GitHub Gist
        <span>|</span>
        Jenkins
        <span>|</span>
        Google Translate API
      </div>

      {gbmFeatures.map(({icon, title, transition = {}, animate = {}, initial = {}}, index) => (
        <div
          key={index}
          className={css.featureItem}
        >
          <MotionDiv
            className={css.iconWrap}
            transition={transition}
            initial={initial as any}
            animate={animate}
          >
            <Icon
              className={css.icon}
              iconSize={28}
              icon={icon}
            />
          </MotionDiv>
          <span className={css.featureText}>{title}</span>
        </div>
      ))}
    </MotionDiv>
  </div>);
}
