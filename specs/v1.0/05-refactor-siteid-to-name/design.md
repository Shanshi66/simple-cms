# 概览

## 目标

重构文章管理 API 接口，将路径参数从 `:siteId` 改为 `:name`，使用站点名称而非数据库 ID 作为 URL 标识符。同时更新相关脚本调用，确保系统一致性。

## 技术栈

- **后端框架**: Hono (Cloudflare Workers)
- **数据库**: SQLite (Drizzle ORM)
- **验证**: Zod
- **认证**: Bearer Token (API Keys)

# 后端

## 数据库

### 表结构

当前数据库结构保持不变：

```sql
-- sites 表
sites {
  id: text (primary key)
  name: text (unique, not null)  -- 将用作新的URL参数
  description: text
  created_at: timestamp
  updated_at: timestamp
}

-- api_keys 表 (保持siteId外键不变)
api_keys {
  id: text (primary key)
  site_id: text (references sites.id)
  key_hash: text (unique, not null)
  name: text (not null)
  expires_at: timestamp
  created_at: timestamp
  updated_at: timestamp
}

-- articles_metadata 表 (保持siteId外键不变)
articles_metadata {
  id: text (primary key)
  site_id: text (references sites.id)
  language: text (enum)
  slug: text (not null)
  title: text (not null)
  excerpt: text (not null)
  date: text (not null)
  status: text (enum)
  created_at: timestamp
  updated_at: timestamp
}
```

### 数据示例

```sql
-- sites 表示例数据
INSERT INTO sites VALUES
  ('uuid-1', 'tech-blog', 'Technology Blog', '2024-01-01', '2024-01-01'),
  ('uuid-2', 'personal-site', 'Personal Website', '2024-01-01', '2024-01-01');

-- URL将使用name字段: /sites/tech-blog/articles
-- 内部仍使用id关联: site_id = 'uuid-1'
```

## API 接口

### `/sites/:name/api-keys` 接口

**URL**: `POST /sites/:name/api-keys`

**路径参数**:

- `name`: 站点名称 (string, required)

**Body参数**:

```typescript
{
  name: string;           // API密钥名称
  expiresAt?: string;     // 过期时间 (ISO 8601)
}
```

**Request Example**:

```http
POST /sites/tech-blog/api-keys
Authorization: Bearer admin-api-key
Content-Type: application/json

{
  "name": "Upload API Key",
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "api-key-uuid",
    "apiKey": "cms_live_xxx",
    "name": "Upload API Key",
    "siteId": "uuid-1",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### `/sites/:name/articles` 接口 (GET)

**URL**: `GET /sites/:name/articles`

**路径参数**:

- `name`: 站点名称 (string, required)

**查询参数**:

- `lang`: 语言 (en | zh-cn, optional)
- `status`: 状态 (draft | published, optional, 默认published)
- `page`: 页码 (number, optional, 默认1)
- `limit`: 每页数量 (number, optional, 默认20, 最大100)

**Request Example**:

```http
GET /sites/tech-blog/articles?lang=en&status=published&page=1&limit=10
Authorization: Bearer site-api-key
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "article-uuid",
        "site_id": "uuid-1",
        "language": "en",
        "slug": "hello-world",
        "title": "Hello World",
        "excerpt": "My first post",
        "date": "2024-01-01",
        "status": "published",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### `/sites/:name/articles/:lang/:slug` 接口

**URL**: `GET /sites/:name/articles/:lang/:slug`

**路径参数**:

- `name`: 站点名称 (string, required)
- `lang`: 语言 (en | zh-cn, required)
- `slug`: 文章标识符 (string, required)

**Request Example**:

```http
GET /sites/tech-blog/articles/en/hello-world
Authorization: Bearer site-api-key
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "article-uuid",
    "site_id": "uuid-1",
    "language": "en",
    "slug": "hello-world",
    "title": "Hello World",
    "excerpt": "My first post",
    "date": "2024-01-01",
    "status": "published",
    "content": "# Hello World\n\nThis is my first post.",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### `/sites/:name/articles` 接口 (POST)

**URL**: `POST /sites/:name/articles`

**路径参数**:

- `name`: 站点名称 (string, required)

**Body参数**:

```typescript
{
  language: "en" | "zh-cn";
  slug: string; // 符合正则: /^[a-z0-9-]+$/
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD格式
  status: "draft" | "published";
  content: string;
}
```

**Request Example**:

```http
POST /sites/tech-blog/articles
Authorization: Bearer site-api-key
Content-Type: application/json

{
  "language": "en",
  "slug": "new-article",
  "title": "New Article",
  "excerpt": "Article excerpt",
  "date": "2024-01-15",
  "status": "published",
  "content": "# New Article\n\nContent here."
}
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "new-article-uuid",
    "message": "Article created successfully"
  }
}
```

## Error Handling

### 站点名称未找到错误

**错误场景**: 当URL中的`:name`参数对应的站点不存在时

**错误响应**:

```json
{
  "success": false,
  "error": {
    "code": "SITE_NOT_FOUND",
    "message": "Site not found"
  }
}
```

**HTTP状态码**: 404

### 权限验证错误

**错误场景**: API密钥对应的站点与URL参数不匹配时

**错误响应**:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Access denied: insufficient permissions for this site"
  }
}
```

**HTTP状态码**: 403

# 实现细节

## 验证模式更新

1. **新增验证模式**:

   - `siteNameParamSchema`: 验证`:name`参数

2. **更新现有模式**:
   - 确保`articleSiteParamSchema`语义明确用于站点名称

## 中间件调整

**认证中间件 (`auth.ts`) 优化**:

- 保持现有API密钥验证逻辑
- 在验证完API key后，根据`siteId`查询获取对应的`siteName`
- 在context中存储`siteName`而非`siteId`
- 路由中直接使用`siteName`进行URL参数验证

**MiddlewareVars 类型更新**:

- 将`siteId: string`改为`siteName: string`

## 路由实现策略

1. **权限验证**: 直接比较URL的`:name`参数与`c.var.siteName`
2. **数据查询**: 需要时通过`siteName`查询获取`siteId`进行数据库操作
3. **性能优化**: 避免重复的站点名称到ID转换查询

## 脚本更新

**blogUpload.ts**:

- 修改`siteConfig.id`的使用方式
- 从传递数据库ID改为传递站点名称
- 更新API调用: `createArticle(siteName, articleData)`

**api-client.ts**:

- 更新`createArticle`方法参数
- 修改URL构建逻辑: `/sites/${siteName}/articles`

## 测试更新

需要更新以下测试文件:

- `api-keys.test.ts`: 更新URL参数测试
- `articles.test.ts`: 确保`:site`参数测试正确
- 相关集成测试: 使用站点名称而非ID
