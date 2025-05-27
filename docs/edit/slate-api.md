# Slate 可编辑组件(Editable)全面解析

- Editable 是 Slate 编辑器的核心交互组件，负责渲染编辑器内容并处理用户输入

## Editable 基础用法

```tsx
import { Slate, Editable } from 'slate-react'

function MyEditor() {
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

## 核心属性详解

```tsx
// 动态切换
const [isReadOnly, setIsReadOnly] = useState(false)
<Editable readOnly={isReadOnly}  placeholder="请输入内容..."  />
```

## 自定义渲染

1. renderElement - 元素渲染

```tsx
const renderElement = useCallback(props => {
  switch (props.element.type) {
    case 'heading':
      return <h1 {...props.attributes}>{props.children}</h1>
    case 'quote':
      return <blockquote {...props.attributes}>{props.children}</blockquote>
    case 'code':
      return (
        <pre {...props.attributes}>
          <code>{props.children}</code>
        </pre>
      )
    default:
      return <p {...props.attributes}>{props.children}</p>
  }
}, [])

<Editable renderElement={renderElement} />

```

2. renderLeaf - 文本样式渲染

```tsx
jsx
const renderLeaf = useCallback(({ attributes, children, leaf }) => {
  return (
    <span
      {...attributes}
      style={{
        fontWeight: leaf.bold ? 'bold' : 'normal',
        fontStyle: leaf.italic ? 'italic' : 'normal',
        textDecoration: leaf.underline ? 'underline' : 'none',
        backgroundColor: leaf.highlight ? '#ffeeba' : 'inherit'
      }}
    >
      {children}
    </span>
  )
}, [])
<Editable renderLeaf={renderLeaf} />
```

3. renderPlaceholder - 自定义占位符

```tsx
<Editable
  placeholder="请输入内容..."
  renderPlaceholder={({ attributes, children }) => (
    <div
      {...attributes}
      style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        color: '#999',
        pointerEvents: 'none',
        fontSize: '15px'
      }}
    >
      {children}
    </div>
  )}
/>
```

## 高级功能

```tsx
const decorate = useCallback(([node, path]) => {
  const ranges = []

  if (Text.isText(node)) {
    // 高亮所有"TODO"文本
    const { text } = node
    const matches = [...text.matchAll(/TODO/g)]
    for (const match of matches) {
      ranges.push({
        anchor: { path, offset: match.index },
        focus: { path, offset: match.index + match[0].length },
        highlight: true
      })
    }
  }

  return ranges
}, [])

// 在renderLeaf中处理装饰
const renderLeaf = useCallback(({ attributes, children, leaf }) => {
  return (
    <span
      {...attributes}
      style={{
        backgroundColor: leaf.highlight ? '#ffeb3b' : 'inherit'
      }}
    >
      {children}
    </span>
  )
}, [])

<Editable decorate={decorate} renderLeaf={renderLeaf} />
```

- 2. scrollSelectionIntoView - 自定义滚动行为

```tsx
const scrollSelectionIntoView = useCallback((editor, domRange) => {
  // 默认实现
  domRange.startContainer.parentElement?.scrollIntoView({
    block: 'nearest',
    behavior: 'smooth'
  })
}, [])

<Editable scrollSelectionIntoView={scrollSelectionIntoView} />
```
