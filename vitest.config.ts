import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Run in node environment for server-side logic tests
    environment: 'node',
    // Exclude Playwright e2e tests
    exclude: ['**/node_modules/**', '**/e2e/**', '**/*.e2e.*', '**/playwright/**'],
    // Global setup (no jsdom needed since we test server logic)
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
