export type File = {
  browser_download_url: string;
}

export type GitResponse = {
  data: {
    assets: File[];
    name: string;
  };
}
