import { type FC } from 'react';

import { type ThemeChoice, useThemeChoice } from '../../lib/theme';

const CHOICES: { label: string; value: ThemeChoice }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' }
];

export const ThemeSwitch: FC = () => {
  const [choice, setChoice] = useThemeChoice();

  return (
    <div
      aria-label='Appearance'
      className='theme-switch'
      role='group'
    >
      {CHOICES.map(({ label, value }) => (
        <button
          aria-pressed={choice === value}
          key={value}
          onClick={() => setChoice(value)}
          type='button'
        >
          {label}
        </button>
      ))}
    </div>
  );
};
