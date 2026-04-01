import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '~': path.resolve(__dirname, '../context')
    },
  },
  // 关键配置：让 .less 文件作为 CSS Modules 处理
  esbuild: {
    loader: 'tsx',
  },
});
