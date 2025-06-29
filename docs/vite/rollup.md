# 1. Rollup
- 是一款基于 ES Module 模块规范实现的 JS 打包工具

## 2.安装
```ts
pnpm i rollup


├── package.json
├── pnpm-lock.yaml
├── rollup.config.js
└── src
    ├── index.js
    └── util.js
```

```json
{
  // rollup 打包命令，`-c` 表示使用配置文件中的配置
  "build": "rollup -c"
}
```


## 3.多配置产物

```tsx
// rollup.config.js
/**
 * @type { import('rollup').RollupOptions }
 */
const buildOptions = {
  input: ['src/index.js'],
  // 将 output 改造成一个数组
  output: [
    {
      dir: 'dist/es',
      format: 'esm'
    },
    {
      dir: 'dist/cjs',
      format: 'cjs'
    }
  ]
}

export default buildOptions
```


## 4. 多入口配置

```js
{
  input: ["src/index.js", "src/util.js"]
}
// 或者
{
  input: {
    index: "src/index.js",
    util: "src/util.js",
  },
}
```

## 5. 自定义`output`配置

```js
output: {
  // 产物输出目录
  dir: path.resolve(__dirname, 'dist'),
  // 以下三个配置项都可以使用这些占位符:
  // 1. [name]: 去除文件后缀后的文件名
  // 2. [hash]: 根据文件名和文件内容生成的 hash 值
  // 3. [format]: 产物模块格式，如 es、cjs
  // 4. [extname]: 产物后缀名(带`.`)
  // 入口模块的输出文件名
  entryFileNames: `[name].js`,
  // 非入口模块(如动态 import)的输出文件名
  chunkFileNames: 'chunk-[hash].js',
  // 静态资源文件输出文件名
  assetFileNames: 'assets/[name]-[hash][extname]',
  // 产物输出格式，包括`amd`、`cjs`、`es`、`iife`、`umd`、`system`
  format: 'cjs',
  // 是否生成 sourcemap 文件
  sourcemap: true,
  // 如果是打包出 iife/umd 格式，需要对外暴露出一个全局变量，通过 name 配置变量名
  name: 'MyBundle',
  // 全局变量声明
  globals: {
    // 项目中可以直接用`$`代替`jquery`
    jquery: '$'
  }
}
```
## 6. 依赖 external
对于某些第三方包，有时候我们不想让 Rollup 进行打包，也可以通过 external 进行外部化:

```ts
{
  external: ['react', 'react-dom']
}
```
## 7. 接入插件能力
Rollup 本身不支持的场景，比如`兼容 CommonJS 打包`、`注入环境变量`、`配置路径别名`、`压缩产物代码` 等等。这个时候就需要我们引入相应的 Rollup 插件了。

首先需要安装两个核心的插件包:

```js
pnpm i @rollup/plugin-node-resolve @rollup/plugin-commonjs
```

- `@rollup/plugin-node-resolve`是为了允许我们加载第三方依赖，否则像`import React from 'react'` 的依赖导入语句将不会被 Rollup 识别。
- `@rollup/plugin-commonjs` 的作用是将 CommonJS 格式的代码转换为 ESM 格式



- `rollup.rollup`，用来一次性地进行 Rollup 打包
你可以新建`build.js

```js
// build.js
const rollup = require('rollup')

// 常用 inputOptions 配置
const inputOptions = {
  input: './src/index.js',
  external: [],
  plugins: []
}

const outputOptionsList = [
  // 常用 outputOptions 配置
  {
    dir: 'dist/es',
    entryFileNames: `[name].[hash].js`,
    chunkFileNames: 'chunk-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]',
    format: 'es',
    sourcemap: true,
    globals: {
      lodash: '_'
    }
  }
  // 省略其它的输出配置
]

- `rollup.watch`来完成`watch`模式下的打包，即每次源文件变动后自动进行重新打包。新建`watch.js`文件，内容入下:




```js
// watch.js
import { watch } from 'rollup'

const watcher = watch({
  input: './src/index.js',
  output: [
    {
      dir: 'dist/es',
      format: 'esm'
    },
    {
      dir: 'dist/cjs',
      format: 'cjs'
    }
  ],
  watch: {
    exclude: ['node_modules/**'],
    include: ['src/**']
  }
})

// 监听事件（保持不变）
watcher.on('restart', () => {
  console.log('重新构建...')
})

watcher.on('change', (id) => {
  console.log('发生变动的模块id: ', id)
})

watcher.on('event', (e) => {
  if (e.code === 'BUNDLE_END') {
    console.log('打包信息:', e)
  }
})


````
- 修改内容 自动发生构建


## 8.插件机制


### 1.问题
-  Rollup 内置的打包能力很难满足项目日益复杂的构建需求。
-  考虑`模块打包`之外的问题，比如**路径别名(alias)** 、**全局变量注入**和**代码压缩**等等。
-  把这些场景的处理逻辑与核心的打包逻辑都写到一起，打包器本身的代码臃肿，二来也会对原有的核心代码产生一定的侵入性，
-  Rollup 设计出了一套完整的**插件机制**，将自身的核心逻辑与插件逻辑分离，让你能按需引入插件功能，提高 Rollup可扩展性。

在 cli 内部的主要逻辑简化如下:

```ts
// Build 阶段
const bundle = await rollup.rollup(inputOptions)

// Output 阶段
await Promise.all(outputOptions.map(bundle.write))

// 构建结束
await bundle.close()
```


- 打印出构建信息
```
async function build() {
  const bundle = await rollup.rollup({
    input: ['./src/index.js']
  })
  console.log(util.inspect(bundle))
  const result = await bundle.generate({
    format: 'es'
  })
  console.log('result:', result)
```
构建内容
```js
{
  cache: {
    modules: [ [Object], [Object] ],
    plugins: [Object: null prototype] {}
  },
  close: [AsyncFunction: close],
  closed: false,
  generate: [AsyncFunction: generate],
  watchFiles: [Getter],
  write: [AsyncFunction: write],
  [Symbol(nodejs.asyncDispose)]: [AsyncFunction: [nodejs.asyncDispose]]
}

result: {
  output: [
    {
      exports: [],
      facadeModuleId: '/Users/rwr/repo/vite/rollup/src/index.js',
      isDynamicEntry: false,
      isEntry: true,
      isImplicitEntry: false,
      moduleIds: [Array],
      name: 'index',
      type: 'chunk',
      dynamicImports: [],
      fileName: 'index.js',
      implicitlyLoadedBefore: [],
      importedBindings: {},
      imports: [],
      modules: [Object: null prototype],
      referencedFiles: [],
      code: 'const a = 1;\n\nconsole.log(a);\n',
      map: null,
      preliminaryFileName: 'index.js',
      sourcemapFileName: null
    }
  ]
}
```

- `output`数组即为打包完成的结果
- ** **Rollup** **会先进入到 Build，解析各模块的内容及依赖关系，然后进入**`Output`**，完成打包及输出的过程**


### 2.拆解插件工作流


#### 插件 Hook 类型


插件的各种 Hook 可以根据这两个构建阶段分为两类: `Build Hook` 与 `Output Hook`。

- `Build Hook`即在`Build`阶段执行的钩子函数，在这个阶段主要进行模块代码的转换、AST 解析以及模块依赖的解析，那么这个阶段的 Hook 对于代码的操作粒度一般为`模块`级别，也就是单文件级别。
- `Ouput Hook`(官方称为`Output Generation Hook`)，则主要进行代码的打包，对于代码而言，操作粒度一般为 `chunk`级别(一个 chunk 通常指很多文件打包到一起的产物)。
- 除了根据构建阶段可以将 Rollup 插件进行分类，根据不同的 Hook 执行方式也会有不同的分类，主要包括`Async`、`Sync`、`Parallel`、`Squential`、`First`这五种。

1. Async & Sync**

首先是`Async`和`Sync`钩子函数 分别代表`异步`和`同步`，区别在于同步钩子里面不能有异步逻辑，而异步钩子可以有。


2. Parallel
- 这里指并行的钩子函数。
- 如果有多个插件实现了这个钩子的逻辑，一旦有钩子函数是异步逻辑，则并发执行钩子函数，不会等待当前钩子完成(底层使用 `Promise.all`)。
- 比如对于`Build`阶段的`buildStart`钩子，它的执行时机其实是在构建刚开始的时候，各个插件可以在这个钩子当中做一些状态的初始化操作，但其实插件之间的操作并不是相互依赖的，也就是可以并发执行，从而提升构建性能。
- 反之，对于需要**依赖其他插件处理结果**的情况就不适合用 `Parallel` 钩子了，比如 `transform`。

3. Sequential

- **Sequential** 指串行的钩子函数。
- 这种 Hook 往往适用于插件间处理结果相互依赖的情况，前一个插件 Hook 的返回值作为后续插件的入参，这种情况就需要等待前一个插件执行完 Hook，获得其执行结果，然后才能进行下一个插件相应 Hook 的调用，如`transform`。

4. First

如果有多个插件实现了这个 Hook，那么 Hook 将依次运行，直到返回一个非 null 或非 undefined 的值为止。
比较典型的 Hook 是 `resolveId`，一旦有插件的 resolveId 返回了一个路径，将停止执行后续插件的 resolveId 逻辑。

- 刚刚我们介绍了 Rollup 当中不同插件 Hook 的类型，实际上不同的类型是可以叠加的，`Async`/`Sync` 可以搭配后面三种类型中的任意一种，比如一个 Hook 既可以是 `Async` 也可以是 `First` 类型，接着我们将来具体分析 Rollup 当中的插件工作流程，里面会涉及到具体的一些 Hook，大家可以具体地感受一下。

#### Build 阶段工作流


####  Output 阶段工作流


## 常用 Hook 实战

### 1.**路径解析: resolveId**

#### 1.什么是resolveId
resolveId 就像是 Rollup 的"导航系统"，当代码中出现 import xxx from 'module-a' 时，它负责确定这个 module-a 到底在哪里。


#### 2.alias 插件
```js
export default function alias(options = {}) {
  // 规范化 entries 配置
  const entries = Array.isArray(options.entries) ? options.entries : options ? [options] : []

  return {
    name: 'alias',
    resolveId(importee, importer, resolveOptions) {
      // 1. 检查是否是入口模块（没有 importer）
      if (!importer) {
        return null
      }

      // 2. 查找匹配的别名规则
      const matchedEntry = entries.find((entry) => {
        // 支持字符串精确匹配或正则表达式匹配
        if (typeof entry.find === 'string') {
          return entry.find === importee
        } else if (entry.find instanceof RegExp) {
          return entry.find.test(importee)
        }
        return false
      })

      if (!matchedEntry) {
        return null
      }

      // 3. 执行路径替换
      let updatedId
      if (typeof matchedEntry.replacement === 'function') {
        updatedId = matchedEntry.replacement(importee)
      } else if (matchedEntry.find instanceof RegExp) {
        updatedId = importee.replace(matchedEntry.find, matchedEntry.replacement)
      } else {
        updatedId = matchedEntry.replacement
      }

      // 4. 规范化路径（处理 ./ 和 ../ 等）
      updatedId = normalizePath(updatedId)

      // 5. 让其他插件继续处理新路径
      return this.resolve(
        updatedId, //经过别名替换后的新路径（如 './module-a'）
        importer, //发起引用的模块路径（如 'src/index.js'）
        Object.assign({ skipSelf: true }, resolveOptions)  //{ skipSelf: true }：确保不会递归调用当前插件
      ).then((resolved) => {
        return resolved || { id: updatedId }
        // null 没有插件能解析这个路径
        // { id: 'resolved/path' }：解析成功对象
        // string：解析后的路径（会自动转为 { id: string }）
      })
    }
  }
}

// 辅助函数：规范化路径
function normalizePath(path) {
  // 处理 Windows 反斜杠
  path = path.replace(/\\/g, '/')

  // 处理相对路径
  if (path.startsWith('./') || path.startsWith('../')) {
    return path
  }

  // 确保非相对路径以 ./ 开头
  return `./${path.replace(/^\.?\//, '')}`
}

```
使用
```js
alias({
  entries: [
    { find: 'module-a', replacement: './module-a.js' }
  ]
})

// 转换前（src/index.js）
import a from 'module-a'

// 转换后
import a from './module-a.js'
```
工作流程：
- 接收导入语句：遇到 import a from 'module-a'

- 检查匹配规则：查找是否有配置 module-a 的别名

- 路径替换：将 module-a 替换为 ./module-a.js

- 二次解析：让其他插件处理新路径


#### 3 resolveId 的三种返回值
- 返回 null：不处理 下一个插件处理
- 返回字符串：意思是路径就是这个，不用再找了（示例：直接返回 './module-a.js'）
- 返回对象：：意思是路径在这，还有些额外信息（示例：{ id: './module-a.js', external: false }）


### 2.**load**
- load 钩子就像是 Rollup 的"文件内容读取器"，根据模块路径(id)读取文件内容。

```js
import { readFileSync } from 'fs'
import { extname } from 'path'

// 支持的图片类型及其MIME类型
const DEFAULT_MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
}

// 默认配置
const DEFAULT_OPTIONS = {
  dom: false,
  exclude: undefined,
  include: undefined,
  mimeTypes: DEFAULT_MIME_TYPES
}

export default function image(opts = {}) {
  const options = { ...DEFAULT_OPTIONS, ...opts }

  return {
    name: 'image',

    load(id) {
      try {
        console.log('id', id)
        // 1. 检查文件扩展名是否匹配
        const ext = extname(id)
        const mime = options.mimeTypes[ext]

        console.log('ext', ext)

        console.log('mime', mime)

        // 如果不是图片类型，返回 null
        if (!mime) return null

        // 2. 检查包含/排除规则
        if (options.exclude && options.exclude.test(id)) return null
        if (options.include && !options.include.test(id)) return null

        // 3. 读取文件内容
        const isSvg = mime === 'image/svg+xml'
        const format = isSvg ? 'utf-8' : 'base64'
        const source = readFileSync(id, format).replace(/[\r\n]+/gm, '')

        // 4. 生成Data URI
        const dataUri = `data:${mime};${format},${source}`

        // 5. 根据配置生成不同的导出代码
        const code = options.dom ? generateDomCode(dataUri) : generateConstCode(dataUri)

        return code.trim()
      } catch (error) {
        // 6. 错误处理
        this.warn(`Failed to load image ${id}: ${error.message}`)
        return null
      }
    }
  }
}

// 生成DOM元素的代码
function generateDomCode(dataUri) {
  return `
    var img = new Image();
    img.src = '${dataUri}';
    export default img;
  `
}

// 生成常量导出的代码
function generateConstCode(dataUri) {
  return `export default '${dataUri}';`
}

```

- resolveId：确定文件在哪

- load：读取文件内容

- transform：修改内容



### 3.**代码转换: transform**
#### 1.transform 钩子是什么？


transform 钩子就像是代码的"加工车间"，它的核心职责是：对已经加载的模块代码进行修改转换。




#### 2. 以官方 replace 讲解
配置
```js
// rollup.config.js
import replace from '@rollup/plugin-replace'

export default {
  plugins: [
    replace({
      __VERSION__: '"1.0.0"',  // 替换为字符串 "1.0.0"
      __DEV__: false           // 替换为布尔值 false
    })
  ]
}
```
效果
```js
// 转换前代码
if (__DEV__) {
  console.log('Running version:', __VERSION__)
}

// 转换后代码
if (false) {
  console.log('Running version:', "1.0.0")
}
// 经过压缩后，这段代码会被完全移除
```
实现原理
```js
/**
 * Rollup 替换插件 - 用于在打包过程中替换代码中的特定字符串
 *
 * 功能：
 * 1. 在模块转换阶段(transform)执行字符串替换
 * 2. 在生成chunk阶段(renderChunk)再次执行替换以确保全面性
 * 3. 生成准确的sourcemap保持源码映射关系
 */

import MagicString from 'magic-string' // 专门用于高效操作字符串并生成 sourcemap的库

function executeReplacement(code, id, options) {
  const magicString = new MagicString(code)

  Object.entries(options).forEach(([key, value]) => {
    // 确保key是有效的标识符
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(escapedKey, 'g')
    let match

    while ((match = pattern.exec(code))) {
      const start = match.index
      const end = start + match[0].length
      // 确保替换值是字符串，并处理引号情况
      const stringValue =
        typeof value === 'string'
          ? value.startsWith('"') || value.startsWith("'")
            ? value
            : `'${value}'`
          : JSON.stringify(value)

      magicString.overwrite(start, end, stringValue)
    }
  })

  return {
    code: magicString.toString(),
    map: magicString.generateMap()
  }
}

export default function replace(options = {}) {
  return {
    name: 'replace',
    transform(code, id) {
      return executeReplacement(code, id, options)
    },
    renderChunk(code, chunk) {
      return executeReplacement(code, chunk.fileName, options)
    }
  }
}




```

#### 3. transform 钩子的关键特性
##### 1. 串行处理
```js
plugins: [
  pluginA(), // 先执行
  pluginB(), // 后执行
  pluginC()  // 最后执行
]
```
##### 2. 三种返回值：
- 返回对象：必须包含 code 属性 `return { code: '新代码', map: sourceMap }`
- 返回null：跳过当前插件处理`if (不满足条件) return null`
- 返回字符串：简写形式`return '新代码'`

##### 3.SourceMap支持：
```js
// 使用MagicString可以自动生成SourceMap
const magicString = new MagicString(code)
magicString.overwrite(20, 25, '替换内容')
return {
  code: magicString.toString(),
  map: magicString.generateMap()
}
```


###  4.**Chunk 级代码修改: renderChunk**

### 1.什么是 renderChunk 钩子？
renderChunk 在 Rollup 处理完所有模块转换（transform）之后、生成最终输出文件之前被调用。
这个钩子允许你对即将输出的代码块（chunk）进行最后的修改。

### 2.为什么需要 renderChunk？
- 最终处理机会：在所有 transform 完成后，对代码做最后的修改

- 全局视角：可以访问整个 chunk 的代码，而不仅是单个模块
### 3.基本语法
```js
renderChunk(code, chunk) {
  // code: 当前 chunk 的代码内容
  // chunk: chunk 的元信息对象
  return {
    code: '修改后的代码',
    map: {...} // 可选的 sourcemap
  }
}
```
### 4.eg
```js
export default function replace(options = {}) {
  // 存储替换规则
  const replacements = options.replacements || {}

  // 执行替换的函数
  function executeReplacement(code, id) {
    let result = code
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, 'g'), value)
    }
    return result
  }

  return {
    name: 'replace',

    // 在单个模块转换时执行替换
    transform(code, id) {
      return executeReplacement(code, id)
    },

    // 在所有模块转换完成后，再次执行替换
    renderChunk(code, chunk) {
      const id = chunk.fileName
      console.log(`处理 chunk: ${id}`)

      // 可以访问 chunk 的完整信息
      console.log(`包含的模块: ${chunk.moduleIds.join(', ')}`)

      // 执行最终替换
      return {
        code: executeReplacement(code, id),
        map: null // 这里简化处理，不生成 sourcemap
      }
    }
  }
}
```

代码优化
```js
renderChunk(code) {
  return code.replace(/console\.debug\(.*?\);/g, '')
}
```
chunk 参数包含丰富的元信息，常用属性包括：

fileName: 输出文件名

modules: 包含的所有模块及其信息

imports/exports: 导入导出的模块

isEntry: 是否是入口 chunk

facadeModuleId: 入口模块 ID

特性	transform	renderChunk
调用时机	单个模块加载时	所有模块转换完成后
处理范围	单个模块	整个 chunk (可能多个模块)
使用场景	模块级转换	chunk 级最终处理
访问信息	当前模块信息	整个 chunk 的元信息


### 5.**产物生成最后一步: generateBundle**


#### 1. generateBundle 钩子是什么？

generateBundle 是 Rollup 构建流程中最后一个关键钩子，它就像产品出厂前的最后一道质检工序。在这个阶段，你可以对打包产物进行最终调整，或者生成额外的文件（比如 HTML 入口文件）。


#### 2.核心特点

- 触发时机：在所有模块转换和代码分割完成后 在写入磁盘之前

- 核心能力：访问所有打包产物的元信息 修改或删除已有 chunk/asset 添加新的静态资源

-  场景：生成 HTML 入口文件 过滤无用资源 添加版本信息文件 生成 manifest 文件

#### eg

1. 基础生产html插件

```js
// simple-html-plugin.js
export default function simpleHtml() {
  return {
    name: 'simple-html',
    async generateBundle(outputOptions, bundle) {
      // 1. 筛选需要注入的JS文件
      const jsFiles = Object.keys(bundle).filter(name => name.endsWith('.js'))

      // 2. 生成HTML内容
      let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My App</title>
</head>
<body>
  <div id="app"></div>`

      // 3. 注入JS脚本
      jsFiles.forEach(file => {
        html += `\n  <script src="${file}"></script>`
      })

      html += '\n</body>\n</html>'

      // 4. 输出HTML文件
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: html
      })
    }
  }
}

```
这个插件会自动将所有 .js 文件注入到 HTML 中，包括动态导入的 chunk
可以运行一下 则生成了html文件

2. 资源过滤插件

```js
// filter-assets-plugin.js
export default function filterAssets() {
  return {
    name: 'filter-assets',
    generateBundle(_, bundle) {
      // 删除所有.map文件
      for (const fileName in bundle) {
        if (fileName.endsWith('.map')) {
          delete bundle[fileName]
        }
      }
    }
  }
}
```
可以删除.map 结尾的文件

3：生成带哈希的 Manifest 文件 记录所有输出文件的信息


```
// manifest-plugin.js
export default function manifestPlugin() {
  return {
    name: 'manifest',
    async generateBundle(_, bundle) {
      // 1. 创建空manifest对象
      const manifest = {}

      // 2. 遍历所有打包文件
      Object.keys(bundle).forEach(fileName => {
        const file = bundle[fileName]

        // 3. 只处理chunk和asset类型文件
        if (file.type === 'chunk' || file.type === 'asset') {
          manifest[fileName] = {
            size: file.code?.length || file.source?.length || 0, // 计算文件大小
            type: file.type // 记录文件类型
          }
        }
      })

      // 4. 生成manifest文件
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2) // 美化输出
      })
    }
  }
}
```


- 作用  部署前检查文件大小是否在预期范围内


4：自动化版本管理
```js
// version-plugin.js
export default function versionPlugin() {
  const version = new Date().toISOString().replace(/[:.]/g, '-')

  return {
    name: 'version',
    // 设置为最后执行的插件
    enforce: 'post',
    generateBundle(outputOptions, bundle) {
      const jsFiles = Object.keys(bundle).filter((fileName) => {
        const file = bundle[fileName]
        // 更全面的JS文件判断
        return (
          (file.type === 'chunk' && fileName.endsWith('.js')) ||
          (file.fileName && file.fileName.endsWith('.js'))
        )
      })

      // 处理所有JS文件
      jsFiles.forEach((fileName) => {
        const file = bundle[fileName]
        const newName = file.fileName
          ? file.fileName.replace('.js', `-${version}.js`)
          : fileName.replace('.js', `-${version}.js`)

        // 更新文件名引用
        if (file.fileName) file.fileName = newName
        if (file.facadeModuleId) file.facadeModuleId = newName

        // 在bundle中创建新条目
        bundle[newName] = file
        delete bundle[fileName]
      })

      // 生成版本信息文件
      this.emitFile({
        type: 'asset',
        fileName: 'version.txt',
        source: `Build Version: ${version}\nBuild Time: ${new Date()}\nFiles: ${jsFiles.join(', ')}`
      })
    }
  }
}

```

作用： 给所有JS文件添加构建版本号后缀 / 生成包含详细构建信息的 version.txt 文件
为什么需要这个插件：解决浏览器缓存问题｜部署追踪｜多版本共存｜

#### 关键API详解

1. bundle 对象结构：
```js
interface OutputBundle {
  [fileName: string]: OutputAsset | OutputChunk
}

interface OutputAsset {
  type: 'asset'
  name?: string
  source: string | Uint8Array
}

interface OutputChunk {
  type: 'chunk'
  code: string
  map?: SourceMap
}

```
2. emitFile 方法：

```js
this.emitFile({
  type: 'asset' | 'chunk',
  name?: string,       // 资源名称
  fileName?: string,   // 输出文件名
  source?: string,     // 资源内容
  code?: string        // 仅chunk类型需要
})
```

#### 常见问题
Q：generateBundle 和 writeBundle 有什么区别？
A：generateBundle 是在内存中操作打包结果，writeBundle 是在文件写入磁盘后触发

Q：如何修改已有 chunk 的内容？
A：直接修改 bundle 对象中对应 chunk 的 code 属性

Q：为什么我的 emitFile 没有生效？
A：检查是否在 generateBundle 钩子中使用，其他阶段可能无法使用此方法

Q：如何只处理特定类型的文件？
A：可以通过 bundle 对象的 type 属性判断：

```js
if (bundle[fileName].type === 'asset') {
  // 处理静态资源
}
```
