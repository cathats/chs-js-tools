import path from 'path'
// import { RollupOptions } from 'rollup'
import rollupTypescript from 'rollup-plugin-typescript2'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { eslint } from 'rollup-plugin-eslint'
import { DEFAULT_EXTENSIONS } from '@babel/core'
import pkg from '../package.json'
import dts from 'rollup-plugin-dts'
import strip from '@rollup/plugin-strip'

const dirName = __dirname.replace('/build', '')
const paths = {
  input: path.join(dirName, '/src/index.ts'),
  output: path.join(dirName, '/lib')
}

const rollupConfig = [
  {
    input: paths.input,
    output: [
      // commonJS
      {
        file: path.join(paths.output, 'index.js'),
        format: 'cjs',
        name: pkg.name
      },
      // ES
      {
        file: path.join(paths.output, 'index.esm.js'),
        format: 'es',
        name: pkg.name
      }
    ],
    plugins: [
      // 删除强调语句 如: console
      strip({
        debugger: true,
        functions: ['console.log', 'assert.*', 'debug', 'alert']
      }),

      // 验证导入的文件
      eslint({
        throwOnError: true, // lint 结果有错误将会抛出异常
        throwOnWarning: true,
        include: ['src/**/*.ts'],
        exclude: ['node_modules/**', 'lib/**', '*.js']
      }),

      // 使得 rollup 支持 commonjs 规范，识别 commonjs 规范的依赖
      commonjs(),

      // 配合 commnjs 解析第三方模块
      resolve({
        // 将自定义选项传递给解析插件
        customResolveOptions: {
          moduleDirectory: 'node_modules'
        }
      }),
      rollupTypescript(),
      babel({
        runtimeHelpers: true,
        // 只转换源代码，不运行外部依赖
        exclude: 'node_modules/**',
        // babel 默认不支持 ts 需要手动添加
        extensions: [...DEFAULT_EXTENSIONS, '.ts']
      })
    ]
  },
  {
    input: path.join(paths.output, 'index.d.ts'),
    output: [{ file: path.join(paths.output, 'index.d.ts'), format: 'es' }],
    plugins: [dts()]
  }
]

export default rollupConfig
