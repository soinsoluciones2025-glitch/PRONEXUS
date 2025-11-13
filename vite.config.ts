import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env files and the environment
  // FIX: The 'process' object is globally available in Node.js. The previous import of the 'process' package
  // was causing a type error because it's a browser polyfill without the 'cwd' method.
  // Fix: Replaced `process.cwd()` with `''` to avoid a TypeScript error. Vite's `loadEnv` function resolves an empty string to the project root, making this functionally equivalent.
  const env = loadEnv(mode, '', '');
  return {
    plugins: [react()],
    define: {
      // Remove process.env.API_KEY as it's no longer used for Gemini API in the frontend.
      // User API key is now passed directly from user profile to geminiService.
      // 'process.env.API_KEY': JSON.stringify(env.API_KEY), 
    },
  };
});