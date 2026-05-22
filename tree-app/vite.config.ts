import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const API_KEYS = {
  cn: 'sk-3ea880e116f0438e926d0c99e47e8674',
  global: 'sk-97f4661f0fbb47a18a2d3c4f9667098a'
}

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
        rewrite: (path) => path.replace(/^\/api-cn/, ''),
        headers: {
          'Authorization': `Bearer ${API_KEYS.cn}`
        }
      },
      '/api-global': {
        target: 'https://dashscope-us.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-global/, ''),
        headers: {
          'Authorization': `Bearer ${API_KEYS.global}`
        }
      },
      '/api-multi-cn': {
        target: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-multi-cn/, ''),
        headers: {
          'Authorization': `Bearer ${API_KEYS.cn}`
        }
      },
      '/api-multi-global': {
        target: 'https://dashscope-us.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-multi-global/, ''),
        headers: {
          'Authorization': `Bearer ${API_KEYS.global}`
        }
      },
      '/.netlify/functions/qwen-api/cn': {
        target: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/\.netlify\/functions\/qwen-api\/cn/, ''),
        headers: {
          'Authorization': `Bearer ${API_KEYS.cn}`
        }
      },
      '/.netlify/functions/qwen-api/global': {
        target: 'https://dashscope-us.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/\.netlify\/functions\/qwen-api\/global/, ''),
        headers: {
          'Authorization': `Bearer ${API_KEYS.global}`
        }
      },
      '/.netlify/functions/qwen-api/multiCn': {
        target: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/\.netlify\/functions\/qwen-api\/multiCn/, ''),
        headers: {
          'Authorization': `Bearer ${API_KEYS.cn}`
        }
      },
      '/.netlify/functions/qwen-api/multiGlobal': {
        target: 'https://dashscope-us.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/\.netlify\/functions\/qwen-api\/multiGlobal/, ''),
        headers: {
          'Authorization': `Bearer ${API_KEYS.global}`
        }
      }
    }
  }
})
