import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';



export default defineConfig({

  build: {
    outDir: 'dist', // penting!
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Ganti 127.0.0.1 → IP PC kamu
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000', // Sama di sini
        changeOrigin: true,
        secure: false,
      },
    },
    host: '0.0.0.0', // ← buka akses untuk device lain (HP)
    port: 5173,
    cors: true,
    hmr: {
      host: '127.0.0.1', // ← pastikan ini IP PC kamu
    },
  },
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.tsx'],
      ssr: 'resources/js/ssr.tsx',
      refresh: true,
    }),
    react(),
    tailwindcss(),
  ],
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
    },
  },
});
