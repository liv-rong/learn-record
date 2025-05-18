# npm 私服

# 模块化

## CommonJS

- 模块导出

```js
module.exports = {
  foo: 'bar'
}
```

- 模块引入

```js
const mod = require('./mod')
```

## ES6

- 模块导出

```js
export const foo = 'bar'
```

- 模块引入

```js
import { foo } from './mod'
```

## Cjs 和 ESM 的区别

- Cjs 是同步加载，ESM 是异步加载
- Cjs 导出的是值，ESM 导出的是引用
- Cjs 导出的是浅拷贝，ESM 导出的是深拷贝
- Cjs 导出的是对象，ESM 导出的是对象或基本类型
- Cjs 可以动态加载，ESM 可以静态加载
- Cjs 可以在代码执行前加载，ESM 可以在代码执行后加载
- Cjs 是可以修改值的，esm 值并且不可修改（可读的）
- Cjs 不可以 tree shaking，esm 支持 tree shaking

# nodejs 全局变量

- process

  - process.env 环境变量
  - process.argv 命令行参数
  - process.cwd() 当前工作目录
  - process.nextTick() 下一次事件循环执行

- console
- \_\_dirname 当前模块所在目录绝对路径
- \_\_filename 当前模块文件的绝对路径 包括文件名和文件扩展名
- global
- require
- module
- exports

# CSR SSR SEO

## 事件循环

- 事件循环是 Node.js 实现异步的核心机制
- 事件循环的顺序：
