import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // amazon-cognito-identity-js references Node's `global`; map it to the
  // browser-standard `globalThis` so Vite's browser bundle doesn't throw
  // "ReferenceError: global is not defined".
  define: {
    global: 'globalThis',
  },
})
