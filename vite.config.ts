import { defineConfig } from 'vite';
import loadVersion from 'vite-plugin-package-version';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import Icons from 'unplugin-icons/vite';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    loadVersion(),
    Icons({ compiler: 'jsx', jsx: 'react', defaultClass: 'u-icon' }),
    react()
  ]
});
