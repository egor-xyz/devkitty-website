import { Icon } from '@blueprintjs/core';
import { Title } from 'components/Title';
import { motion, useScroll, useTransform } from 'framer-motion';
import { features } from 'utils';

import css from './Features.module.scss';

const MotionDiv = motion.div;
const MotionImg = motion.img;

export const Features = () => {
  const { scrollYProgress } = useScroll();
  const imageTiming = [0, 0.2];
  const width = useTransform(scrollYProgress, imageTiming, ['100vw', '50vw']);
  const scale = useTransform(scrollYProgress, imageTiming, [1, 0.7]);
  const opacity = useTransform(scrollYProgress, [0.18, 0.31], [0, 1]);

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

  return (
    <div className={css.root}>
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
        <div className={css.titleDesc}>Your Daily GitHub Desktop Assistant</div>
        <div className={css.modules}>Your favorite tools in one place</div>

        {features.map(({ animate = {}, icon, initial = {}, title, transition = {} }, index) => (
          <div
            className={css.featureItem}
            key={index}
          >
            <MotionDiv
              animate={animate}
              className={css.iconWrap}
              initial={initial as unknown as string}
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
    </div>
  );
};
