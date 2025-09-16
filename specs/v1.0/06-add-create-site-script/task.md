# Tasks

## Task 1

**Task**

- [x] 扩展共享类型定义以支持站点和 API 密钥管理
  - [x] 1.1 在 packages/types/src/api/ 目录下创建 site.ts 文件
  - [x] 1.2 定义 CreateSiteRequest 接口，包含 name 和 description 字段
  - [x] 1.3 定义 CreateSiteResponse 接口，包含 id、name、description、created_at、updated_at 字段
  - [x] 1.4 定义 CreateApiKeyRequest 接口，包含 name 和 expiresAt 字段
  - [x] 1.5 定义 CreateApiKeyResponse 接口，包含 id、apiKey、name、siteId、expiresAt、createdAt 字段
  - [x] 1.6 使用 Zod 创建对应的验证模式 CreateSiteRequestSchema、CreateSiteResponseSchema、CreateApiKeyRequestSchema、CreateApiKeyResponseSchema
  - [x] 1.7 更新 packages/types/src/api/index.ts 导出新定义的类型和模式

**Files**

- `packages/types/src/api/site.ts` - 站点和 API 密钥相关的类型定义和 Zod 验证模式
- `packages/types/src/api/index.ts` - 更新导出声明以包含新的站点类型

## Task 2

**Task**

- [ ] 扩展 APIClient 类支持站点管理功能
  - [ ] 2.1 在 APIClient 类中添加 createSite 方法，接受 CreateSiteRequest 参数
  - [ ] 2.2 在 createSite 方法中实现 POST /sites API 调用，包含 Bearer 认证
  - [ ] 2.3 添加请求数据的 Zod 验证和响应数据的验证
  - [ ] 2.4 在 APIClient 类中添加 createSiteApiKey 方法，接受站点名称和 CreateApiKeyRequest 参数
  - [ ] 2.5 在 createSiteApiKey 方法中实现 POST /sites/{name}/api-keys API 调用
  - [ ] 2.6 添加统一的错误处理，解析 API 错误响应格式
  - [ ] 2.7 为 createSite 方法编写单元测试，覆盖成功和失败场景
  - [ ] 2.8 为 createSiteApiKey 方法编写单元测试，覆盖成功和失败场景

**Files**

- `apps/blog-library/src/lib/api-client.ts` - 扩展 APIClient 类添加站点管理方法
- `apps/blog-library/src/lib/api-client.test.ts` - APIClient 新方法的单元测试

## Task 3

**Task**

- [ ] 实现 createSite CLI 脚本
  - [ ] 3.1 创建 createSite.ts 脚本文件，添加 shebang 和基本导入
  - [ ] 3.2 创建 SiteCreator 类，包含环境变量加载方法
  - [ ] 3.3 实现 loadConfig 私有方法，从环境变量读取 CMS_BASE_URL 和 ADMIN_API_KEY
  - [ ] 3.4 实现 createSite 公有方法，接受站点名称和描述参数
  - [ ] 3.5 在 createSite 方法中验证站点名称格式（只能包含字母和'-'）
  - [ ] 3.6 调用 APIClient.createSite 方法并处理响应
  - [ ] 3.7 实现错误处理方法，提供用户友好的错误信息和故障排除提示
  - [ ] 3.8 使用 Commander.js 设置 CLI 接口，支持 `<site-name> [description]` 参数
  - [ ] 3.9 添加表情符号和颜色的日志输出，保持与现有脚本风格一致
  - [ ] 3.10 为 SiteCreator 类编写单元测试，覆盖成功创建、验证错误、API 错误等场景
  - [ ] 3.11 为 CLI 参数处理编写单元测试

**Files**

- `apps/blog-library/scripts/createSite.ts` - createSite CLI 脚本实现
- `apps/blog-library/scripts/createSite.test.ts` - createSite 脚本的单元测试

## Task 4

**Task**

- [ ] 实现 createSiteKey CLI 脚本
  - [ ] 4.1 创建 createSiteKey.ts 脚本文件，添加 shebang 和基本导入
  - [ ] 4.2 创建 SiteKeyCreator 类，包含环境变量加载方法
  - [ ] 4.3 实现 loadConfig 私有方法，从环境变量读取配置信息
  - [ ] 4.4 实现 createSiteKey 公有方法，接受站点名称、密钥名称和过期时间参数
  - [ ] 4.5 验证站点名称格式和过期时间格式（ISO 8601）
  - [ ] 4.6 调用 APIClient.createSiteApiKey 方法并处理响应
  - [ ] 4.7 安全地显示生成的 API 密钥（仅显示一次）
  - [ ] 4.8 实现错误处理方法，包含站点不存在等业务错误的处理
  - [ ] 4.9 使用 Commander.js 设置 CLI 接口，支持 `<site-name> <key-name> [expires-at]` 参数
  - [ ] 4.10 添加表情符号和颜色的日志输出
  - [ ] 4.11 为 SiteKeyCreator 类编写单元测试，覆盖成功创建、验证错误、站点不存在等场景
  - [ ] 4.12 为 CLI 参数处理和过期时间验证编写单元测试

**Files**

- `apps/blog-library/scripts/createSiteKey.ts` - createSiteKey CLI 脚本实现
- `apps/blog-library/scripts/createSiteKey.test.ts` - createSiteKey 脚本的单元测试

## Task 5

**Task**

- [ ] 更新 package.json 添加新的 npm 脚本命令
  - [ ] 5.1 在 apps/blog-library/package.json 的 scripts 部分添加 "createSite": "tsx scripts/createSite.ts"
  - [ ] 5.2 在 scripts 部分添加 "createSiteKey": "tsx scripts/createSiteKey.ts"
  - [ ] 5.3 验证新脚本命令的格式与现有脚本保持一致

**Files**

- `apps/blog-library/package.json` - 添加 createSite 和 createSiteKey npm 脚本命令
