# 概览

## 目标

基于现有的系统架构，增加网站(`site`)创建接口及查询接口，以及 API key 创建接口。所有新增接口都需要 admin key 认证。

## 技术栈

- **后端框架**: Hono.js (部署在 Cloudflare Workers)
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **验证**: Zod + @hono/zod-validator
- **认证**: Bearer Token (Admin Key 和 API Key)
- **加密**: Web Crypto API (SHA-256)

# 后端

## 数据库

### 表结构

**sites 表 (已存在)**

```sql
CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

**api_keys 表 (已存在)**

```sql
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id),
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### 数据示例

**sites 表示例数据**

```json
{
  "id": "my-blog-site",
  "name": "我的博客",
  "description": "个人技术博客网站",
  "created_at": "2024-01-15T08:00:00.000Z",
  "updated_at": "2024-01-15T08:00:00.000Z"
}
```

**api_keys 表示例数据**

```json
{
  "id": "api-key-123",
  "site_id": "my-blog-site",
  "key_hash": "a1b2c3d4e5f6...",
  "name": "生产环境密钥",
  "expires_at": "2024-12-31T23:59:59.000Z",
  "created_at": "2024-01-15T08:00:00.000Z",
  "updated_at": "2024-01-15T08:00:00.000Z"
}
```

## API 接口

### 创建网站接口

**URL**: `POST /api/sites`

**认证**: 需要 Admin Key (Bearer Token)

**Body参数**:

```json
{
  "id": "string (必须, 网站唯一标识符)",
  "name": "string (必须, 网站名称)",
  "description": "string (可选, 网站描述)"
}
```

**Request Example**:

```bash
curl -X POST http://localhost:8787/api/sites \
  -H "Authorization: Bearer ${ADMIN_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-blog-site",
    "name": "我的博客",
    "description": "个人技术博客网站"
  }'
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "my-blog-site",
    "name": "我的博客",
    "description": "个人技术博客网站",
    "created_at": "2024-01-15T08:00:00.000Z",
    "updated_at": "2024-01-15T08:00:00.000Z"
  }
}
```

### 查询所有网站接口

**URL**: `GET /api/sites`

**认证**: 需要 Admin Key (Bearer Token)

**查询参数**: 无

**Request Example**:

```bash
curl -X GET http://localhost:8787/api/sites \
  -H "Authorization: Bearer ${ADMIN_API_KEY}"
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "sites": [
      {
        "id": "my-blog-site",
        "name": "我的博客",
        "description": "个人技术博客网站",
        "created_at": "2024-01-15T08:00:00.000Z",
        "updated_at": "2024-01-15T08:00:00.000Z"
      },
      {
        "id": "company-site",
        "name": "公司官网",
        "description": "企业门户网站",
        "created_at": "2024-01-10T10:30:00.000Z",
        "updated_at": "2024-01-10T10:30:00.000Z"
      }
    ]
  }
}
```

### 创建 API Key 接口

**URL**: `POST /api/sites/{siteId}/api-keys`

**认证**: 需要 Admin Key (Bearer Token)

**路径参数**:

- `siteId`: 网站ID (必须)

**Body参数**:

```json
{
  "name": "string (必须, API Key 名称)",
  "expiresAt": "string (可选, 过期时间, ISO 8601 格式)"
}
```

**Request Example**:

```bash
curl -X POST http://localhost:8787/api/sites/my-blog-site/api-keys \
  -H "Authorization: Bearer ${ADMIN_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "生产环境密钥",
    "expiresAt": "2024-12-31T23:59:59.000Z"
  }'
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "api-key-123",
    "apiKey": "sk_abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx",
    "name": "生产环境密钥",
    "siteId": "my-blog-site",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-01-15T08:00:00.000Z"
  }
}
```

## Error Handling

### 创建网站接口 Error Cases

**400 Bad Request - 验证错误**

```json
{
  "success": false,
  "error": {
    "message": "网站ID必须提供",
    "code": "VALIDATION_ERROR"
  }
}
```

**409 Conflict - 网站ID已存在**

```json
{
  "success": false,
  "error": {
    "message": "具有相同ID的网站已存在",
    "code": "SITE_EXISTS"
  }
}
```

**401 Unauthorized - Admin Key 无效**

```json
{
  "success": false,
  "error": {
    "message": "无效的管理员API密钥",
    "code": "INVALID_ADMIN_KEY"
  }
}
```

### 查询网站接口 Error Cases

**401 Unauthorized - Admin Key 无效**

```json
{
  "success": false,
  "error": {
    "message": "无效的管理员API密钥",
    "code": "INVALID_ADMIN_KEY"
  }
}
```

### 创建 API Key 接口 Error Cases

**404 Not Found - 网站不存在**

```json
{
  "success": false,
  "error": {
    "message": "网站未找到",
    "code": "SITE_NOT_FOUND"
  }
}
```

**400 Bad Request - 验证错误**

```json
{
  "success": false,
  "error": {
    "message": "API Key 名称必须提供",
    "code": "VALIDATION_ERROR"
  }
}
```

**401 Unauthorized - Admin Key 无效**

```json
{
  "success": false,
  "error": {
    "message": "无效的管理员API密钥",
    "code": "INVALID_ADMIN_KEY"
  }
}
```
