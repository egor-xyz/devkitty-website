import { Downloads, Features, Header } from 'components';
import { useQuery } from 'convex/react';
import { useEffect } from 'react';
import { useVersion } from 'store/useVersions';

import { api } from '../../../convex/_generated/api';
import css from './App.module.scss';

export const App = () => {
  const { setVersion } = useVersion();
  const tasks = useQuery(api.tasks.get);
  console.log('tasks', tasks?.version);

  useEffect(() => {
    if (tasks?.version) {
      setVersion(tasks.version);
    }
  }, [tasks, setVersion]);

  return (
    <div className={css.root}>
      <Header />
      <Features />

      <button
        className={css.anchor}
        id='downloads'
      />

      <Downloads />
    </div>
  );
};
