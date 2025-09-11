# Tasks

## Task 1: 实现后端图片上传API接口

**Task**

- [x] 实现图片上传API接口 (`POST /image/upload`)，支持multipart/form-data格式上传，集成Cloudflare R2存储，包含完整的错误处理和单元测试
  - [x] 1.1 在 `packages/types/src/errors.ts` 中添加图片上传相关错误码定义
  - [x] 1.2 在 `apps/service/src/types/validation.ts` 中定义图片上传请求验证schema
  - [x] 1.3 实现管理员认证中间件 `apps/service/src/middleware/admin-auth.ts`
  - [x] 1.4 为管理员认证中间件编写单元测试 `apps/service/src/middleware/admin-auth.test.ts`
  - [x] 1.5 实现图片上传API路由 `apps/service/src/routes/image.ts`
  - [x] 1.6 为图片上传API编写单元测试 `apps/service/src/routes/image.test.ts`
  - [x] 1.7 在 `apps/service/src/index.ts` 中注册图片上传路由

**Files**

- `packages/types/src/errors.ts` - 添加图片上传相关错误码（INVALID_ADMIN_KEY, INVALID_FILE_TYPE, FILE_TOO_LARGE, UPLOAD_FAILED, MISSING_FILE）
- `apps/service/src/types/validation.ts` - 图片上传请求的zod验证schema定义
- `apps/service/src/middleware/admin-auth.ts` - 管理员认证中间件，验证ADMIN_API_KEY
- `apps/service/src/middleware/admin-auth.test.ts` - 管理员认证中间件的单元测试
- `apps/service/src/routes/image.ts` - 图片上传API路由实现，处理multipart/form-data和R2集成
- `apps/service/src/routes/image.test.ts` - 图片上传API的单元测试
- `apps/service/src/index.ts` - 注册新的图片上传路由

## Task 2: 实现CLI图片上传工具

**Task**

- [x] 实现CLI图片上传脚本 (`imgUpload.ts`)，用于解析MDX文件、提取本地图片、批量上传到R2并替换路径，包含完整的单元测试
  - [x] 2.1 实现图片上传核心逻辑类 `apps/blog-library/src/lib/image-uploader.ts`
  - [x] 2.2 为图片上传核心逻辑编写单元测试 `apps/blog-library/src/lib/image-uploader.test.ts`
  - [x] 2.3 实现CLI入口脚本 `apps/blog-library/scripts/imgUpload.ts`
  - [x] 2.4 为CLI脚本编写单元测试 `apps/blog-library/scripts/imgUpload.test.ts`
  - [x] 2.5 在 `apps/blog-library/package.json` 中添加imgUpload脚本命令

**Files**

- `apps/blog-library/src/lib/image-uploader.ts` - 图片上传核心逻辑类，包含MDX解析、本地图片提取、API调用、路径替换等功能
- `apps/blog-library/src/lib/image-uploader.test.ts` - 图片上传核心逻辑的单元测试
- `apps/blog-library/scripts/imgUpload.ts` - CLI入口脚本，处理命令行参数和调用核心逻辑
- `apps/blog-library/scripts/imgUpload.test.ts` - CLI脚本的单元测试
- `apps/blog-library/package.json` - 添加"imgUpload"脚本命令定义

## Task 3: 增强现有博客上传功能

**Task**

- [x] 在现有 `blogUpload.ts` 中添加本地图片检验功能，确保上传博客前已处理所有本地图片引用，包含单元测试
  - [x] 3.1 在 `apps/blog-library/scripts/blogUpload.ts` 中添加本地图片检验方法
  - [x] 3.2 在博客上传流程中集成本地图片检验逻辑
  - [x] 3.3 更新 `apps/blog-library/scripts/blogUpload.test.ts` 中的单元测试，验证本地图片检验功能

**Files**

- `apps/blog-library/scripts/blogUpload.ts` - 增强现有博客上传脚本，添加checkLocalImages方法和检验逻辑
- `apps/blog-library/scripts/blogUpload.test.ts` - 更新博客上传脚本的单元测试，包含本地图片检验的测试用例

## Task 4: 配置环境变量和部署设置

**Task**

- [ ] 配置Cloudflare Workers环境变量、R2存储桶绑定和相关部署设置，确保图片上传功能可在生产环境运行
  - [ ] 4.1 在 `apps/service/wrangler.toml` 中添加R2存储桶绑定配置
  - [ ] 4.2 在 `apps/blog-library/.env.example` 中添加CLI工具所需的环境变量示例
  - [ ] 4.3 更新项目根目录 `README.md` 文档，说明新增的环境变量配置要求和使用流程

**Files**

- `apps/service/wrangler.toml` - 添加R2_BUCKET存储桶绑定和相关环境变量配置
- `apps/blog-library/.env.example` - 添加CMS_BASE_URL和ADMIN_API_KEY环境变量示例
- `README.md` - 更新文档，说明图片上传功能的配置要求和使用流程
