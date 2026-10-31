import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.js'],
    env: {
      SECRET_KEY: "secret-key-test",
      NODE_ENV: "test",
      MONGODB_DATABASE: "app_1",
      MONGODB_URI: "mongodb+srv://mquirosdev_db_user:Rtr386yv7zjmeir3@myapp-1.rdzu3nx.mongodb.net"
    }
  },
})