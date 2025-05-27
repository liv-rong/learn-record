## Transforms

- Transforms 是操作文档的辅助函数。它们可以用来定义你自己的命令

### 节点选项

- 所有变换都支持一个参数 options

```tsx
interface NodeOptions {
  at?: Location
  match?: (node: Node, path: Location) => boolean
  mode?: 'highest' | 'lowest'
  voids?: boolean
}
```

- at 选项用于在编辑器中选择一个位置。默认为用户当前的选择。了解更多关于该 at 选项的信息

- match 选项使用自定义函数筛选节点集。详细了解该 match 选项

- mode 选项还过滤节点集。

- voids 为 false 时，void 元素被过滤掉。

### 静态方法 (官网)

## Location

- Location 接口是引用 Slate 文档中特定位置的方法的集合：路径、点或范围。方法通常接受 ，Location 而不是只需要 Path、Point 或 Range。

  `type Location = Path | Point | Range`

### Location

`type Location = Path | Point | Range`
`Location.isLocation(value: any) => value is Location`

### Path

- Path 数组是描述节点在 Slate 节点树中确切位置的索引列表。相对于根 Editor 对象，但它们可以相对于任何 Node 对象。

### PathRef

### Point

### PointEntry

### PointRef

- PathRef 是 Slate 编辑器中用于跟踪文档节点路径的强大工具，它会随着文档变化自动更新路径位置。

#### PathRef 核心概念

- PathRef 就像一个"智能指针"，能够：

- 自动跟踪路径变化：当文档结构改变时自动更新路径

- 跨操作保持稳定：在多次编辑器操作中维持路径有效性

- 资源可控：需要手动释放避免内存泄漏

#### PathRef 接口解析

```tsx
interface PathRef {
  current: Path | null // 当前路径（无效时为null）
  affinity: 'forward' | 'backward' | null // 位置调整策略
  unref(): Path | null // 释放资源并返回最后路径
}
interface PathRef {
  current: Path | null // 当前路径（无效时为null）
  affinity: 'forward' | 'backward' | null // 位置调整策略
  unref(): Path | null // 释放资源并返回最后路径
}
```

#### 核心属性和方法

1. affinity (亲和方向)

- forward：路径倾向于向前移动（保持内容在路径之后）

- backward：路径倾向于向后移动（保持内容在路径之前）

- null：默认行为，根据操作自动调整

2. unref() 方法

- 必须调用的清理方法，返回路径当前值或 null（如果路径已无效）

#### 例子

```tsx
//跟踪特定节点位置

// 创建路径引用，跟踪第二个段落
const secondParaRef = Editor.pathRef(editor, [1], {
  affinity: 'forward'
})

// 在文档开头插入新段落
Transforms.insertNodes(
  editor,
  {
    type: 'paragraph',
    children: [{ text: '新增段落' }]
  },
  { at: [0] }
)

// 原第二个段落现在变成第三个
console.log(secondParaRef.current) // 输出 [2] 而非初始的 [1]

// 释放引用
secondParaRef.unref()
```

### Range

### RangeRef

- 帮助你在编辑器内容发生变化时跟踪特定的文本范围。

#### RangeRef 基本概念

RangeRef 就像一个"书签"，即使编辑器内容发生变化，它也能保持对原始位置的引用

- 位置跟踪：当文档内容变化时自动更新引用的范围

- 方向控制：通过 affinity 属性控制范围边缘的行为

- 资源释放：使用后需要手动释放资源

#### RangeRef 接口解析

```tsx
interface RangeRef {
  current: Range | null // 当前引用的范围（可能为null）
  affinity: 'forward' | 'backward' | 'outward' | 'inward' | null // 亲和方向
  unref(): Range | null // 释放引用并返回当前范围
}
```

#### 核心属性和方法

1.  affinity (亲和方向)
    这个属性决定了当在范围边缘插入内容时，范围如何调整：

- inward：范围会向内收缩（保持内容不变）

- outward：范围会向外扩展（包含新插入的内容）

- forward：范围的锚点(anchor)保持不动，焦点(focus)移动

- backward：范围的焦点(focus)保持不动，锚点(anchor)移动

2. unref() 方法

- 释放 RangeRef 资源并返回当前范围，这是必须调用的方法，否则会导致内存泄漏。

#### 实际使用示例

eg1：保存并恢复选区

```tsx
import { Editor, Transforms } from 'slate'

// 1. 创建选区引用
const selectionRef = Editor.rangeRef(editor, editor.selection, {
  affinity: 'inward' // 当边缘插入内容时，范围向内收缩
})

// 2. 执行可能改变选区的操作
Transforms.unwrapNodes(editor, { match: (n) => n.type === 'quote' })

// 3. 恢复原始选区并释放引用
const originalSelection = selectionRef.unref()
if (originalSelection) {
  Transforms.select(editor, originalSelection)
}
```
