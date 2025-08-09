import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import copy from 'rollup-plugin-copy';

export default {
  input: 'js/main.js',       // 커스텀 JS 진입점
  output: {
    file: 'dist/app.bundle.min.js',  // 빌드 결과물 경로
    format: 'iife',           // 브라우저에서 바로 실행 가능
    name: 'appBundle',
    sourcemap: true
  },
  treeshake : true,
  plugins: [
    resolve(),
    commonjs(),
    terser(),
    visualizer({ filename: './dist/stats.html' }),
    copy({
      targets: [
        { src: '*.html', dest: 'dist' },
        { src: 'css/**/*', dest: 'dist/css' },
        { src: 'assets/**/*', dest: 'dist/assets' },
        { src: 'fonts/**/*', dest: 'dist/fonts'},
        { src: 'js/**/*', dest: 'dist/js' },
        { src: 'nav-animation', dest: 'dist/nav-animation'}
      ],
      verbose: true
    })
  ]
};