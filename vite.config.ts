/// <reference types="vitest/config" />
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function buildVersion(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.${pad(now.getHours())}${pad(now.getMinutes())}`
}

export default defineConfig(({ command }) => {
  const appVersion = buildVersion()

  if (command === 'build') {
    const publicDir = path.resolve(__dirname, 'public')
    fs.mkdirSync(publicDir, { recursive: true })
    fs.writeFileSync(path.join(publicDir, 'version.json'), JSON.stringify({ version: appVersion }))
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    server: {
      port: 5174,
      strictPort: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  }
})
