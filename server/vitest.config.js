import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['src/__tests__/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/controllers/**', 'src/middleware/**', 'src/utils/**'],
      exclude: ['src/__tests__/**'],
    },
    // Disable dotenv loading in tests — we mock env vars in setup
    env: {
      JWT_SECRET: 'test-secret-key-for-testing',
      JWT_EXPIRES_IN: '1h',
    },
  },
})
