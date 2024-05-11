/// <reference types="vite/client" />
/* eslint-disable */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_INITIAL_USER?: string
  readonly VITE_INITIAL_PWD?: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
