import { type FC } from 'react';

import { type Extension, EXTENSION_GROUPS } from '../../lib/extensions';
import { ExtensionRow } from './ExtensionRow';

/** Rows grouped like the app's Extensions settings (group order is fixed, registry order inside a group). */
export const ExtensionGroups: FC<{ extensions: Extension[] }> = ({ extensions }) => (
  <div className='flex flex-col gap-8'>
    {EXTENSION_GROUPS.map((group) => {
      const rows = extensions.filter((e) => e.group === group);
      if (rows.length === 0) return null;

      return (
        <section
          aria-label={group}
          key={group}
        >
          <h3 className='text-eyebrow mb-1 px-2 text-ink-mute sm:px-3'>{group}</h3>

          <div className='border-t border-line'>
            {rows.map((e) => (
              <ExtensionRow
                extension={e}
                key={e.id}
              />
            ))}
          </div>
        </section>
      );
    })}
  </div>
);
