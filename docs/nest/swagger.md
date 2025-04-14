# 自动生成 API 接口文档

## 安装

```bash
npm install --save @nestjs/swagger swagger-ui-express
```

## 配置

```typescript
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const options = new DocumentBuilder()
    .setTitle('API文档')
    .setDescription('API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api', app, document)

  await app.listen(3000)
}
bootstrap()
```

## 使用

```typescript
import { Controller, Get, Post, Body, Param, Query, Patch, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './interfaces/cat.interface';


@Controller('cats')
@ApiTags('cats')
export class CatsController {
  @Get()
  @ApiOperation({ summary: '获取所有猫咪' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'aaa 成功',
    type: String
 })
  findAll(): string {
    return 'This action returns all cats';
  }

  @Get(':id')
  @ApiOperation({ summary: '获取猫咪' })
  @ApiBody({ type: RegisterUserDto }) // 自动生成参数
  @ApiParam({ name: 'id', description: '猫咪ID' })
}
```
