import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.js'],
    env: {
      SECRET_KEY: 'secret-key-test',
      NODE_ENV: 'test'
    }
  }
})
