import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import copy from 'rollup-plugin-copy';

export default {
  input: 'js/main.js',
  output: {
    dir: 'dist',         // 여러 청크를 dist 폴더에 생성
    format: 'esm',       // ESM 포맷 (동적 import 지원)
    sourcemap: true,
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js',
    manualChunks(id) {
      if (id.includes('node_modules')) {
        if (id.includes('swiper')) {
          return 'vendor-swiper';
        }
        if (id.includes('fullcalendar')) {
          return 'vendor-fullcalendar';
        }
        return 'vendor'; // 나머지 라이브러리 공통 묶음
      }
    }
  },
  treeshake : {
    moduleSideEffects: false,
  },
  plugins: [
    resolve(),
    commonjs({ ignoreGlobal: true }),
    terser(),
    visualizer({ filename: './dist/stats.html' }),
    copy({
      targets: [
        { src: '*.html', dest: 'dist' },
        { src: 'css/**/*', dest: 'dist/css' },
        { src: 'assets/**/*', dest: 'dist/assets' },
        { src: 'fonts/**/*', dest: 'dist/fonts'},
        { src: 'js/**/*', dest: 'dist/js' },
        { src: 'nav-animation/**/*', dest: 'dist/nav-animation'}
      ],
      verbose: true
    })
  ]
};