## vite 中环境变量？

Vite 内置了 `dotenv` 这个第三方库， dotenv 会自动读取 `.env` 文件， dotenv 从你的 `环境目录` 中的下列文件加载额外的环境变量：

> .env # 所有情况下都会加载
> .env.[mode] # 只在指定模式下加载
