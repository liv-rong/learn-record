## Transforms

- Slate 的数据结构是不可变的 无法直接修改或删除节点
- Slate 提供了一系列“变换”函数，允许您更改编辑器的值。

1. 通过 unwrapNodes 块元素的每个父元素来展平语法树

```tsx
Transforms.unwrapNodes(editor, {
  at: [], // Path of Editor
  match: (node) =>
    !Editor.isEditor(node) && node.children?.every((child) => Editor.isBlock(editor, child)),
  mode: 'all' // also the Editor's children
})
```

2 .Editor.nodes 创建一个 NodeEntries 的 JavaScript 迭代器，并使用 for..of 循环来执行。
例如，要将所有图像元素替换为其 alt 文本：

```tsx
const imageElements = Editor.nodes(editor, {
  at: [], // Path of Editor
  match: (node, path) => 'image' === node.type
  // mode defaults to "all", so this also searches the Editor's children
})
for (const nodeEntry of imageElements) {
  const altText =
    nodeEntry[0].alt || nodeEntry[0].title || /\/([^/]+)$/.exec(nodeEntry[0].url)?.[1] || '☹︎'
  Transforms.select(editor, nodeEntry[1])
  Editor.insertFragment(editor, [{ text: altText }])
}
```

### Selection Transforms

```tsx
Transforms.select(editor, {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [1, 0], offset: 2 }
})
```

但它们也可能更加复杂。

eg:以下是将光标向后移动三个单词的方法：

```tsx
Transforms.move(editor, {
  distance: 3, // 移动的距离（这里是 3 个单位）
  unit: 'word', // 单位是 "word"（按单词计算）
  reverse: true // 是否反向移动（true 表示向左/向后，false 表示向右/向前）
})
```

### Text Transforms

eg: 如何将一串文本插入为特定点

```tsx
Transforms.insertText(editor, 'some words', {
  at: { path: [0, 0], offset: 3 }
})
```

eg: 删除整个范围内的所有内容

```tsx
Transforms.delete(editor, {
  at: {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [1, 0], offset: 2 }
  }
})
```

### Node Transforms

- 节点变换作用于组成编辑器值的各个元素和文本节点

eg: 在特定路径上插入一个新的文本节点

```tsx
Transforms.insertNodes(
  editor,
  {
    text: 'A new string of text.'
  },
  {
    at: [0, 1]
  }
)
```

eg: 将节点从一条路径移动至另一条路径：

```tsx
Transforms.moveNodes(editor, {
  at: [0, 0],
  to: [0, 1]
})
```

### The at Option

eg: 插入文本时，这会将字符串插入用户当前光标处：

```tsx
Transforms.insertText(editor, 'some words')
```

eg: 这会将其插入到特定点

```tsx
Transforms.insertText(editor, 'some words', {
  at: { path: [0, 0], offset: 3 }
})
```

eg: 要用新字符串替换一定范围的文本，您可以执行以下操作：

```tsx
Transforms.insertText(editor, 'some words', {
  at: {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 3 }
  }
})
```

- 如果您指定一个 Path 位置，它将扩展到覆盖该路径上整个节点的范围。
- 然后，使用基于范围的行为，它将删除该节点的所有内容，并将其替换为您的文本。

eg: 要用新字符串替换整个节点的文本

```tsx
Transforms.insertText(editor, 'some words', {
  at: [0, 0]
})
```

### The match Option

- 允许你精确控制哪些节点会被变换操作影响

1. at 和 match 的关系

- at 定义了操作的范围（哪些节点会被考虑）
- match 在这个范围内进一步筛选（哪些节点会被实际操作）
- 不提供 match，许多操作会默认只匹配 at 路径指向的精确节点

2. 例子

- eg: 移动节点的所有子节点

```tsx
// 移动节点 [2] 的所有子节点到 [5]
Transforms.moveNodes(editor, {
  at: [2], // 范围是节点 [2] 内部
  match: (node, path) => path.length === 2, // 只匹配子节点（路径长度为2）
  to: [5]
})
```

- eg: 为所有非斜体的文本节点添加粗体

```tsx
Transforms.setNodes(
  editor,
  { bold: true }, // 设置 bold 属性
  {
    at: [], // 整个编辑器范围
    match: (node) =>
      Text.isText(node) && // 是文本节点
      node.italic !== true // 且不是斜体
  }
)
```

- eg: 基于父节点的匹配

```tsx
// 只修改列表项中的段落
Transforms.setNodes(
  editor,
  { color: 'red' },
  {
    at: [],
    match: (node, path) => {
      if (!Text.isText(node)) return false
      const parent = Node.parent(editor, path)
      return parent.type === 'list-item'
    }
  }
)
```

- eg: 组合多个条件

```tsx
// 修改所有标题中长度大于10的文本节点
Transforms.setNodes(
  editor,
  { fontSize: 'large' },
  {
    at: [],
    match: (node, path) => {
      if (!Text.isText(node)) return false
      if (node.text.length <= 10) return false
      const parent = Node.parent(editor, path)
      return parent.type === 'heading'
    }
  }
)
```

3. 总结

- match 函数是 Slate 变换操作中的过滤器
- 实现复杂的批量修改逻辑

```tsx

```

## Operations

-操作是 Slate 中最基础、最细粒度的状态变更单元。每个操作都描述了对文档的一次最小修改。

1. Slate 内置了多种基础操作类型

```tsx
// 插入文本
{
  type: 'insert_text',
  path: [0, 0],       // 文本节点的路径
  offset: 15,         // 插入位置
  text: '插入的文字',  // 要插入的内容
  marks: []           // 文本样式标记
}

// 删除文本
{
  type: 'remove_text',
  path: [0, 0],
  offset: 5,
  text: '删除的文字',  // 被删除的内容
  marks: []
}


// 插入节点
{
  type: 'insert_node',
  path: [1],          // 插入位置
  node: {             // 要插入的节点
    type: 'paragraph',
    children: [{ text: '新段落' }]
  }
}

// 删除节点
{
  type: 'remove_node',
  path: [0],          // 被删除节点的路径
  node: {             // 被删除的节点内容
    type: 'paragraph',
    children: [{ text: '旧段落' }]
  }
}

// 修改节点属性
{
  type: 'set_node',
  path: [0],
  properties: {       // 原有属性
    type: 'paragraph'
  },
  newProperties: {    // 新属性
    type: 'heading',
    level: 1
  }
}

// 设置选区
{
  type: 'set_selection',
  properties: null,    // 原选区(null表示无选区)
  newProperties: {     // 新选区
    anchor: { path: [0,0], offset: 0 },
    focus: { path: [0,0], offset: 5 }
  }
}
```

2.高级变换与底层操作的关系

```tsx
// 高级API调用
Transforms.insertNodes(editor, {
  type: 'paragraph',
  children: [{ text: '新段落' }]
})

// 实际生成的操作序列
[
  {
    type: 'insert_node',
    path: [1],
    node: {
      type: 'paragraph',
      children: [{ text: '新段落' }]
    }
  },
  {
    type: 'set_selection',
    properties: {...当前选区...},
    newProperties: { anchor: { path: [1,0], offset: 0 }, focus: { path: [1,0], offset: 0 } }
  }
]

```

3. 例子

- 1：批量修改历史记录

```tsx
// 获取编辑器操作历史
const operations = editor.operations

// 筛选出所有文本插入操作
const textInsertions = operations.filter((op) => op.type === 'insert_text')

// 分析用户输入习惯
const totalChars = textInsertions.reduce((sum, op) => sum + op.text.length, 0)
```

4. 总结

- Slate 的所有变更最终都表现为一系列原子操作

- 操作类型主要包括：文本操作、节点操作和选区操作

- 高级 API 会自动生成合适的操作序列

## Commands

### 1.什么是命令？

- 命令代表用户的编辑意图，是高级别的编辑器操作接口
- 基于当前选区执行操作
- 表达用户直接意图（如"加粗"、"插入图片"）
- 内部会转换为一系列变换(Transforms)

### 2.内置命令示例

```tsx
// 插入文本（在选区位置）
Editor.insertText(editor, '这里是要插入的文字')

// 向后删除（如按退格键）
Editor.deleteBackward(editor, { unit: 'word' }) // 删除一个单词

// 插入换行（如按回车键）
Editor.insertBreak(editor)

// 添加文本样式
Editor.addMark(editor, 'bold', true) // 加粗
Editor.removeMark(editor, 'bold') // 取消加粗
```

### 3. 自定义命令

```tsx
const MyEditor = {
  ...Editor, // 继承原有Editor方法

  // 自定义插入图片命令
  insertImage(editor, url) {
    Transforms.insertNodes(editor, {
      type: 'image',
      url,
      children: [{ text: '' }] // 空文本节点
    })
  },

  // 自定义切换引用块命令
  toggleQuote(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === 'quote'
    })

    if (match) {
      // 如果已经是引用，则取消
      Transforms.unwrapNodes(editor, {
        match: (n) => n.type === 'quote'
      })
    } else {
      // 如果不是引用，则添加
      Transforms.wrapNodes(editor, {
        type: 'quote',
        children: []
      })
    }
  }
}

// 使用自定义命令
MyEditor.insertImage(editor, 'https://example.com/image.png')
MyEditor.toggleQuote(editor)
```

### 4. 命令与变换的关系

- 命令是面向用户的，变换是面向开发的
- 一个命令可能包含多个变换
- 命令通常基于当前选区，而变换需要明确位置
- 自定义命令通常通过组合变换实现

#### 例子

- 智能粘贴纯文本

  ```tsx
  const MyEditor = {
    ...Editor,

    pasteAsPlainText(editor) {
      // 1. 读取剪贴板文本
      navigator.clipboard.readText().then((text) => {
        // 2. 删除选区内容
        Editor.deleteFragment(editor)

        // 3. 插入纯文本（去除格式）
        Transforms.insertText(editor, text)
      })
    }
  }
  ```

- 表格插入命令

  ```tsx
  const TableEditor = {
  ...Editor,

  insertTable(editor, rows = 3, cols = 3) {
    // 创建表格结构
    const table = {
      type: 'table',
      children: Array.from({ length: rows }, () => ({
        type: 'table-row',
        children: Array.from({ length: cols }, () => ({
          type: 'table-cell',
          children: [{ text: '' }]
        }))
      })
    }

    // 插入表格
    Transforms.insertNodes(editor, table)

    // 将选区移动到第一个单元格
    Transforms.select(editor, {
      path: [0, 0, 0, 0], // 表格→第一行→第一单元格→文本节点
      offset: 0
    })
  }
  }
  ```

## Editor

### 1. Editor 核心属性

```tsx
interface Editor {
  // 文档内容（节点树）
  children: Node[]

  // 当前选区（可能为null）
  selection: Range | null

  // 未提交的操作队列
  operations: Operation[]

  // 待应用的文本格式
  marks: Omit<Text, 'text'> | null
}
```

### 2. 可重写的核心行为

```tsx
// 定义哪些是行内元素
editor.isInline = (element) => {
  return element.type === 'link' || element.type === 'mention' ? true : isInline(element)
}

// 定义哪些是void元素（不可编辑，如图片）
editor.isVoid = (element) => {
  return element.type === 'image' ? true : isVoid(element)
}

// 定义哪些void元素可以包含格式
editor.markableVoid = (element) => {
  return element.type === 'mention' ? true : markableVoid(element)
}
//2. 节点规范化
editor.normalizeNode = (entry) => {
  const [node, path] = entry

  // 对链接节点的特殊规范化
  if (Element.isElement(node) && node.type === 'link') {
    if (!node.url) {
      Transforms.unwrapNodes(editor, { at: path })
      return
    }
  }

  // 默认规范化处理
  normalizeNode(entry)
}
```

### 3. Editor 辅助方法

#### 1. 位置相关方法

```tsx
// 获取节点的起始位置
const start = Editor.start(editor, [0]) // 第一个节点的开始

// 获取节点的结束位置
const end = Editor.end(editor, [0, 0]) // 第一个节点的第一个子节点的结束

// 获取节点范围的字符串内容
const text = Editor.string(editor, [0]) // 第一个节点的文本内容
```

#### 2. 节点遍历方法

```tsx
// 遍历选区内的所有节点
Editor.nodes(editor, {
  at: editor.selection,
  match: (n) => Element.isElement(n) && n.type === 'paragraph'
})

// 遍历所有文本位置
Editor.positions(editor, {
  at: editor.selection,
  unit: 'word' // 按单词遍历
})
```

#### 3. 选区操作

```tsx
// 检查两点是否在同一位置
Editor.isEdge(editor, point, path)

// 获取两点之间的范围
Editor.range(editor, startPoint, endPoint)

// 获取当前选区的DOM范围
Editor.toDOMRange(editor, range)
```

## Plugins

### 1.插件基础概念

插件是 slate 中非常重要的概念，它允许我们自定义编辑器的行为。插件是一个函数，它接收一个编辑器对象，并返回一个编辑器对象。插件可以用于修改编辑器的行为，例如添加新的命令、修改节点的渲染方式等。

### 2.插件编写

```tsx
const withImages = (editor) => {
  const { isVoid } = editor

  // 将image节点标记为void元素（不可编辑）
  editor.isVoid = (element) => (element.type === 'image' ? true : isVoid(element))

  return editor
}

// 使用插件
const editor = withImages(createEditor())
```

### 2、插件组合模式

```tsx
//- Slate 支持插件链式组合，多个插件可以叠加使用：
// 组合多个插件
const createMyEditor = () => {
  return withImages(withLinks(withTables(createEditor())))
}

// 使用组合后的编辑器
const editor = createMyEditor()
```
