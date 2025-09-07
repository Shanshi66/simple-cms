# Tasks

## 任务1：设置数据库架构和ORM配置

**Task**

- [x] 实现完整的数据库表结构，包括sites、api_keys、articles_metadata、articles_content表，以及相应的索引和Drizzle ORM配置
  - [x] 1.1 在cms.ts中创建sites表schema定义，包含id、name、description、时间戳字段
  - [x] 1.2 在cms.ts中创建api_keys表schema定义，包含密钥哈希、网站关联、过期时间等字段
  - [x] 1.3 在cms.ts中创建articles_metadata表schema定义，包含文章元数据和多语言支持
  - [x] 1.4 在cms.ts中创建articles_content表schema定义，存储MDX完整内容
  - [x] 1.5 设置必要的数据库索引以优化查询性能
  - [x] 1.6 配置Drizzle ORM和数据库连接，使用`pnpm db:generate`生成迁移脚本

**Files**

- `apps/service/src/db/schema/cms.ts` - CMS相关表定义，包含sites、api_keys、articles_metadata、articles_content表
- `apps/service/src/db/schema/index.ts` - 导出所有schema定义和关系配置
- `apps/service/src/db/index.ts` - 数据库连接和初始化

## 任务2：实现API认证中间件系统

**Task**

- [x] 实现基于API Key的认证中间件，支持网站权限隔离和密钥验证
  - [x] 2.1 创建密钥哈希和验证的加密工具函数
  - [x] 2.2 实现API Key认证中间件，验证Bearer token，使用createErrorResponse返回认证错误
  - [x] 2.3 实现网站权限检查中间件，确保API Key只能访问授权的网站
  - [x] 2.4 编写认证中间件和加密工具的单元测试，测试错误响应格式

**Files**

- `apps/service/src/lib/crypto.ts` - 密钥哈希、验证和安全工具函数
- `apps/service/src/lib/crypto.test.ts` - 加密工具单元测试
- `apps/service/src/middleware/auth.ts` - API认证中间件，集成现有错误处理
- `apps/service/src/middleware/auth.test.ts` - 认证中间件单元测试，验证错误响应格式

## 任务3：实现文章管理核心API接口

**Task**

- [x] 实现三个核心API：获取文章列表(元数据)、获取单篇文章详情(完整内容)、创建文章
  - [x] 3.1 实现获取文章列表API，使用@hono/zod-validator验证查询参数（语言、状态、分页）
  - [x] 3.2 实现获取单篇文章详情API，使用zValidator验证路径参数，JOIN查询获取完整内容
  - [x] 3.3 实现创建文章API，使用zValidator验证请求体，集成现有createErrorResponse
  - [x] 3.4 定义API请求响应的TypeScript类型接口
  - [x] 3.5 编写文章路由和服务层的单元测试，测试验证和错误处理

**Files**

- `apps/service/src/routes/articles.ts` - 文章路由定义，集成zValidator参数验证
- `apps/service/src/routes/articles.test.ts` - 文章路由单元测试，包含验证和错误处理测试
- `apps/service/src/services/articles.ts` - 文章业务逻辑服务层
- `apps/service/src/services/articles.test.ts` - 文章服务单元测试
- `apps/service/src/types/api.ts` - API请求响应类型定义

## 任务4：扩展现有错误处理以支持CMS功能

**Task**

- [x] 基于现有错误处理架构，扩展支持CMS相关的业务错误和验证
  - [x] 4.1 在@repo/types/error中添加CMS相关错误码（文章不存在、权限不足、格式错误等）
  - [x] 4.2 为文章API创建Zod验证模式，集成@hono/zod-validator
  - [x] 4.3 确保现有src/error.ts和createErrorResponse支持新的CMS错误场景
  - [x] 4.4 编写CMS错误处理和验证的单元测试

**Files**

- `packages/@repo/types/src/error.ts` - 扩展CMS相关错误码枚举
- `apps/service/src/types/validation.ts` - CMS API请求验证模式（Zod schemas）
- `apps/service/src/types/validation.test.ts` - 验证模式单元测试
- `apps/service/src/error.ts` - 确保现有错误处理支持CMS场景（可能需要小幅修改）
- `apps/service/src/error.test.ts` - CMS错误处理单元测试

## 任务5：实现MDX处理工具包

**Task**

- [ ] 创建MDX文件解析、验证和处理的共享工具包
  - [ ] 5.1 实现MDX文件解析器，提取frontmatter和内容
  - [ ] 5.2 实现MDX格式验证器，检查必填字段和格式规范
  - [ ] 5.3 定义MDX相关的TypeScript类型接口
  - [ ] 5.4 创建工具包的导出接口和包配置
  - [ ] 5.5 编写解析器和验证器的单元测试

**Files**

- `packages/mdx-utils/src/parser.ts` - MDX文件解析器，处理frontmatter和内容分离
- `packages/mdx-utils/src/parser.test.ts` - 解析器单元测试
- `packages/mdx-utils/src/validator.ts` - MDX格式验证器和规则检查
- `packages/mdx-utils/src/validator.test.ts` - 验证器单元测试
- `packages/mdx-utils/src/types.ts` - MDX相关类型定义
- `packages/mdx-utils/src/index.ts` - 工具包入口文件
- `packages/mdx-utils/package.json` - 包配置文件

## 任务6：实现上传和验证脚本工具

**Task**

- [ ] 创建本地MDX文件上传和验证的命令行工具
  - [ ] 6.1 实现MDX文件上传脚本，集成格式验证和API调用
  - [ ] 6.2 实现独立的MDX文件验证脚本，支持单文件和目录验证
  - [ ] 6.3 创建API客户端封装，处理认证和请求发送
  - [ ] 6.4 编写上传和验证脚本的单元测试

**Files**

- `scripts/upload.ts` - MDX文件上传脚本，支持单文件上传和状态控制
- `scripts/upload.test.ts` - 上传脚本单元测试
- `scripts/validate.ts` - MDX文件验证脚本，支持详细错误报告
- `scripts/validate.test.ts` - 验证脚本单元测试
- `scripts/lib/api-client.ts` - API客户端封装，处理认证和HTTP请求
- `scripts/lib/api-client.test.ts` - API客户端单元测试

## 任务7：配置Cloudflare Workers部署环境

**Task**

- [ ] 配置Wrangler、环境变量和部署脚本，确保可以正确部署到Cloudflare Workers
  - [ ] 7.1 配置wrangler.toml文件，设置Workers和D1数据库绑定
  - [ ] 7.2 创建应用入口文件，集成所有路由和中间件
  - [ ] 7.3 更新package.json，添加部署和开发脚本命令

**Files**

- `apps/service/wrangler.toml` - Cloudflare Workers部署配置，包含D1数据库绑定
- `apps/service/src/index.ts` - Hono应用入口，注册路由和中间件
- `apps/service/package.json` - 添加部署、开发和测试脚本命令
