import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  server: {
    port: 5712,
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
