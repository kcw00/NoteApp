import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: env.VITE_BACKEND_URL,
          ws: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './testSetup.js',
    },
  }
})


