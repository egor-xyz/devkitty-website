import { type FC } from 'react';

import { MonitorZoom } from './MonitorZoom';
import { changelogProgram, extensionsProgram, featuresProgram } from './programs';

export { CHANGELOG_OPEN_EVENT, EXTENSIONS_OPEN_EVENT, FEATURES_OPEN_EVENT } from './programs';

const PROGRAMS = [featuresProgram, extensionsProgram, changelogProgram];

/** The monitor zoom window; its sidebar switches between the programs in place. */
export const SiteZoom: FC = () => <MonitorZoom programs={PROGRAMS} />;
