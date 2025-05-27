## Rendering

### 1. 基础渲染结构

```tsx
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

const MyEditor = () => {
  const [editor] = useState(() => withReact(createEditor()))

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
    >
      <Editable />
    </Slate>
  )
}
```

### 2. 自定义元素渲染

#### 1. 使用 renderElement 渲染自定义节点

```tsx
const renderElement = useCallback(({ attributes, children, element }) => {
  switch (element.type) {
    case 'heading':
      return <h1 {...attributes}>{children}</h1>
    case 'quote':
      return (
        <blockquote
          {...attributes}
          style={{ borderLeft: '2px solid #ddd', paddingLeft: 10 }}
        >
          {children}
        </blockquote>
      )
    case 'code':
      return (
        <pre {...attributes}>
          <code>{children}</code>
        </pre>
      )
    default:
      return <p {...attributes}>{children}</p>
  }
}, [])

// 在 Editable 中使用
<Editable renderElement={renderElement} />

```

#### 2. 复杂元素组件示例

```tsx
// 自定义链接组件
const LinkElement = ({ attributes, children, element }) => {
  return (
    <a
      {...attributes}
      href={element.url}
      style={{
        color: '#0366d6',
        textDecoration: 'underline',
        cursor: 'pointer'
      }}
      onClick={(e) => {
        e.preventDefault()
        window.open(element.url, '_blank')
      }}
    >
      {children}
    </a>
  )
}

// 在 renderElement 中使用
case 'link':
  return <LinkElement {...props} />
```

### 3. 文本格式渲染

#### 1. 使用 renderLeaf 渲染文本样式

```tsx
const renderLeaf = useCallback(({ attributes, children, leaf }) => {
  return (
    <span
      {...attributes}
      style={{
        backgroundColor: leaf.highlight ? '#fff8c5' : 'inherit',
        color: leaf.comment ? '#6a737d' : 'inherit',
        fontFamily: leaf.code ? 'monospace' : 'inherit'
      }}
    >
      {children}
    </span>
  )
}, [])
```

### 4. 装饰器(Decorations)应用

- 装饰器用于动态文本样式，如语法高亮、搜索匹配等

#### 1. 搜索高亮实现

```tsx
const decorate = useCallback(([node, path]) => {
  const ranges = []

  if (Text.isText(node) && searchText) {
    const { text } = node
    const parts = text.split(searchText)
    let offset = 0

    parts.forEach((part, i) => {
      if (i !== 0) {
        ranges.push({
          anchor: { path, offset: offset - searchText.length },
          focus: { path, offset },
          highlight: true
        })
      }

      offset = offset + part.length + searchText.length
    })
  }

  return ranges
}, [searchText])

// 在 Editable 中使用
<Editable decorate={decorate} />


const renderLeaf = useCallback(({ attributes, children, leaf }) => {
  return (
    <span
      {...attributes}
      style={{
        backgroundColor: leaf.highlight ? '#ffeb3b' : null,
      }}
    >
      {children}
    </span>
  )
}, [])

```

### 5. 叶子节点(Leaf)渲染

#### 1. 什么是叶子节点？

- 叶子节点是文本内容的最小渲染单元

- 每个叶子节点包含相同格式的文本片段

- Slate 自动将文本分割为多个叶子节点来处理格式重叠

### 6. 文本结点渲染

- renderLeaf 适用于处理叶子节点的样式，能够根据每个叶子的属性进行自定义渲染。

- renderText 适用于一次性渲染整个文本节点，将所有叶子包装在一起，适合添加统一的样式或结构。

```tsx
const MyEditor = () => {
  const renderLeaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
      return <strong {...attributes}>{children}</strong>
    }
    return <span {...attributes}>{children}</span>
  }

  const renderText = useCallback(({ attributes, children }) => {
    return (
      <span
        {...attributes}
        className="custom-text"
      >
        {children}
      </span>
    )
  }, [])

  return (
    <Editable
      renderText={renderText}
      renderLeaf={renderLeaf}
    />
  )
}
```

### 7. 性能优化建议

- 使用 useCallback：缓存渲染函数

- 减少装饰器复杂度：复杂装饰器会影响性能

- 虚拟滚动：对超长文档考虑使用虚拟滚动

- 选择性重渲染：通过 React.memo 优化组件

## Serializing

### 1. 文本

- 获取编辑器的值并返回纯文本：

```tsx
import { Node } from 'slate'

const serialize = (nodes) => {
  return nodes.map((n) => Node.string(n)).join('\n')
}
```

### 2. 序列化

- Slate 的 JSON 结构转换为其他格式（如 HTML）

#### 1.概念

- 递归处理：从根节点开始，深度优先遍历整个节点树

- 文本节点处理：最底层的文本节点需要处理文本样式（加粗、斜体等）

- 元素节点转换：将 Slate 元素类型映射到对应的 HTML 标签

```tsx
import escapeHtml from 'escape-html'
import { Text } from 'slate'

const serialize = (node) => {
  // 处理文本节点
  if (Text.isText(node)) {
    let string = escapeHtml(node.text) // 转义HTML特殊字符
    if (node.bold) {
      string = `<strong>${string}</strong>`
    }
    if (node.italic) {
      string = `<em>${string}</em>`
    }
    if (node.underline) {
      string = `<u>${string}</u>`
    }
    if (node.code) {
      string = `<code>${string}</code>`
    }
    return string
  }

  // 递归处理子节点
  const children = node.children.map((n) => serialize(n)).join('')

  // 根据元素类型转换为对应HTML
  switch (node.type) {
    case 'quote':
      return `<blockquote><p>${children}</p></blockquote>`
    case 'paragraph':
      return `<p>${children}</p>`
    case 'link':
      return `<a href="${escapeHtml(node.url)}">${children}</a>`
    case 'heading':
      return `<h${node.level}>${children}</h${node.level}>`
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'list-item':
      return `<li>${children}</li>`
    case 'image':
      return `<img src="${escapeHtml(node.url)}" alt="${escapeHtml(node.alt || '')}"/>`
    default:
      return children
  }
}
```

### 3. 反序列化

- 反序列化是指将非 Slate 格式的数据（如 HTML）转换为 Slate 能够处理的 JSON 结构的过程

#### 1.slate-hyperscript

- 是一个帮助构建 Slate 内容树的工具，用于反序列化操作

```tsx
import { jsx } from 'slate-hyperscript'

const input = (
  <fragment>
    <element type="paragraph">A line of text.</element>
  </fragment>
)
//会被编译为：

javascript
const input = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text.' }]
  }
]
```

#### 2.例子

```tsx
import { jsx } from 'slate-hyperscript'

// 定义反序列化函数
const deserialize = (el, markAttributes = {}) => {
  // 处理文本节点
  if (el.nodeType === Node.TEXT_NODE) {
    return jsx('text', markAttributes, el.textContent)
  }
  // 忽略非元素节点
  else if (el.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  // 复制当前文本属性
  const nodeAttributes = { ...markAttributes }

  // 定义文本节点的样式属性
  switch (el.nodeName) {
    case 'STRONG':
      nodeAttributes.bold = true
      break
    case 'EM':
      nodeAttributes.italic = true
      break
    case 'U':
      nodeAttributes.underline = true
      break
    case 'CODE':
      nodeAttributes.code = true
      break
  }

  // 递归处理子节点
  const children = Array.from(el.childNodes)
    .map((node) => deserialize(node, nodeAttributes))
    .flat()

  // 确保至少有一个子节点
  if (children.length === 0) {
    children.push(jsx('text', nodeAttributes, ''))
  }

  // 处理元素节点
  switch (el.nodeName) {
    case 'BODY':
      return jsx('fragment', {}, children)
    case 'BR':
      return '\n'
    case 'BLOCKQUOTE':
      return jsx('element', { type: 'quote' }, children)
    case 'P':
      return jsx('element', { type: 'paragraph' }, children)
    case 'A':
      return jsx('element', { type: 'link', url: el.getAttribute('href') }, children)
    case 'H1':
      return jsx('element', { type: 'heading', level: 1 }, children)
    case 'H2':
      return jsx('element', { type: 'heading', level: 2 }, children)
    case 'UL':
      return jsx('element', { type: 'bulleted-list' }, children)
    case 'LI':
      return jsx('element', { type: 'list-item' }, children)
    default:
      return children
  }
}

// 使用示例
const html = `
<p>An opening paragraph with a <a href="https://example.com">link</a> in it.</p>
<blockquote><p>A wise quote.</p></blockquote>
<p>A closing paragraph!</p>
`

const document = new DOMParser().parseFromString(html, 'text/html')
const fragment = deserialize(document.body)

console.log(fragment)

//输出
[
  {
    type: 'paragraph',
    children: [
      { text: 'An opening paragraph with a ' },
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ text: 'link' }],
      },
      { text: ' in it.' },
    ],
  },
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'A wise quote.' }],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: 'A closing paragraph!' }],
  },
]
```

## Normalizing

### 1. Slate 的内置约束

#### 1. 元素节点必须有文本后代

```tsx
// 无效结构
{
  type: 'paragraph',
  children: [] // 空数组
}

// 规范化后
{
  type: 'paragraph',
  children: [{ text: '' }] // 自动添加空文本节点
}

```

#### 2. 合并相邻的相同格式文本

```tsx
// 原始内容
;[
  { text: 'Hello', bold: true },
  { text: ' world', bold: true }
][
  // 规范化后
  { text: 'Hello world', bold: true }
]
```

#### 3. 块节点内容一致性

块节点（如段落）的子节点只能是：

- 其他块节点

- 内联节点（如链接）

- 文本节点

```tsx
{
  type: 'paragraph',
  children: [
    { type: 'image', url: '...' }, // 图像是void元素，不能作为段落子节点
    { text: 'text' }
  ]
}
```

### 2. 自定义规范化实践

eg1：确保标题只有文本内容

```tsx
const withHeadings = (editor) => {
  const { normalizeNode } = editor

  editor.normalizeNode = (entry) => {
    const [node, path] = entry

    if (Element.isElement(node) && node.type === 'heading') {
      // 检查子节点是否都是文本或内联元素
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && !editor.isInline(child)) {
          // 解包块级子元素
          Transforms.unwrapNodes(editor, { at: childPath })
          return // 修复后退出，会触发新一轮规范化
        }
      }
    }

    normalizeNode(entry) // 执行默认规范化
  }

  return editor
}
```

eg2：确保链接必须有 URL

```tsx
const withLinks = (editor) => {
  const { normalizeNode } = editor

  editor.normalizeNode = (entry) => {
    const [node, path] = entry

    if (Element.isElement(node) && node.type === 'link' && !node.url) {
      // 无效链接处理方案1：移除链接但保留文本
      Transforms.unwrapNodes(editor, { at: path })
      return

      // 或方案2：设置默认URL
      // Transforms.setNodes(editor, { url: '#' }, { at: path })
      // return
    }

    normalizeNode(entry)
  }

  return editor
}
```

### 3. 规范化执行流程

1. 多遍处理示例 初始无效内容：

```tsx
javascript[
  {
    type: 'paragraph',
    children: [
      {
        type: 'paragraph', // 非法嵌套段落
        children: [{ text: 'Hello' }]
      }
    ]
  }
]
```

2. 规范化过程：

- 第一遍：发现内层段落是块元素不能作为段落子节点

- 解包内层段落 → 变成两个同级段落

- 第二遍：检查新结构是否符合规则

- 现在结构有效，停止规范化

```tsx
;[
  {
    type: 'paragraph',
    children: [{ text: 'Hello' }]
  },
  {
    type: 'paragraph',
    children: [{ text: '' }] // 自动添加的空文本节点
  }
]
```

### 4. 性能优化技巧

- 使用 withoutNormalizing 批量操作

```tsx
// 低效写法（每次变换都触发规范化）
Transforms.unwrapNodes(editor, ...)
Transforms.wrapNodes(editor, ...)
Transforms.setNodes(editor, ...)

// 高效写法（所有变换完成后才规范化）
Editor.withoutNormalizing(editor, () => {
  Transforms.unwrapNodes(editor, ...)
  Transforms.wrapNodes(editor, ...)
  Transforms.setNodes(editor, ...)
})
```

## TypeScript

## Migrating

```

```

```

```
