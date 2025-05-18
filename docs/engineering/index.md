# 前端工程化

## 什么是前端工程化

- 标准化流程 （代码风格）
- 开发流程优化（构建、编译、打包）
- 代码规范与质量（ESLint、Prettier、TypeScript）
- 模块化与组件化（组件库、Monorepo）
- 自动化（CI/CD、测试、部署 Docker GitHub Actions）
- 性能优化（Bundle 分析、懒加载、缓存）

## 前端工程化核心工具链

2.1 包管理工具 （npm、yarn、pnpm）
2.2 构建工具 （webpack、rollup、vite）
2.3 代码规范与质量工具 （ESLint、Prettier、TypeScript,Stylelint）
2.4 模块化与组件化工具 （webpack、rollup、vite）

## 现代前端工程化实践

## 统一规范

- 代码规范统一：通过 ESLint + Prettier + Husky 强制约束代码风格，避免因缩进、命名等细节争议浪费开发时间。
- 协作流程标准化：明确 Git 分支策略（如简化版 Git Flow）、Commit 信息格式（Commitizen 规范），确保代码历史可追溯。

### .editorconfig

1. 代码格式化和文件风格的规则 让不同的开发者在使用不同的编辑器时，都能够保持一致的代码风格
2. .editorconfig 文件主要配置以下几类属性：缩进风格、缩进大小、换行符、字符编码、行末空白、文件末尾新行等。

```tsx
root = true //指定此文件为根配置文件，子目录中的其他 .editorconfig 文件将被忽略。

[*] // [pattern] - 文件匹配模式 [*.js] 匹配所有 JavaScript 文件，[*.{html,css}] 匹配 HTML 和 CSS 文件

charset = utf-8 //编码
end_of_line = lf //：使用换行符 LF（Line Feed），适用于 Unix 和 Linux 系统 lf 表示换行符为 Line Feed (\n)，crlf 表示 Carriage Return and Line Feed (\r\n)，cr 表示 Carriage Return (\r)
indent_size = 2 //缩进大小设置为 2 个空格
// tab_width = 4 //制表符宽度为 4 个空格
indent_style = space // 使用空格进行缩进，而不是制表符（Tab）
insert_final_newline = true //在文件末尾插入一个新行
trim_trailing_whitespace = true // 删除行尾的空白字符
max_line_length = 80  //如果设置为 off，则不对行的长度进行限制。

```

#### 为啥需要配置

- .editorconfig 提供文件级别的基础规范控制，适用于所有文件类型；而 Prettier 是代码自动格式化工具，专注于代码风格优化。
- 基本文件格式规范
- 避免因编辑器差异导致的代码风格问题
- 字符编码和换行符的管理
- 支持非编程语言的文件格式

### husky

husky 是一个用于简化 Git 钩子（hooks）的设置的工具，允许开发者轻松地在各种 Git 事件触发时运行脚本。例如，在提交之前（pre-commit）、推送之前（pre-push）、或者在提交信息被写入后（commit-msg）等。

在提交或推送时，自动化 检查提交信息、检查代码 和 运行测试。

1.安装 husky

```bash
npm install husky --save-dev
```

2.初始化 husky

```bash
pnpm add --save-dev husky
```

2. husky init
   init 命令简化了项目中的 husky 设置。它会在 .husky/ 中创建 pre-commit 脚本，并更新 package.json 中的 prepare 脚本

```bash
pnpm exec husky init
```

### lint-staged

lint-staged 是一个工具，用于在 Git 暂存区（staged files）上运行指定的命令（如 ESLint、Prettier、Stylelint 等），通常用于在提交代码前自动检查或格式化修改过的文件

- 仅检查暂存区的文件（而不是整个项目）。
- 与 Git Hooks（如 husky）结合，在 git commit 前自动执行检查或修复。

- 修改.husky/pre-commit 脚本的内容，将.husky/pre-commit 脚本的内容改为 npm run lint-staged

### commitlint

配置提交校验，commitlint 可以帮助我们进行 git commit 时的 message 格式是否符合规范

1. 安装

```bash
pnpm add --save-dev @commitlint/{cli,config-conventional}
```

2. 配置 commitlint 以使用常规配置

```bash
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "test", "chore", "revert"]
    ],
    "subject-case": [2, "always", "lower-case"]
  }
}
```

- type-enum: 允许的提交类型（feat, fix, docs 等）。

- subject-case: 提交信息主题的格式（如强制小写）

3. 添加钩子

- 要使用 commitlint，您需要设置 commit-msg 钩子（目前 pre-commit 不支持钩子）

```bash
pnpm add --save-dev husky

pnpm husky install

# Add commit message linting to commit-msg hook
echo "pnpm dlx commitlint --edit \$1" > .husky/commit-msg
# Windows users should use ` to escape dollar signs
echo "pnpm dlx commitlint --edit `$1" > .husky/commit-msg

```

4. 配置可视化的提交提示

## 模块化与组件化

### 模块化

#### CommonJS

- 主要用于 Node.js（服务器端）同步加载模块（适合磁盘读取，不适合浏览器网络请求）

```tsx
// 导出模块（module.js）
module.exports = {
  name: 'Alice',
  sayHello: function () {
    console.log('Hello!')
  }
}
```

```tsx
// 导入模块（main.js）
const obj = require('./module.js')
obj.sayHello() // 输出: Hello!
```

#### ES6 Module

- export default 导出默认模块

- 现代浏览器和 Node.js 均支持

- 静态化（编译时确定依赖），支持静态分析和摇树优化（Tree Shaking）。

- 导出的值是引用（修改原模块会影响导入的值）。

- 浏览器中需用 `<script type="module">`标签。

#### AMD

主要用于浏览器端异步加载模块

#### CMD

- 类似 AMD，但更贴近 CommonJS 的写法
