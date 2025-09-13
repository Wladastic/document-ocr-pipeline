import { defineConfig } from 'vite'

export default defineConfig({
  // Vite config for Node.js development
  server: {
    hmr: false, // Disable HMR for Node.js apps
  },
  build: {
    target: 'node20',
    outDir: 'dist',
    lib: {
      entry: 'src/api/server.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: ['ioredis', 'zod', 'hono', '@hono/node-server']
    }
  }
})