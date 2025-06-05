/// <reference types="vite/client" />
declare namespace NodeJS {
  interface ProcessEnv {
    readonly GPT_API_KEY: string;
    // you can add more REACT_APP_ vars here…
  }
}
