import { useQuery } from 'convex/react';
import { useEffect } from 'react';
import { useVersion } from 'store/useVersions';

import { api } from '../../../convex/_generated/api';
import { DownloadCTA } from '../DownloadCTA/DownloadCTA';
import { Features } from '../Features/Features';
import { Footer } from '../Footer/Footer';
import { Hero } from '../Hero/Hero';
import { Nav } from '../Nav/Nav';

export const App = () => {
  const { setVersion } = useVersion();
  const tasks = useQuery(api.tasks.get);

  useEffect(() => {
    if (tasks?.version) setVersion(tasks.version);
  }, [tasks, setVersion]);

  return (
    <div className='grain relative'>
      {/* Ambient sunset field behind every section — sits over the page
          gradient, under all content, so no section reads as flat black. */}
      <div
        aria-hidden
        className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'
      >
        <span
          className='aurora left-[-6%] top-[12%] h-[460px] w-[560px] bg-grape opacity-30'
          style={{ animation: 'drift 20s ease-in-out infinite' }}
        />

        <span
          className='aurora right-[-8%] top-[42%] h-[440px] w-[520px] bg-coral opacity-25'
          style={{ animation: 'drift-2 24s ease-in-out infinite' }}
        />

        <span
          className='aurora bottom-[6%] left-[36%] h-[420px] w-[560px] bg-grape-deep opacity-30'
          style={{ animation: 'drift 28s ease-in-out infinite' }}
        />

        {/* slow-panning starfield so the backdrop is always gently in motion */}
        <div className='stars absolute inset-0' />
      </div>

      <Nav />

      <main>
        <Hero />
        <Features />
        <DownloadCTA />
      </main>

      <Footer />
    </div>
  );
};
