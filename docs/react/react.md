## hooks

### Effect Hooks

- useEffect 在浏览器重新绘制屏幕之前触发。

- useLayoutEffect 在 React 对 DOM 进行更改之前触发 useInsertionEffect

### useLayoutEffect 在浏览器重新绘制屏幕之前触发 会影响性能

### Performance Hooks

- useMemo lets you cache the result of an expensive calculation. //缓存值

- useCallback lets you cache a function definition before passing it down to an optimized component. //缓存函数

### useActionState

### useCallback

UseCallback 缓存函数定义

```tsx
const cachedFn = useCallback(fn, dependencies)
```

### useReducer

### useContext

### useCallBack

### useMemo

### useRef useImperativeHandle forwardRef

- useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值。在大多数情况下，应当避免使用 ref 这样的命令式代码。useImperativeHandle 应当与 forwardRef 一起使用
- forwardRef 接受渲染函数作为参数。这个函数接收 props 和 ref 参数并返回一个 React 元素。在大多数情况下，ref 会转发给内部 DOM 元素。
- useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。返回的 ref 对象将在组件的整个生命周期内持续存在。

```tsx
import React, { useRef, useImperativeHandle, forwardRef } from 'react'

// 子组件（使用 forwardRef 包装）
const VideoPlayer = forwardRef((props, ref) => {
  const videoRef = useRef(null)

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current.play()
    },
    pause: () => {
      videoRef.current.pause()
    },
    toggleFullscreen: () => {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    },
    getCurrentTime: () => {
      return videoRef.current.currentTime
    }
  }))

  return (
    <video
      ref={videoRef}
      src="/sample-video.mp4"
      width="400"
      controls
    />
  )
})

// 父组件
function App() {
  const playerRef = useRef(null)

  const handlePlay = () => {
    playerRef.current.play()
  }

  const handlePause = () => {
    playerRef.current.pause()
  }

  const handleLogTime = () => {
    console.log('Current time:', playerRef.current.getCurrentTime())
  }

  return (
    <div>
      <VideoPlayer ref={playerRef} />
      <div style={{ marginTop: 20 }}>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={() => playerRef.current.toggleFullscreen()}>Fullscreen</button>
        <button onClick={handleLogTime}>Log Current Time</button>
      </div>
    </div>
  )
}

export default App
```

### useImperativeHandle

### useLayoutEffect

### useDebugValue

## UseTransfer

- 它允许后台渲染 UI 的一部分。

### 自定义 hooks

### hooks 原理

### hooks 使用注意事项

### hooks 和类组件的区别

### hooks 和函数组件的区别
