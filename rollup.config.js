import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';

export default {
  input: 'js/main.js',       // 커스텀 JS 진입점
  output: {
    file: 'dist/app.bundle.min.js',  // 빌드 결과물 경로
    format: 'iife',           // 브라우저에서 바로 실행 가능
    name: 'appBundle',
    sourcemap: true
  },
  treeshake : true,
  plugins: [resolve(), commonjs(), terser(),  visualizer({ filename: './dist/stats.html' }) ]
};