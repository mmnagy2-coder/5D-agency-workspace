// Builds one self-contained HTML file, used to publish the prototype as a
// private claude.ai artifact. Normal development uses vite.config.js.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-artifact', emptyOutDir: true },
})
