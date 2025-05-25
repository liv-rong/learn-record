# Slate

-序列化为 HTML、Markdown

- 嵌套文档模型。Slate 使用的文档模型是一个嵌套的递归树，就像 DOM 本身一样。这意味着，在高级用例中，可以创建表格或嵌套块引用等复杂组件。同时，只需使用单层层次结构，也可以轻松保持简洁。
- 基于事件。Slate 的核心 API 是基于事件的，这意味着你可以监听和响应编辑器中的任何变化。你可以创建自定义命令，或者使用现有的命令来构建你自己的编辑器。
- 与 DOM 并行。Slate 的数据模型基于 DOM——文档是一棵嵌套的树

## init 添加事件处理程序

```tsx
'use client'
import React, { useState } from 'react'
// Import the Slate editor factory.
import { createEditor } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
]

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))
  // Render the Slate context.
  return (
    <div>
      <Slate
        editor={editor}
        initialValue={initialValue}
      >
        <Editable
          onKeyDown={(event) => {
            console.log(event.key)
          }}
        />
      </Slate>
    </div>
  )
}

export default App
```

## 定义自定义元素

```tsx
'use client'

type CustomElement = {
  type: 'paragraph' | 'code'
  children: CustomText[]
}

type CustomText = {
  text: string
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
] as CustomElement[]

const CodeElement = (props: {
  attributes: React.JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLPreElement> &
    React.HTMLAttributes<HTMLPreElement>
  children:
    | string
    | number
    | bigint
    | boolean
    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
    | Iterable<React.ReactNode>
    | React.ReactPortal
    | Promise<
        | string
        | number
        | bigint
        | boolean
        | React.ReactPortal
        | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
        | Iterable<React.ReactNode>
        | null
        | undefined
      >
    | null
    | undefined
}) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const DefaultElement = (props: {
  attributes: React.JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLParagraphElement> &
    React.HTMLAttributes<HTMLParagraphElement>
  children:
    | string
    | number
    | bigint
    | boolean
    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
    | Iterable<React.ReactNode>
    | React.ReactPortal
    | Promise<
        | string
        | number
        | bigint
        | boolean
        | React.ReactPortal
        | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
        | Iterable<React.ReactNode>
        | null
        | undefined
      >
    | null
    | undefined
}) => {
  return <p {...props.attributes}>{props.children}</p>
}

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))
  // Render the Slate context.

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])
  return (
    <div>
      <Slate
        editor={editor}
        initialValue={initialValue}
      >
        <Editable
          renderElement={renderElement}
          onKeyDown={(event) => {
            console.log(event.key)
            if (event.key === 'a' && event.ctrlKey) {
              event.preventDefault()
              console.log(' console.log(event.key)')
              Transforms.setNodes(editor, { type: 'code' } as Partial<Node>, {
                match: (n) => Element.isElement(n) && Editor.isBlock(editor, n)
              })
            }
          }}
        />
      </Slate>
    </div>
  )
}

export default App
```

- 渲染的时候 可以通过 `renderElement` 来渲染自定义的元素

## 应用自定义格式

```tsx
import React, { useCallback, useState } from 'react'
import { createEditor } from 'slate'
import { Editor, Transforms, Element, Node, BaseEditor } from 'slate'
import { RenderElementProps, RenderLeafProps } from 'slate-react'
import { ReactEditor } from 'slate-react'
import { Slate, Editable, withReact } from 'slate-react'

type CustomElement = {
  type: 'paragraph' | 'code'
  children: CustomText[]
}

type CustomText = {
  text: string
  bold?: boolean
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
] as CustomElement[]

const Leaf = (props: RenderLeafProps) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  )
}

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />
  }, [])

  return (
    <div>
      <Slate
        editor={editor}
        initialValue={initialValue}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (!event.ctrlKey) {
              return
            }
            switch (event.key) {
              case 'b': {
                event.preventDefault()
                Editor.addMark(editor, 'bold', true)
                break
              }
            }
          }}
        />
      </Slate>
    </div>
  )
}
```

-Slate 使用“叶子”来管理块（或任何其他元素）中包含的文本

-Slate 的字符级格式/样式称为“标记”。应用了相同标记（样式）的相邻文本将被分组到同一个“叶子”中

-addMark 将粗体标记添加到选定文本时，Slate 会自动使用选择边界拆分“叶子”，生成个添加了粗体标记的新“叶子”

-最后需要告诉 Slate 如何渲染它，

## 逻辑抽离

```tsx
import React, { useCallback, useState } from 'react'
import { createEditor } from 'slate'
import { Editor, Transforms, Element, Node, BaseEditor } from 'slate'
import { RenderElementProps, RenderLeafProps } from 'slate-react'
import { ReactEditor } from 'slate-react'
import { Slate, Editable, withReact } from 'slate-react'

type CustomElement = {
  type: 'paragraph' | 'code'
  children: CustomText[]
}

type CustomText = {
  text: string
  bold?: boolean
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

const CustomEditor = {
  isBoldMarkActive(editor: BaseEditor & ReactEditor) {
    const marks = Editor.marks(editor)
    return marks ? marks.bold === true : false
  },

  isCodeBlockActive(editor: BaseEditor & ReactEditor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => Element.isElement(n) && n.type === 'code'
    })
    return !!match
  },

  toggleBoldMark(editor: BaseEditor & ReactEditor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'bold')
    } else {
      Editor.addMark(editor, 'bold', true)
    }
  },

  toggleCodeBlock(editor: BaseEditor & ReactEditor) {
    const isActive = CustomEditor.isCodeBlockActive(editor)
    Transforms.setNodes(
      editor,
      { type: isActive ? undefined : 'code' },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    )
  }
}

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
] as CustomElement[]

const CodeElement = (props: {
  attributes: React.JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLPreElement> &
    React.HTMLAttributes<HTMLPreElement>
  children:
    | string
    | number
    | bigint
    | boolean
    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
    | Iterable<React.ReactNode>
    | React.ReactPortal
    | Promise<
        | string
        | number
        | bigint
        | boolean
        | React.ReactPortal
        | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
        | Iterable<React.ReactNode>
        | null
        | undefined
      >
    | null
    | undefined
}) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const DefaultElement = (props: {
  attributes: React.JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLParagraphElement> &
    React.HTMLAttributes<HTMLParagraphElement>
  children:
    | string
    | number
    | bigint
    | boolean
    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
    | Iterable<React.ReactNode>
    | React.ReactPortal
    | Promise<
        | string
        | number
        | bigint
        | boolean
        | React.ReactPortal
        | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
        | Iterable<React.ReactNode>
        | null
        | undefined
      >
    | null
    | undefined
}) => {
  return <p {...props.attributes}>{props.children}</p>
}

const Leaf = (props: RenderLeafProps) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  )
}

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />
  }, [])

  return (
    <div>
      <Slate
        editor={editor}
        initialValue={initialValue}
      >
        <div>
          <button
            onMouseDown={(event) => {
              event.preventDefault()
              CustomEditor.toggleBoldMark(editor)
            }}
          >
            Bold
          </button>
          <button
            onMouseDown={(event) => {
              event.preventDefault()
              CustomEditor.toggleCodeBlock(editor)
            }}
          >
            Code Block
          </button>
        </div>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (!event.ctrlKey) {
              return
            }
            switch (event.key) {
              case '`': {
                event.preventDefault()
                CustomEditor.toggleCodeBlock(editor)
                break
              }

              case 'b': {
                event.preventDefault()
                CustomEditor.toggleBoldMark(editor)
                break
              }
            }
          }}
        />
      </Slate>
    </div>
  )
}

export default App
```

## 序列化和反序列化

- 可以自定义存储文本的格式 然后获取数据的时候再转为 slate 对象

```tsx
const App = () => {
  const [editor] = useState(() => withReact(createEditor()))

  // Define a serializing function that takes a value and returns a string.
  const serialize = (value: Descendant[]): string => {
    return (
      value
        // Return the string content of each paragraph in the value's children.
        .map((n: Descendant) => Node.string(n))
        // Join them all with line breaks denoting paragraphs.
        .join('\n')
    )
  }

  // Define a deserializing function that takes a string and returns a value.
  const deserialize = (string: string): Descendant[] => {
    // Return a value array of children derived by splitting the string.
    return string.split('\n').map((line: string) => {
      return {
        type: 'paragraph',
        children: [{ text: line }]
      }
    })
  }

  const initialValue = useMemo(() => {
    const savedContent = localStorage.getItem('content')
    return savedContent
      ? deserialize(savedContent)
      : ([
          {
            type: 'paragraph' as const,
            children: [{ text: '开始编辑...' }]
          }
        ] as CustomElement[])
  }, [])

  return (
    <div>
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value: Descendant[]) => {
          const isAstChange = editor.operations.some((op) => 'set_selection' !== op.type)
          if (isAstChange) {
            // Serialize the value and save the string value to Local Storage.
            localStorage.setItem('content', serialize(value))
          }
        }}
      >
        <Editable />
      </Slate>
    </div>
  )
}

export default App
```

#概念

## Node

- Node 是 slate 中最小的数据单元，它代表一个文本节点或者一个容器节点
- Node 有两个属性：type 和 children
- type 是一个字符串，用来标识节点的类型，例如 'paragraph'、'heading'、'image' 等
- children 是一个数组，用来存储节点的子节点，如果节点是文本节点，那么 children 数组中只有一个元素，即文本内容；如果节点是容器节点，那么 children 数组中可以包含多个子节点

## 接口

- Slate 可以使用纯 JSON 对象。它只需要这些 JSON 对象遵循某些接口即

### 节点

- Editor 包含整个文档内容的根级节点。

- Element 在您的域中具有语义含义的容器节点。

- Text 以及包含文档文本的叶级节点。

eg: 纯文本值

```tsx
const editor = {
  children: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'A line of text!'
        }
      ]
    }
  ]
}
```

#### Editor 节点

- 它封装了文档的所有富文本“内容”

  ```tsx
  interface Editor {
  children: Node[]
  ...
  }
  ```

#### Element

- 元素构成了富文本文档的中间层 type 可与区分不同的类型

  ```tsx
  interface Element {
    children: Node[]
  }

  const link = {
  type: 'link',
  url: 'https://example.com',
  children: [...],
  }

  const quote = {
  type: 'quote',
  children: [...],
  }

  const paragraph = {
  type: 'paragraph',
  children: [...],
  }

  ```

## 位置

-位置是指在使用 Slate 编辑器插入、删除或执行其他操作时，引用文档中特定位置的方式

### Path

- 路径是指向位置的最低层级的方式。每条路径都是一个简单的数字数组，它通过文档树中每个节点在其祖先节点中的索引来引用该节点：

```tsx
const editor = {
  children: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'A line of text!'
        }
      ]
    }
  ]
}
```

- 叶文本节点的路径为 [0, 0]
- 例如，要选择编辑器的所有内容，请调用 Transforms.select(editor, [])

### Point

- 点比路径稍微具体一些
- 包含指向 offset 特定文本节点的内容

```tsx
interface Point {
  path: Path
  offset: number
}
const editor = {
  children: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'A line of text!'
        }
      ]
    }
  ]
}
```

### Range

- 范围是两个点之间的区域
- 范围可以用来选择文档中的内容，或者插入、删除或修改内容
- 范围的锚点和焦点始终引用文档中的叶级文本节点，而不会引用元素

```tsx
interface Range {
  anchor: Point
  focus: Point
}
```

### Selection

- 选择是 Slate 编辑器中当前选定的内容 它是顶层的属性 Editor
- 选择由一个范围组成，该范围引用文档中的叶级文本节点
- 选择可以用来选择文档中的内容，或者插入、删除或修改内容
- 选择是一个特殊的范围

eg: 假设某人当前选择了整个句子：

```tsx
const editor = {
  selection: {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 15 }
  },
  children: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'A line of text!'
        }
      ]
    }
  ]
}
```

## 操作

- 操作是 Slate 的核心，它们是用于修改文档的方法
- 操作是可组合的，这意味着你可以将多个操作组合在一起，以创建更复杂的操作

```tsx
import { Transforms } from 'slate'

Transforms.insertText(editor, 'Hello, world!')
```
