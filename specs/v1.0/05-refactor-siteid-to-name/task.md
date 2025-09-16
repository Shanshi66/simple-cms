# Tasks

## Task 1

**Task**

- [x] 更新验证模式和类型定义
  - [x] 1.1 在 validation.ts 中新增 siteNameParamSchema 验证模式，用于验证路径参数 :name
  - [ ] 1.2 更新 context.ts 中的 MiddlewareVars 类型，将 siteId 字段改为 siteName 字段 (待后续任务中与路由一起更新)
  - [x] 1.3 确保 articleSiteParamSchema 语义明确用于站点名称而非站点ID

**Files**

- `apps/service/src/types/validation.ts` - 添加站点名称参数验证模式，用于验证URL中的:name参数
- `apps/service/src/types/context.ts` - 更新中间件变量类型定义，将siteId改为siteName

## Task 2

**Task**

- [x] 重构认证中间件以支持站点名称
  - [x] 2.1 修改 auth.ts 中间件，在验证API key后通过siteId查询对应的siteName
  - [x] 2.2 在context中存储siteName而非siteId，更新c.set调用
  - [x] 2.3 添加从sites表通过siteId查询siteName的数据库操作
  - [x] 2.4 更新中间件注释和错误处理逻辑

**Files**

- `apps/service/src/middleware/auth.ts` - API认证中间件核心逻辑，查询并设置siteName
- `apps/service/src/middleware/auth.test.ts` - 认证中间件单元测试，验证siteName设置正确

## Task 3

**Task**

- [x] 更新 API Keys 路由使用站点名称
  - [x] 3.1 修改路由路径从 `/sites/:siteId/api-keys` 到 `/sites/:name/api-keys`
  - [x] 3.2 更新路由处理器使用 siteNameParamSchema 验证参数
  - [x] 3.3 添加通过站点名称查询站点是否存在的数据库操作
  - [x] 3.4 更新错误处理，返回SITE_NOT_FOUND错误当站点名称不存在时

**Files**

- `apps/service/src/routes/api-keys.ts` - API密钥路由处理器，使用站点名称参数
- `apps/service/src/routes/api-keys.test.ts` - API密钥路由集成测试，测试新的URL参数

## Task 4

**Task**

- [x] 更新 Articles 路由使用站点名称
  - [x] 4.1 修改路由中的权限验证逻辑，比较URL的:name参数与c.var.siteName
  - [x] 4.2 移除现有的site参数与siteId比较逻辑
  - [x] 4.3 确保路由仍能正确获取siteId进行数据库查询
  - [x] 4.4 优化避免重复的站点名称到ID转换查询
  - [x] 4.5 更新错误处理，使用正确的错误码和消息

**Files**

- `apps/service/src/routes/articles.ts` - 文章路由处理器，更新权限验证和参数处理
- `apps/service/src/routes/articles.test.ts` - 文章路由集成测试，测试新的权限验证逻辑

## Task 5

**Task**

- [x] 更新客户端脚本支持站点名称
  - [x] 5.1 修改 blogUpload.ts 脚本中的 loadSiteConfig 方法，接收站点名称而非ID
  - [x] 5.2 更新 api-client.ts 中的 createArticle 方法参数，使用站点名称构建URL
  - [x] 5.3 修改URL构建逻辑：`/sites/${siteName}/articles`
  - [x] 5.4 更新相关的类型定义和接口，确保一致性
  - [x] 5.5 修改脚本调用方式，传递站点名称而非数据库ID

**Files**

- `apps/blog-library/scripts/blogUpload.ts` - 博客上传脚本，使用站点名称而非ID
- `apps/blog-library/src/lib/api-client.ts` - API客户端库，更新URL构建逻辑
- `apps/blog-library/scripts/blogUpload.test.ts` - 博客上传脚本测试，验证新的参数处理
- `apps/blog-library/src/types/article.ts` - 文章类型定义，更新SiteConfig接口
