# Tasks

## Task 1

**Task**

- [x] 实现网站管理 API 路由
  - [x] 1.1 在 `apps/service/src/types/validation.ts` 中添加 `createSiteSchema` 验证模式，包含 id、name、description 字段验证
  - [x] 1.2 创建 `apps/service/src/routes/sites.ts` 路由文件，设置基础 Hono 路由结构
  - [x] 1.3 在 sites 路由中添加 admin 认证中间件
  - [x] 1.4 实现 `POST /sites` 接口：参数验证、检查网站 ID 唯一性、插入数据库、返回成功响应
  - [x] 1.5 实现 `GET /sites` 接口：查询所有网站并返回列表响应
  - [x] 1.6 添加错误处理：验证错误 (400)、网站已存在 (409)、认证失败 (401)
  - [x] 1.7 创建 `apps/service/src/routes/sites.test.ts` 集成测试文件
  - [x] 1.8 编写创建网站接口的集成测试：成功创建、验证错误、重复 ID 错误、认证错误
  - [x] 1.9 编写查询网站接口的集成测试：成功查询、认证错误

**Files**

- `apps/service/src/routes/sites.ts` - 网站管理 API 路由实现，包含创建和查询网站接口
- `apps/service/src/routes/sites.test.ts` - sites 路由的集成测试
- `apps/service/src/types/validation.ts` - 添加网站创建的 Zod 验证模式

## Task 2

**Task**

- [ ] 实现 API Key 管理接口
  - [ ] 2.1 在 `apps/service/src/types/validation.ts` 中添加 `createApiKeySchema` 和路径参数验证模式
  - [ ] 2.2 在 `apps/service/src/lib/crypto.ts` 中添加 `generateApiKey` 函数生成 "sk\_" 前缀的密钥
  - [ ] 2.3 在 `apps/service/src/lib/crypto.ts` 中添加 `hashApiKey` 函数用于哈希加密 API Key
  - [ ] 2.4 为 crypto 工具函数编写单元测试
  - [ ] 2.5 创建 `apps/service/src/routes/api-keys.ts` 路由文件，设置基础路由结构
  - [ ] 2.6 在 api-keys 路由中添加 admin 认证中间件
  - [ ] 2.7 实现 `POST /sites/{siteId}/api-keys` 接口：验证网站存在、生成密钥、哈希存储、返回明文密钥
  - [ ] 2.8 添加错误处理：网站不存在 (404)、验证错误 (400)、认证失败 (401)
  - [ ] 2.9 创建 `apps/service/src/routes/api-keys.test.ts` 集成测试文件
  - [ ] 2.10 编写 API Key 创建接口的集成测试：成功创建、网站不存在错误、验证错误、认证错误

**Files**

- `apps/service/src/routes/api-keys.ts` - API Key 管理路由实现
- `apps/service/src/routes/api-keys.test.ts` - API Key 路由的集成测试
- `apps/service/src/types/validation.ts` - 添加 API Key 创建的验证模式
- `apps/service/src/lib/crypto.ts` - 扩展加密工具函数支持 API Key 生成
- `apps/service/src/lib/crypto.test.ts` - 为新增的加密函数添加单元测试

## Task 3

**Task**

- [ ] 更新应用程序路由配置
  - [ ] 3.1 在 `apps/service/src/index.ts` 中导入 sites 路由模块
  - [ ] 3.2 在 `apps/service/src/index.ts` 中导入 api-keys 路由模块
  - [ ] 3.3 将 sites 路由注册到应用程序中，使用 `/api` 基础路径
  - [ ] 3.4 将 api-keys 路由注册到应用程序中，使用 `/api` 基础路径

**Files**

- `apps/service/src/index.ts` - 注册新的路由模块

## Task 4

**Task**

- [ ] 添加 API 响应类型定义
  - [ ] 4.1 在 `apps/service/src/types/api.ts` 中添加 `Site` 类型定义
  - [ ] 4.2 在 `apps/service/src/types/api.ts` 中添加 `SiteListResponse` 类型定义
  - [ ] 4.3 在 `apps/service/src/types/api.ts` 中添加 `CreateSiteResponse` 类型定义
  - [ ] 4.4 在 `apps/service/src/types/api.ts` 中添加 `ApiKey` 类型定义
  - [ ] 4.5 在 `apps/service/src/types/api.ts` 中添加 `CreateApiKeyResponse` 类型定义

**Files**

- `apps/service/src/types/api.ts` - 添加网站和 API Key 相关的响应类型定义
