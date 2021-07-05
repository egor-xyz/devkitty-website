import axios from 'axios';
import { GitResponse } from 'utils';
import find from 'lodash/find';

const GIT_PATH = 'https://api.github.com/repos/iDevkitty/website/releases/latest';

export const getAppVersions = async () => {
  const res = await axios.get<null, GitResponse>(GIT_PATH);
  const macFile = find(res.data.assets, (file) => file.browser_download_url.includes('.dmg'));
  const winFile = find(res.data.assets, (file) => file.browser_download_url.includes('.exe'));
  if (!macFile || !winFile) return;
  return {
    version: res.data.name,
    macURL: macFile.browser_download_url,
    winURL: winFile.browser_download_url,
  }
};