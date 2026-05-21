import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  base:'./',
  server: {
    proxy: {
      '/api-cn': {
        target: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-cn/, '')
      },
      '/api-global': {
        target: 'https://dashscope-us.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-global/, '')
      },
      '/api-multi-cn': {
        target: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-multi-cn/, '')
      },
      '/api-multi-global': {
        target: 'https://dashscope-us.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-multi-global/, '')
      }
    }
  }
})
