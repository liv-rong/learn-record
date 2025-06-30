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
-   `new fabric.BaseBrush()` 画笔类型为基础画笔 抽象类 其他的画笔继承这个类 不能直接实例化，需要子类实现具体逻辑
-  `new fabric.PencilBrush(canvas)` 画笔类型为铅笔
    这个就是我们常用的画笔类型 一条直线 一个 Path 对象 手写、签名、自由绘图

-  `new fabric.CircleBrush(canvas)` 画笔类型为圆形 一个 Group 对象 点画、虚线效果、特殊纹理


-  `new fabric.SprayBrush(canvas)` 模拟喷漆效果，在鼠标移动时随机喷洒出多个点（圆形）。最终这些点会组合成一个`fabric.Group`对象。

-  `new fabric.PatternBrush(canvas)` 画笔类型线图案画笔 自定义的图沿着路径绘制 继承自`fabric.PencilBrush`，但使用图案代替纯色。最终生成一个`fabric.Path`对象，`stroke`为图案。




使用 new fabric.PatternBrush 根据图片自定义纹理画笔
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

- img  2


使用fabric.PatternBrush 自定义图案画笔 水平 垂直 方形 菱形 等图案

```tsx
const hLinePatternBrush = new fabric.PatternBrush(canvas)
    hLinePatternBrush.getPatternSrc = function () {
      const patternCanvas = document.createElement('canvas')
      patternCanvas.width = patternCanvas.height = 10
      const ctx = patternCanvas.getContext('2d')
      if (!ctx) return patternCanvas

      ctx.strokeStyle = this.color
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(5, 0)
      ctx.lineTo(5, 10)
      ctx.closePath()
      ctx.stroke()

      return patternCanvas
    }
    hLinePatternBrushRef.current = hLinePatternBrush

    // 方形图案画笔
    const squarePatternBrush = new fabric.PatternBrush(canvas)
    squarePatternBrush.getPatternSrc = function () {
      const squareWidth = 10
      const squareDistance = 2
      const patternCanvas = document.createElement('canvas')
      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance
      const ctx = patternCanvas.getContext('2d')
      if (!ctx) return patternCanvas

      ctx.fillStyle = this.color
      ctx.fillRect(0, 0, squareWidth, squareWidth)

      return patternCanvas
    }
    squarePatternBrushRef.current = squarePatternBrush

    // 菱形图案画笔
    const diamondPatternBrush = new fabric.PatternBrush(canvas)
    diamondPatternBrush.getPatternSrc = function () {
      const squareWidth = 10
      const squareDistance = 5
      const patternCanvas = document.createElement('canvas')
      const rect = new fabric.Rect({
        width: squareWidth,
        height: squareWidth,
        angle: 45,
        fill: this.color
      })

      const canvasWidth = rect.getBoundingRect().width
      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance
      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 })

      const ctx = patternCanvas.getContext('2d')
      if (ctx) rect.render(ctx)

      return patternCanvas
    }
    diamondPatternBrushRef.current = diamondPatternBrush

```

//圆形画笔和喷雾画笔  fabric.CircleBrush   fabric.SprayBrush

```tsx
 const circleBrush = new fabric.CircleBrush(canvas)
 const sprayBrush = new fabric.SprayBrush(canvas)

```
 img 5


自定义画笔样式 比如带箭头的线
```tsx
import * as fabric from 'fabric';

export class ArrowBrush extends fabric.PencilBrush {
  public declare canvas: fabric.Canvas;

  private points: fabric.Point[] = [];
  arrowSize = 12;
  private lastAngle: number = 0;

  constructor(canvas: fabric.Canvas) {
    super(canvas);
    this.canvas = canvas;
    this.width = 5;
    this.color = '#000000';
  }

  onMouseDown(pointer: fabric.Point) {
    // 使用原始指针坐标（不转换）
    this.points = [pointer];
    const ctx = this.canvas.getSelectionContext();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
  }

  onMouseMove(pointer: fabric.Point) {
    if (this.points.length === 0) return;

    this.points.push(pointer);
    const ctx = this.canvas.getSelectionContext();
    ctx.clearRect(0, 0, this.canvas.width!, this.canvas.height!);

    // 保存当前状态
    ctx.save();
    // 重置变换矩阵
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // 应用当前视图变换
    const vpt = this.canvas.viewportTransform;
    if (vpt) {
      ctx.transform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5]);
    }

    // 绘制时使用原始坐标（因为已经应用了变换）
    this.drawSegment(ctx, this.points);
    // 恢复状态
    ctx.restore();
  }

  onMouseUp() {
    if (this.points.length < 2) return false;

    const path = this.createPathWithArrow(this.points);

    this.canvas.clearContext(this.canvas.getSelectionContext());
    this.canvas.add(path);
    this.canvas.requestRenderAll();
    this.points = [];
    return true;
  }
  // 绘制路径段（包含箭头）
  private drawSegment(ctx: CanvasRenderingContext2D, points: fabric.Point[]) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    if (points.length > 1) {
      this.drawArrow(ctx, points[points.length - 2], points[points.length - 1]);
    }
  }

  // 绘制单个箭头
  private drawArrow(
    ctx: CanvasRenderingContext2D,
    from: fabric.Point,
    to: fabric.Point,
  ) {
    const headLength = this.arrowSize;
    this.lastAngle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(this.lastAngle - Math.PI / 6),
      to.y - headLength * Math.sin(this.lastAngle - Math.PI / 6),
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(this.lastAngle + Math.PI / 6),
      to.y - headLength * Math.sin(this.lastAngle + Math.PI / 6),
    );
    ctx.stroke();
  }
  // 创建最终的带箭头路径对象
  private createPathWithArrow(points: fabric.Point[]): fabric.Group {
    const pathData = points
      .map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y)
      .join(' ');
    const line = new fabric.Path(pathData, {
      stroke: this.color,
      strokeWidth: this.width,
      fill: 'transparent',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      selectable: true,
    });

    if (points.length >= 2) {
      const from = points[points.length - 2];
      const to = points[points.length - 1];
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      const headLength = this.arrowSize;

      const arrowLeft = new fabric.Path(
        `M ${to.x} ${to.y} L ${
          to.x - headLength * Math.cos(angle - Math.PI / 6)
        } ${to.y - headLength * Math.sin(angle - Math.PI / 6)}`,
        {
          stroke: this.color,
          strokeWidth: this.width,
          fill: 'transparent',
          strokeLineCap: 'round',
        },
      );

      const arrowRight = new fabric.Path(
        `M ${to.x} ${to.y} L ${
          to.x - headLength * Math.cos(angle + Math.PI / 6)
        } ${to.y - headLength * Math.sin(angle + Math.PI / 6)}`,
        {
          stroke: this.color,
          strokeWidth: this.width,
          fill: 'transparent',
          strokeLineCap: 'round',
        },
      );

      return new fabric.Group([line, arrowLeft, arrowRight], {
        selectable: true,
        originX: 'center',
        originY: 'center',
      });
    }

    return new fabric.Group([line], { selectable: true });
  }
}

```

ArrowBrush 继承 fabric.PencilBrush类 覆盖关键方法实现自定义箭头绘制


- 绘制流程：
1. onMouseDown：初始化路径点数组和绘图上下文

2 .onMouseMove：收集路径点 清除上一帧绘制 应用画布变换（支持缩放/平移） 绘制当前路径和箭头

3. onMouseUp：创建最终路径对象并添加到画布

4 .箭头实现原理：使用三角函数计算箭头角度：Math.atan2(dy, dx)

5. 最终使用 fabric.Path 和 fabric.Group 创建高效矢量对象

6. 坐标系统处理：显式应用视口变换(viewportTransform) 确保在缩放/平移画布时 正确绘制使用原始坐标点（不转换）






