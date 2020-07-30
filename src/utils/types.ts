export interface File {
  browser_download_url: string;
}

export interface GitResponse {
  data: {
    assets: File[];
    name: string;
  }
}