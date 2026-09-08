import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Target Chrome 80 (below the Chrome 81 WebView on the Galaxy Tab A 8.4
  // 2020 test device) so esbuild transpiles syntax like `??=` that older
  // WebViews can't parse, instead of shipping it as-is.
  build: {
    target: 'chrome80',
  },
})
