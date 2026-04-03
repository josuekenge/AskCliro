// react-app-env.ts
// CRA TypeScript support for environment variables

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    PUBLIC_URL: string
    REACT_APP_API_URL: string
    REACT_APP_SUPABASE_URL: string
    REACT_APP_SUPABASE_ANON_KEY: string
    REACT_APP_ENV: string
  }
}
