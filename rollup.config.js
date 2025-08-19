import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import copy from 'rollup-plugin-copy';

export default {
  input: {
    main: 'js/main.js',
    common: 'js/common.js',
    page: 'js/page.js'
  },
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
        if (id.includes('lottie-web-light')) {
          return 'vendor-lottie-light';
        }
        if (id.includes('gsap')) {
          return 'gsap';
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
        { src: 'index.html', dest: 'dist' },
        { src: 'pages/**/*.html', dest: 'dist/pages' },
        { src: "assets/css/**/*", dest: "dist/assets/css" },
        { src: "assets/fonts/**/*", dest: "dist/assets/fonts" },
        { src: "assets/img/**/*", dest: "dist/assets/img" },
        { src: "assets/nav-animation/**/*", dest: "dist/assets/nav-animation" },
        { src: 'js/**/*', dest: 'dist/js' }
      ],
      verbose: true
    })
  ]
};