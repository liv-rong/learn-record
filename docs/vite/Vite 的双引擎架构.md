Vite 底层所深度使用的两个构建引擎——`Esbuild`和`Rollup`


## Esbuild

### 1. 作用：

#### 1. 依赖预构建——作为 Bundle 工具

- img 13
- 第三方依赖，需要在应用启动前进行**打包**并且**转换为 ESM 格式**

Esbuild 作为打包工具也有一些缺点。

- 不支持降级到 `ES5` 的代码。这意味着在低端浏览器代码会跑不起来。
- 不支持 `const enum` 等语法。这意味着单独使用这些语法在 esbuild 中会直接抛错。
- 不提供操作打包产物的接口，像 Rollup 中灵活处理打包产物的能力(如`renderChunk`钩子)在 Esbuild 当中完全没有。
- 不支持自定义 Code Splitting 策略。

总结：有如此多的局限性， Vite 在**开发阶段**使用它成功启动项目并获得极致的**性能提升**，生产环境 Rollup 作为依赖打包工具了。

#### 2、单文件编译——作为 TS 和 JSX 编译工具

##### 1. Vite 使用 Esbuild 来处理 TypeScript 和 JSX 文件的编译，主要解决了传统工具的两个痛点：

- 速度问题：Babel 和 TSC（TypeScript 编译器）速度较慢

- 开发体验：即时编译提升开发效率

##### 2.Esbuild 在 Vite 中的工作方式
- 开发环境： 即时编译单个文件 不打包，按需编译 极快的热更新

- 生产环境：使用 Esbuild 进行代码转译 但会额外处理低端浏览器兼容问题

```bash
graph TD
    A[源代码 TS/JSX] --> B{开发环境?}
    B -->|是| C[Esbuild 即时编译]
    B -->|否| D[Esbuild 生产编译]
    D --> E[Polyfill 注入]
    E --> F[最终打包代码]
```

##### 3.局限性
- 不做类型检查 语法比较新 面向现代浏览器
```ts
// 输入
let num: number = "hello"; // 类型错误但能编译通过

// Esbuild 输出
let num = "hello";
```

#### 3.代码压缩：
- Vite 从 2.6 版本开始默认使用 Esbuild 进行生产环境的代码压缩（包括 JS 和 CSS）
- 优势 速度快 压缩质量不打折
```bash
graph TD
    A[源代码] --> B[Esbuild 打包]
    B --> C[Esbuild 压缩]
    C --> D[最终产物]

    style C fill:#f9f,stroke:#333
```

##### 1. 为什么 Esbuild 这么快
- . AST（抽象语法树）共享
传统流程：Babel 和 Terser 各自解析 AST，重复工作
Esbuild：整个流程共享同一个 AST
```js
// 传统工具流程
源代码 → Babel解析AST → Babel转换 → Terser解析新AST → Terser压缩

// Esbuild流程
源代码 → 解析一次AST → 所有操作基于同一AST
```
##### 2. 使用 Go 语言编写
- JS（Terser）：解释性语言，执行效率较低
- Go（Esbuild）：编译型语言，适合 CPU 密集型任务

注意
- CSS 压缩同样受益：Esbuild 也能高效压缩 CSS

- 低版本浏览器支持：Esbuild 默认面向现代浏览器，如需兼容旧版需配合 @vitejs/plugin-legacy

- 特殊需求场景：如需删除 console.log 等特殊操作，可能需要配合其他工具


## Rollup


### 1.为什么 Vite 选择 Rollup 作为打包核心？

- 成熟稳定

- 生态丰富

- ESM 原生支持

###  2.Rollup 在 Vite 中的三大核心优化

#### 1. CSS 代码分割（提升缓存利用率）

```js
import './styles.css' // 该CSS会被自动提取为单独文件

//产物
dist/
  ├── assets/
  │   ├── index.js
  │   ├── async-module.js
  │   └── styles.css  ← 被提取的CSS文件

```

####  2. 自动预加载（加速页面加载）
```html
<head>
  <script type="module" src="/assets/index.js"></script>
  <link rel="modulepreload" href="/assets/vendor.js"> ← 预加载关键依赖
  <link rel="modulepreload" href="/assets/utils.js">  ← 预加载工具库
</head>

```



#### 3. 异步 Chunk 优化（减少网络往返）

```js
//优化前
加载 A → 发现需要 C → 加载 C
加载 B → 发现需要 C → 已缓存
//总耗时：A + C + B = 800ms


//优化后
同时加载 A 和 C
加载 B 时 C 已缓存
//总耗时：max(A, C) + B = 500ms
```

#### 4.插件机制：Vite 与 Rollup 的完美融合
