import { type FC } from 'react';

import { type Extension, type ExtensionShot, getExtension, getExtensions } from '../../lib/extensions';
import { useLatestRelease } from '../../lib/latestRelease';
import { ExtensionIcon } from './ExtensionIcon';
import { StatusPill } from './StatusPill';

const Figure: FC<{ shot: ExtensionShot }> = ({ shot }) => (
  <figure className={`my-6 overflow-hidden rounded-xl border border-line ${shot.theme === 'dark' ? 'bg-[#140c11]' : 'bg-bg-raised'}`}>
    <img
      alt={shot.alt}
      className='block h-auto w-full'
      decoding='async'
      height={shot.height}
      loading='lazy'
      src={shot.src}
      width={shot.width}
    />
  </figure>
);

const Facts: FC<{ extension: Extension }> = ({ extension }) => (
  <ul className='mt-6 flex list-none flex-col gap-1 p-0 font-mono text-[0.8125rem] text-ink-mute'>
    <li>{extension.status === 'coming-soon' ? 'Coming soon' : extension.minBuild ? `Requires build ${extension.minBuild} or later` : 'Included in the current release'}</li>
    {!extension.defaultOn && <li>Off by default · turn on in {extension.settingsPath ?? 'Settings › Extensions'}</li>}
  </ul>
);

/** `/extensions/<id>/`: the full page for one registry entry. */
export const ExtensionPage: FC<{ id: string }> = ({ id }) => {
  const { zipUrl } = useLatestRelease();
  const extension = getExtension(id);

  if (!extension) {
    return (
      <main className='mx-auto w-full max-w-[820px] px-4 py-24'>
        <h1 className='text-h2 text-ink'>Extension not found</h1>

        <a
          className='text-accent underline underline-offset-4'
          href='/extensions/'
        >
          All extensions
        </a>
      </main>
    );
  }

  const all = getExtensions();
  const at = all.findIndex((e) => e.id === id);
  const prev = at > 0 ? all[at - 1] : undefined;
  const next = at < all.length - 1 ? all[at + 1] : undefined;
  const { screenshots, sections } = extension;
  const leadShown = screenshots.length > 0 && !sections.some((s) => s.shot === 0);
  const lead = leadShown ? screenshots[0] : undefined;

  return (
    <main className='mx-auto w-full max-w-[820px] px-4 py-12 sm:py-20'>
      <nav
        aria-label='Breadcrumb'
        className='mb-8 font-mono text-xs text-ink-mute'
      >
        <a
          className='inline-flex min-h-11 items-center hover:text-ink sm:min-h-0'
          href='/'
        >
          Devkitty
        </a>

        {' / '}

        <a
          className='inline-flex min-h-11 items-center hover:text-ink sm:min-h-0'
          href='/extensions/'
        >
          Extensions
        </a>

        {' / '}
        <span aria-current='page'>{extension.name}</span>
      </nav>

      <header>
        <div className='mb-4 flex items-center gap-4'>
          <ExtensionIcon
            className='text-accent'
            size={48}
            src={extension.icon}
          />

          <StatusPill status={extension.status} />
        </div>

        <h1 className='text-h2 text-ink'>{extension.name}</h1>
        <p className='mt-3 max-w-[56ch] text-lg text-ink-soft'>{extension.tagline}</p>
        <Facts extension={extension} />
      </header>

      {lead && <Figure shot={lead} />}

      {sections.map((s) => {
        const shot = s.shot === undefined ? undefined : screenshots[s.shot];

        return (
          <section
            className='mt-12'
            key={s.heading}
          >
            <h2 className='font-display text-2xl text-ink'>{s.heading}</h2>
            <p className='mt-2 text-ink-soft'>{s.body}</p>

            {s.bullets && (
              <ul className='mt-3 list-disc pl-6 text-ink-soft'>
                {s.bullets.map((b) => (
                  <li
                    className='mb-1'
                    key={b}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {shot && <Figure shot={shot} />}
          </section>
        );
      })}

      <div className='mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8'>
        <div>
          <p className='font-display text-xl text-ink'>Get Devkitty</p>
          <p className='text-sm text-ink-mute'>A native macOS app.</p>
        </div>

        <a
          className='rounded-full bg-accent-fill px-5 py-2 font-semibold text-accent-ink no-underline transition-transform duration-120 active:scale-[0.98]'
          data-download-link
          href={zipUrl}
        >
          Download for Mac
        </a>
      </div>

      <nav
        aria-label='More extensions'
        className='mt-10 flex justify-between gap-4 text-sm'
      >
        {prev ? (
          <a
            className='inline-flex min-h-11 items-center text-accent underline underline-offset-4 sm:min-h-0'
            href={`/extensions/${prev.id}/`}
          >
            ← {prev.name}
          </a>
        ) : (
          <span />
        )}

        {next && (
          <a
            className='inline-flex min-h-11 items-center text-right text-accent underline underline-offset-4 sm:min-h-0'
            href={`/extensions/${next.id}/`}
          >
            {next.name} →
          </a>
        )}
      </nav>
    </main>
  );
};
