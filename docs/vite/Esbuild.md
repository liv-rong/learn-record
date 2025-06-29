# Esbuild  依赖预编译`、`TS 语法转译`、`代码压缩


## 1 Esbuild为啥性能高
- 1. **使用 Golang 开发**，构建逻辑代码直接被编译为原生机器码，而不用像 JS 一样先代码解析为字节码，然后转换为机器码，
- 2. **多核并行**。内部打包算法充分利用多核 CPU 优势，所有的步骤尽可能并行，这也是得益于 Go 当中多线程共享内存的优势。
- 3. **从零造轮子**。 几乎没有使用任何第三方库，所有逻辑自己编写，大到 AST 解析，小到字符串的操作，保证极致的代码性能。
- 4. **高效的内存利用**。Esbuild 中从头到尾尽可能地复用一份 AST 节点数据，而不用像 JS 打包工具中频繁地解析和传递 AST 数据（如 string -> TS -> JS -> string)，造成内存的大量浪费。

## 2. Esbuild 功能使用

### 2.1 命令调用
```js
//安装 ╰
pnpm add esbuild --save-dev
pnpm install react react-dom
pnpm add @types/react @types/react-dom --save-dev
//新建 src/index.JSX Greet 组件引入
import Server from 'react-dom/server'
import Greet from './Greet'
console.log(Server.renderToString(<Greet />))



//esbuild 命令行调用
//指定入口文件 src/index.jsx
//bundle 启用打包模式，会将所有依赖合并到一个文件中
//outfile=dist/out.js 输出文件为 dist/out.js
  "scripts": {
    "build": "esbuild src/index.jsx --bundle --outfile=dist/out.js --define:process.env.NODE_ENV='\"production\"'"
  },
```

### 2.2 代码调用
Esbuild 对外暴露了API `Build API`和`Transform API`
#### 2.2.1 项目打包——Build API
- `build`
- `buildSync` 和 build 用法类似 同步函数



```js
// 引入 esbuild 的 build 方法，用于执行构建任务
const { build } = require('esbuild')

// 定义异步构建函数
async function runBuild() {
  // 调用 esbuild 的 build 方法进行构建，返回一个 Promise
  const result = await build({
    // ---- 基本配置 ----
    // 设置当前工作目录为项目根目录
    // process.cwd() 返回 Node.js 进程的当前工作目录
    absWorkingDir: process.cwd(),

    // 指定入口文件，可以是数组形式指定多个入口
    entryPoints: ['./src/index.jsx'],

    // 指定输出目录，打包后的文件将放在这个目录下
    outdir: 'dist',

    // ---- 打包配置 ----
    // 是否打包所有依赖，true 表示将依赖项内联到输出文件中
    bundle: true,

    // 输出模块格式，可选:
    // 'esm' - ES 模块
    // 'cjs' - CommonJS
    // 'iife' - 立即执行函数
    format: 'esm',

    // 排除不需要打包的依赖项（保持外部引用）
    // 这里为空数组表示打包所有依赖
    external: [],

    // 是否启用代码分割（当 format 为 'esm' 时可用）
    // true 表示将共享代码拆分为单独的文件
    splitting: true,

    // ---- 输出配置 ----
    // 是否生成 sourcemap 文件，true 表示生成
    // 有助于调试，但会增加构建时间
    sourcemap: true,

    // 是否生成元信息文件，true 表示生成
    // 包含输入输出文件信息，可用于分析构建结果
    metafile: true,

    // 是否压缩代码，false 表示不压缩
    // 生产环境建议设为 true
    minify: false,

    // 是否将输出写入磁盘，true 表示写入
    // 设为 false 则只返回结果不生成文件
    write: true,

    // ---- 加载器配置 ----
    // 指定不同文件类型的处理方式
    loader: {
      '.png': 'base64' // 将 png 图片转为 base64 内联
      // 其他常见 loader:
      // '.js'/'jsx': 'jsx' - 处理 JSX 文件
      // '.ts'/'tsx': 'tsx' - 处理 TypeScript 文件
      // '.json': 'json' - 处理 JSON 文件
      // '.txt': 'text' - 作为纯文本处理
    }
  })

  // 打印构建结果
  // 如果 metafile 为 true，result.metafile 包含构建详情
  console.log(result)
}

// 执行构建函数，并捕获可能的错误
runBuild().catch((e) => {
  console.error('构建失败:', e)
  process.exit(1) // 如果出错，以错误码退出进程
})

```

//执行 node build.js 就会有打包后的结果


- context() + serve()
为什么要用 context？

像"工作台"一样保存所有配置 可以同时支持 serve 和 watch 模式 避免重复初始化，速度更快

```js
// 热更新示例
const workshop = await context({ /* 配置 */ })
await workshop.watch() // 开启监视模式
await workshop.serve({ /* 服务配置 */ })
```
常见配置项
- port: 端口号（建议3000/8080）

- servedir: 静态文件目录

- onRequest: 可以记录每个请求



```js
const { context } = require('esbuild')

async function openTeaShop() {
  try {
    // 1. 布置工作台
    const workshop = await context({
      entryPoints: ['./src/index.jsx'],
      outdir: 'dist',
      bundle: true,
      format: 'esm',
      sourcemap: true,
      loader: { '.png': 'file' }
    })


    const shop = await workshop.serve({
      port: 3000,
      servedir: 'dist',
      host: 'localhost'
    })


    process.on('SIGINT', async () => {
      await workshop.dispose()
      process.exit(0)
    })

  } catch (error) {
    process.exit(1)
  }
}


openTeaShop()
```

img 14


#### 2.2.2 单文件转译——Transform API

##### 1.什么是 Transform API？
- 快速把一段 TypeScript 代码翻译成 JavaScript

- 不需要打包整个项目，只翻译当前文件

- 支持多种"语言"（TS、JSX、TSX等）

##### 2.基本使用方式
异步/同步
```js
const { transform } = require('esbuild')

async function translateCode() {
  // 准备要翻译的代码
  const tsCode = `const isNull = (str: string): boolean => str.length > 0;`

  // 请翻译官工作（异步方式）
  const result = await transform(tsCode, {
    loader: 'tsx',      // 告诉翻译官这是 TS 代码
    sourcemap: true     // 生成翻译对照表
  })

  console.log('翻译结果:', result)
  /* 输出:
  {
    code: 'const isNull = (str) => str.length > 0;\n',
    map: '{"version":3,...}',
    warnings: []
  }
  */
}

translateCode()
```

img 15
不推荐同步方法 异步可以同时处理其他任务


配置选项详
```js
await transform(code, {
  loader: 'tsx',       // 指定代码类型
  sourcemap: true,     // 生成sourcemap
  minify: true,        // 是否压缩
  target: 'es2015',    // 目标JS版本
  format: 'cjs',       // 输出格式(commonjs/esm)
  jsxFactory: 'h',     // JSX工厂函数名
  jsxFragment: 'Fragment' // JSX片段组件
})
```


##### 3.实际应用场景
- JSX 转译
```js
const jsxCode = `
  function App() {
    return <div>Hello <span>world</span></div>
  }
`

transform(jsxCode, { loader: 'jsx' }).then(({ code }) => {
  console.log(code)
  /* 输出:
  function App() {
    return React.createElement("div", null, "Hello ", React.createElement("span", null, "world"));
  }
  */
})
```






## 3.Esbuild 插件开发

### 3.1基本概念

- 处理特定类型文件

- 修改模块路径

- 注入环境变量

基本结构
```js
const myPlugin = {
  name: 'name', // 给插件起个名字
  setup(build) {    // 安装到主机器上的接口
    // 在这里添加各种"功能按键"（钩子）
  }
}
```

核心钩子介绍

1. 路径钩子
```js
build.onResolve({ filter: /^env$/ }, (args) => {
  console.log('正在查找模块:', args.path)
  return {
    path: args.path,      // 模块路径
    namespace: 'env-ns'   // 给模块加个"商标"
  }
})
```

2. 内容加载钩子
```js
//当需要读取文件内容时触发

javascript
build.onLoad({ filter: /.*/, namespace: 'env-ns' }, () => {
  return {
    contents: JSON.stringify({  // 返回文件内容
      API_URL: process.env.API_URL || 'http://default.api'
    }),
    loader: 'json'  // 告诉Esbuild这是JSON
  }
})
```

eg:
```js
const imagePlugin = {
  name: 'image-loader',
  setup(build) {
    build.onLoad({ filter: /\.(png|jpg)$/ }, async (args) => {
      const image = await fs.promises.readFile(args.path)
      return {
        contents: `export default "${image.toString('base64')}"`,
        loader: 'js'
      }
    })
  }
}
```
eg 自动生成HTML插件
```js
```



### 3.2 钩子函数的使用


### 3.3 eg


