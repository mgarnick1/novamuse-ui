type ViteTypeOptions = object;

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_TYPE_OPTIONS: ViteTypeOptions;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_API_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
