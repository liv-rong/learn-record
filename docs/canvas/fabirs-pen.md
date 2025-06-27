# 1. 画笔

## 1.进入画笔模式

同构设置 isDrawingMode 可以进入画笔模式。
```tsx
canvas.isDrawingMode = true;

```

## 2创建画笔
· 创建画笔
```tsx
const pen = new fabric.PenBrush({
  color: 'black',
  width: 5,
  opacity: 1,
  globalCompositeOperation:'source-over'
});
```

· 将画笔添加到 canvas 中
```tsx
canvas.freeDrawingBrush = pen;
```

· 设置属性
color, width, opacity, globalCompositeOperation 宽高阴影等属性
```tsx
const changePen = (brushColor, lineWidth, opacity, globalCompositeOperation) => {
    const brush = canvas.freeDrawingBrush;
    if(!brush) return
    brush.color = brushColor
    brush.width = lineWidth
    brush.shadow = new fabric.Shadow({
      blur: shadowWidth,
      offsetX: shadowOffset,
      offsetY: shadowOffset,
      affectStroke: true,
      color: shadowColor
    })

}

```


# 2. 自定义画笔
如果有需要可以自己设置不同类型的画笔
-  `new fabric.PatternBrush(canvas)` 可以设置不同笔刷

## 1. 画笔类型
-   `new fabric.BaseBrush()` 画笔类型为基础画笔 抽象类 其他的画笔继承这个类
-  `new fabric.PencilBrush(canvas)` 画笔类型为铅笔
    这个就是我们常用的画笔类型 一条直线 一个 Path 对象 手写、签名、自由绘图

-  `new fabric.CircleBrush(canvas)` 画笔类型为圆形 一个 Group 对象 点画、虚线效果、特殊纹理

-  `new fabric.SprayBrush(canvas)` 画笔类型为喷涂
-  `new fabric.EraserBrush(canvas)` 画笔类型为橡皮擦

-  `new fabric.ColorPickerBrush(canvas)` 画笔类型为颜色选择器
-  `new fabric.PatternBrush(canvas)` 画笔类型为纯色
-  `new fabric.TextureBrush(canvas)` 画笔类型为纹理
-  `new fabric.DrawingBrush(canvas)` 画笔类型为画笔
eg:
```tsx
    const texturePatternBrush = new fabric.PatternBrush(canvas)
    const img = new Image()
    img.src = 'url'
    texturePatternBrush.source = img
    texturePatternBrushRef.current = texturePatternBrush
    canvas.freeDrawingBrush = texturePatternBrush
```
- 这种情况下也可修改画笔属性，如颜色、宽度等。 透明度需要等渲染完成后才能修改






