import { type FC, useLayoutEffect, useRef } from 'react';

import { useLatestRelease } from '../../lib/latestRelease';
import { mountHero } from './heroController';
import './hero.css';

export const Hero: FC = () => {
  const rootRef = useRef<HTMLElement>(null);
  const { build, version, zipUrl } = useLatestRelease();

  // Layout effect: the saved mode is applied before the first paint, so there is no grey flash.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    return mountHero(root);
  }, []);

  return (
    <section
      className='hero'
      id='hero'
      ref={rootRef}
    >
      <div className='hero-wrap'>
        <div className='hero-text'>
          <div className='h1box'>
            <p className='eyebrow'>
              NATIVE FOR macOS · <span>{`v${version} (build ${build})`}</span> ·{' '}
              <span data-h='when'>YOUR TIME</span>
            </p>

            <h1>
              <span className='swap'>
                <span className='before'>
                  <span className='ln'>
                    Another grey <span data-h='phw'>evening</span>
                  </span>{' '}
                  <span className='ln'>in the terminal.</span>
                </span>

                <span
                  aria-hidden='true'
                  className='after'
                >
                  <span className='ln'>
                    Enjoy every <span data-h='pha'>evening</span>
                  </span>{' '}
                  <span className='ln'>in Devkitty.</span>
                </span>
              </span>
            </h1>
          </div>

          <div className='side'>
            <p>
              Devkitty puts your Git worktrees, pull requests, terminals and coding agents in one native Mac window.
            </p>

            <div className='ctas'>
              <a
                className='btn primary'
                href={zipUrl}
              >
                Download for Mac
              </a>

              <button
                aria-label='Switch to Devkitty'
                aria-pressed='false'
                className='btn toggle'
                data-h='toggle'
                type='button'
              >
                <span className='ico'>
                  <img
                    alt=''
                    src={`${import.meta.env.BASE_URL}hero/logo.png`}
                  />

                  <svg
                    aria-hidden='true'
                    className='term'
                    viewBox='0 0 44 44'
                  >
                    <rect
                      fill='#1C1C1E'
                      height='36'
                      rx='8.5'
                      stroke='#8E8E93'
                      strokeWidth='1.2'
                      width='36'
                      x='4'
                      y='4'
                    />

                    <path
                      d='M4 12.5 a8.5 8.5 0 0 1 8.5 -8.5 h19 a8.5 8.5 0 0 1 8.5 8.5 v1 h-36Z'
                      fill='#3A3A3C'
                    />

                    <path
                      d='M11 21 l6 4.5 l-6 4.5'
                      fill='none'
                      stroke='#F2F2F7'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2.6'
                    />

                    <path
                      d='M20 31 h10'
                      stroke='#F2F2F7'
                      strokeLinecap='round'
                      strokeWidth='2.6'
                    />
                  </svg>
                </span>

                <span className='lbl'>
                  <span className='l-off'>Switch to Devkitty</span>
                  <span className='l-on'>Switch to Terminal</span>
                </span>
              </button>
            </div>

            <div
              aria-hidden='true'
              className='trynote'
            >
              <svg viewBox='0 0 46 30'>
                <path
                  d='M42 26 C 30 26, 14 22, 8 6 M8 6 l-3 10 M8 6 l9 5'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeWidth='2.5'
                />
              </svg>
              press it. see what happens
            </div>
          </div>
        </div>

        <div
          aria-label='Cartoon of a developer at a desk. Before: a grey room and a plain terminal. After Devkitty opens: the room fills with sunset colors.'
          className='stage'
          data-hero-stage=''
          role='img'
        >
          <div
            className='fallback-sky'
            data-h='fallback'
            hidden
          />

          <canvas data-h='sky' />

          <div
            className='layer L-before'
            data-h='lb'
          />

          <div
            className='layer L-after'
            data-h='la'
          />

          <div
            className='nightshade'
            data-h='night'
          />

          <canvas
            className='ring'
            data-h='ring'
          />

        </div>

        <div className='legend'>
          <span
            className='hint'
            data-h='hint'
          >
            <span className='sr-only'
              data-h='hint-sr'
              hidden
            >Tip: click anything in the room and see what happens. Your keyboard works too.</span>

            <span aria-hidden='true'
              className='hint-ghost'
            >Tip: click anything in the room and see what happens. Your keyboard works too.</span>

            <span aria-hidden='true'
              className='hint-live'
              data-h='hint-live'
            />
          </span>

        </div>
      </div>

      {/* Outside the stage on purpose: it is position: fixed and the stage may be transformed. */}
      <button
        aria-label='Sound off'
        aria-pressed='false'
        className='soundbtn'
        data-h='sound'
        type='button'
      >
        <svg
          aria-hidden='true'
          fill='none'
          height='30'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2.2'
          viewBox='0 0 24 24'
          width='30'
        >
          <path
            d='M4 9.5h3.5L12 5.5v13l-4.5-4H4z'
            fill='currentColor'
          />

          <g className='on'>
            <path d='M15.5 9a4 4 0 0 1 0 6' />
            <path d='M18.2 6.5a7.5 7.5 0 0 1 0 11' />
          </g>

          <g className='off'>
            <path d='M16 9.5l5 5M21 9.5l-5 5' />
          </g>
        </svg>
      </button>
    </section>
  );
};
