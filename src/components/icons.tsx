import { type FC, type SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.8,
  viewBox: '0 0 24 24'
};

export const Apple: FC<P> = (p) => (
  <svg
    fill='currentColor'
    viewBox='0 0 24 24'
    {...p}
  >
    <path d='M16.365 1.43c0 1.14-.42 2.2-1.13 3-.77.87-2.03 1.54-3.06 1.46-.13-1.1.44-2.28 1.1-3.02.75-.85 2.06-1.48 3.09-1.44zM20.9 17.1c-.55 1.27-.82 1.83-1.53 2.95-.99 1.57-2.38 3.53-4.11 3.54-1.53.02-1.93-.99-4.01-.98-2.08.01-2.52.99-4.06.97-1.72-.02-3.04-1.78-4.03-3.35-2.77-4.4-3.06-9.56-1.35-12.3 1.21-1.96 3.12-3.1 4.92-3.1 1.83 0 2.98 1 4.5 1 1.47 0 2.36-1 4.48-1 1.6 0 3.3.87 4.51 2.38-3.96 2.17-3.32 7.83.68 9.9z' />
  </svg>
);

export const GitHub: FC<P> = (p) => (
  <svg
    fill='currentColor'
    viewBox='0 0 24 24'
    {...p}
  >
    <path d='M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58l-.01-2.05c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.22.7.83.58A12 12 0 0024 12.5C24 5.87 18.63.5 12 .5z' />
  </svg>
);

export const Workflow: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <rect
      height='7'
      rx='1.5'
      width='7'
      x='3'
      y='3'
    />

    <rect
      height='7'
      rx='1.5'
      width='7'
      x='14'
      y='14'
    />

    <path d='M10 6.5h4a3 3 0 0 1 3 3V14' />
  </svg>
);

export const Branch: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <circle
      cx='6'
      cy='5'
      r='2.5'
    />

    <circle
      cx='6'
      cy='19'
      r='2.5'
    />

    <circle
      cx='18'
      cy='7'
      r='2.5'
    />

    <path d='M6 7.5v9M18 9.5c0 4-4 3.5-6 5.5' />
  </svg>
);

export const Pull: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <circle
      cx='6'
      cy='6'
      r='2.5'
    />

    <circle
      cx='6'
      cy='18'
      r='2.5'
    />

    <circle
      cx='18'
      cy='18'
      r='2.5'
    />

    <path d='M6 8.5v7M18 15.5V11a3 3 0 0 0-3-3h-3l2.5-2.5M12 8l2.5 2.5' />
  </svg>
);

export const Gauge: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <path d='M12 14a9 9 0 1 0-9-9'
      transform='rotate(135 12 12)'
    />

    <path d='M12 13l4-3' />

    <circle
      cx='12'
      cy='13'
      fill='currentColor'
      r='1.4'
      stroke='none'
    />
  </svg>
);

export const Repos: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <rect
      height='16'
      rx='2'
      width='13'
      x='3'
      y='4'
    />

    <path d='M8 4v16M19 7v13a1 1 0 0 1-1 1h-2' />
  </svg>
);

export const Terminal: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <rect
      height='16'
      rx='2'
      width='18'
      x='3'
      y='4'
    />

    <path d='M7 9l3 3-3 3M13 15h4' />
  </svg>
);

export const Code: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <path d='M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12' />
  </svg>
);

export const Reset: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <path d='M3 12a9 9 0 1 0 3-6.7M3 4v4h4' />
  </svg>
);

export const Sparkle: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <path d='M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z' />
  </svg>
);

export const Layers: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <path d='M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5' />
  </svg>
);

export const Check: FC<P> = (p) => (
  <svg
    {...base}
    {...p}
  >
    <path d='M20 6L9 17l-5-5' />
  </svg>
);
