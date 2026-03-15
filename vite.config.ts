import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // 🟢 ADD THIS LINE: Essential for the APK to find your files
  base: './',

  plugins: [react()],

  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': 'c:/Users/dhvan/Desktop/CERS-SU/CERS/node_modules/react',
      'react-dom': 'c:/Users/dhvan/Desktop/CERS-SU/CERS/node_modules/react-dom',
    },
  },

  optimizeDeps: {
    force: true,
  },

  appType: 'spa',

  server: {
    host: true,
    port: 5173,
  },

  preview: {
    // You can keep this, but it won't affect Firebase
    allowedHosts: ['cers-4.onrender.com']
  }
});