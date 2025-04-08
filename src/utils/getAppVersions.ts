import axios from 'axios';
import find from 'lodash/find';
import { type GitResponse } from 'utils';

const GIT_PATH = 'https://api.github.com/repos/egor-xyz/devkitty/releases/latest';

export const getAppVersions = async () => {
  const res = await axios.get<null, GitResponse>(GIT_PATH);
  const macFile = find(res.data.assets, (file) => file.browser_download_url.includes('.dmg'));
  const winFile = find(res.data.assets, (file) => file.browser_download_url.includes('.exe'));
  if (!macFile || !winFile) return;
  return {
    macURL: macFile.browser_download_url,
    version: res.data.name,
    winURL: winFile.browser_download_url
  };
};
