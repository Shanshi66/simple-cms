# 需求

## 目标

接口重构，将文章管理接口中的 `:siteId` 改成 `:name` 字段, 参见 `schema/cms.ts`，涉及接口：

1. `/sites/:siteId/api-keys`
2. `/sites/:site/articles`
3. `/sites/:site/articles/:lang/:slug`
4. `/sites/:site/articles`

还涉及 `blogUpload.ts` 脚本中对接口的调用
