import { Icon } from '@blueprintjs/core';
import { motion, useScroll, useTransform } from 'framer-motion';
import React from 'react';

import { Title } from 'components/Title';
import { features } from 'utils';

import css from './Features.module.scss';

const MotionDiv = motion.div;
const MotionImg = motion.img;

export const Features: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const imageTiming = [0, .2];
  const width = useTransform(scrollYProgress, imageTiming, ['100vw', '50vw']);
  const scale = useTransform(scrollYProgress, imageTiming, [1, .7]);
  const opacity = useTransform(scrollYProgress, [.18, .31], [0, 1]);

  let style = {};
  let style2 = {};
  if (window.innerWidth >= 800) {
    style = {
      scale,
      width
    };
    style2 = {
      opacity
    };
  }

  return (<div className={css.root}>
    <MotionDiv
      className={css.image}
      style={style}
    >
      <MotionImg
        alt='app screenshot'
        animate={{
          scale: [0, 1]
        }}
        srcSet='/images/devkitty-main.png 4x'
      />
    </MotionDiv>

    <div className={css.imagePadding} />

    <MotionDiv
      className={css.block}
      id='features'
      style={style2}
    >
      <Title />
      <div className={css.titleDesc}>
        Swiss army knife for developers
      </div>

      <div className={css.modules}>
        Your favorite tools in one place
      </div>

      {features.map(({ icon, title, transition = {}, animate = {}, initial = {} }, index) => (
        <div
          className={css.featureItem}
          key={index}
        >
          {/* infinity animation */}
          <MotionDiv
            animate={animate}
            className={css.iconWrap}
            initial={initial as any}
            transition={transition}
          >
            <Icon
              className={css.icon}
              icon={icon}
              iconSize={28}
            />
          </MotionDiv>
          <span className={css.featureText}>{title}</span>
        </div>
      ))}
    </MotionDiv>
  </div>);
};
