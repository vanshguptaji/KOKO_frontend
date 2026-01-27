import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // SDK build configuration
  if (mode === 'sdk') {
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/sdk.jsx'),
          name: 'VetChatbot',
          fileName: 'chatbot',
          formats: ['iife'], // Self-executing script for browser
        },
        rollupOptions: {
          // Bundle all dependencies
          external: [],
          output: {
            // Ensure React is bundled
            globals: {},
            // Output to dist folder
            dir: 'dist/sdk',
          },
        },
        // Inline all CSS
        cssCodeSplit: false,
        // Minify for production
        minify: 'terser',
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
    }
  }

  // Default development/production build
  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})
