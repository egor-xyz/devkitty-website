import { AnchorButton, Icon } from '@blueprintjs/core';
import DevkittyLogo from 'assets/svg/devKitty.svg?react';
import { useVersion } from 'store/useVersions';

export const Downloads = () => {
  const { download, version } = useVersion();

  return (
    <div className='hidden md:flex justify-center py-16 sticky top-0 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 h-[calc(100vh-var(--header-height))]'>
      <div className='flex flex-col items-center w-full '>
        <img
          alt='devkitty'
          className='max-w-full w-[800px] rounded-lg h-auto'
          src='/images/GitHub-App-Demo.png'
        />

        <DevkittyLogo className='w-16 h-16 mt-4' />
        <div className='text-3xl font-bold text-center mt-2 text-white'>devkitty</div>

        <div className='flex items-center gap-2 text-green-200 font-medium'>
          <Icon icon={'confirm'} />
          <span>{version}</span>
        </div>

        {version && (
          <div className='mt-4'>
            <div className='flex flex-col gap-2'>
              <AnchorButton
                className='w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium py-2 rounded hover:bg-gray-100'
                href={download.apple()}
                icon={'download'}
                size='large'
                text={'Download (Apple)'}
              />

              <AnchorButton
                className='w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium py-2 rounded hover:bg-gray-100'
                href={download.intel()}
                icon={'download'}
                size='large'
                text={'Download (Intel)'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
