# npm

- npm 会采用依赖扁平化策略。
  以安装 axios 为例，npm 不仅会安装 axios 本身，还会将 axios 的所有依赖包（如 follow-redirects、proxy-from-env 等）提升（hoist）到项目根目录的 node_modules 下，而不是嵌套在 axios 的子目录中
- 引起幽灵依赖现象
  虽然我们的 package.json 中只声明了对 axios 的依赖，但由于 axios 依赖的 proxy-from-env 被扁平化安装到了顶层 node_modules 目录，我们可以在代码中直接使用：
- 空间浪费问题
  由于依赖被提升到了顶层 node_modules，因此每个依赖包都会被重复安装很多次。例如，项目中某个依赖的依赖项，在项目中其他依赖的依赖项中也会存在，这样就会造成空间浪费。

# pnpm

- “p” 代表”performant”（高性能），因此 pnpm 全称为 “performant npm” 速度和效率的 npm 版本。
- pnpm 采用硬链接和符号链接（symlink）的方式，将每个依赖包只安装一次，然后通过链接的方式共享给其他依赖项目，从而大大减小了磁盘空间的使用。
- pnpm 的依赖管理策略被称为“内容寻址存储”（content-addressable storage）。在这种策略下，每个依赖包都会被存储在一个唯一的路径下，这个路径是根据依赖包的内容计算出来的。这样，即使两个依赖包的名称相同，但它们的版本或内容不同，它们也会被存储在不同的路径下。
