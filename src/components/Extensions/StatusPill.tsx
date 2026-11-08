import { type FC } from 'react';

import { type ExtensionStatus } from '../../lib/extensions';

const STYLE: Record<ExtensionStatus, null | { className: string; label: string }> = {
  beta: { className: 'border-accent text-accent', label: 'Beta' },
  'coming-soon': { className: 'border-line text-ink-mute', label: 'Coming soon' },
  new: { className: 'border-ember/50 bg-ember/15 text-coral', label: 'New' },
  stable: null
};

/** `new` ember, `beta` accent outline, `coming-soon` muted; `stable` shows nothing. */
export const StatusPill: FC<{ status: ExtensionStatus }> = ({ status }) => {
  const style = STYLE[status];
  if (!style) return null;

  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-px font-mono text-[11px] leading-4 tracking-wide uppercase ${style.className}`}>
      {style.label}
    </span>
  );
};
